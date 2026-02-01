const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { DockerAptInstaller, DockerCommandRunner, DockerGitCloner, EnvManager } = require('../lib/directives');
const dockerExec = require('../lib/docker-exec');
const { BlueGreenDeployer } = require('../lib/blueGreen');

exports.command = ['build'];
exports.desc = 'run a build based on the configuration given in the build.yaml file';

exports.builder = yargs => {
    yargs.example('$0 build --job=build --build=build.yaml', 'run the job with the name "build" using the build.yaml file');

    yargs.options({
        job: {
            describe: 'name of the job to run',
            demand: true,
            type: 'string'
        },
        build: {
            describe: 'the path to the build.yaml file',
            demand: true,
            type: 'string',
            alias: 'b',
            default: './build.yml'
        }
    });
};

async function runStep(step, globalEnv, containerId) {
    if (step.apt) {
        const env = EnvManager.merge(globalEnv, step.env || {});
        await DockerAptInstaller.run({ containerId, pkg: step.apt, env });
    } else if (step.command) {
        const env = EnvManager.merge(globalEnv, step.env || {});
        await DockerCommandRunner.run({ containerId, command: step.command, env });
    } else if (step.git) {
        const env = EnvManager.merge(globalEnv, step.env || {});
        await DockerGitCloner.run({ containerId, repo: step.git, env });
    } else if (step['blue-green']) {
        console.log('Executing blue-green deployment on the local machine…');
        await BlueGreenDeployer.run({ spec: step['blue-green'], cwd: process.cwd() });
    } else {
        throw new Error('Unknown step directive: ' + JSON.stringify(step));
    }
}

exports.handler = async argv => {
    let { job, build } = argv;

    try {
        const buildPath = path.resolve(build);
        const inventoryPath = path.join(process.cwd(), 'inventory.json');

        if (!fs.existsSync(buildPath)) {
            throw new Error(`Build file not found: ${buildPath}`);
        }
        if (!fs.existsSync(inventoryPath)) {
            throw new Error(`Inventory file not found: ${inventoryPath}`);
        }

        const buildConfig = yaml.parse(fs.readFileSync(buildPath, 'utf8'));
        const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

        if (!inventory.id) {
            throw new Error('No container ID found in inventory.json');
        }

        const containerId = inventory.id;
        const globalEnv = buildConfig.env || {};

        const lifecycle = Array.isArray(buildConfig.lifecycle) ? buildConfig.lifecycle : [];
        let jobsToRun;
        if (lifecycle.includes(job)) {
            const idx = lifecycle.indexOf(job);
            jobsToRun = lifecycle.slice(0, idx + 1);
        } else {
            jobsToRun = [job];
        }

        console.log(`Running job sequence [${jobsToRun.join(' -> ')}] in container ${containerId}`);

        for (const currentJob of jobsToRun) {
            console.log(`
► Running build job '${currentJob}'`);
            const jobSteps = buildConfig.jobs?.[currentJob];
            if (!jobSteps) {
                throw new Error(`Job '${currentJob}' not found in build.yml`);
            }
            console.log(`Found ${jobSteps.length} steps for job '${currentJob}'`);

            for (let i = 0; i < jobSteps.length; i++) {
                const step = jobSteps[i];
                console.log(`\nStep ${i + 1}/${jobSteps.length}: ${step.name || 'unnamed'}`);
                try {
                    await runStep(step, globalEnv, containerId);
                    console.log(`Step completed successfully`);
                } catch (stepError) {
                    console.error(`Step failed: ${stepError?.message || stepError}`);
                    throw stepError;
                }
            }
        }

        console.log('\nBuild completed successfully!');

    } catch (err) {
        console.error('\nBuild failed:', err?.message || err);
        process.exit(1);
    }
};
