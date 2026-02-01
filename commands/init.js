const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const provisionCommand = require('./provision.js');
const { DockerAptInstaller, DockerCommandRunner, DockerGitCloner, EnvManager } = require('../lib/directives');

exports.command = ['init'];
exports.desc = 'Initialize the Docker container and run setup from build.yml';

exports.builder = yargs => {
    yargs.example('$0 init --build=build.yaml', 'provision and setup the build environment using the setup section of given build.yaml file');

    yargs.options({
        build: {
            describe: 'the path to the build.yaml file',
            demand: true,
            type: 'string',
            alias: 'b',
            default: './build.yml'
        }
    });
};

exports.handler = async argv => {
    let { build } = argv;

    await provisionCommand.handler({});

    const inventoryPath = path.join(process.cwd(), 'inventory.json');
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    const containerId = inventory.id;

    console.log(`Container ${containerId} is ready!`);

    const buildYamlContent = await fs.promises.readFile(build, 'utf8');
    const buildYamlContentParsed = yaml.parse(buildYamlContent);

    const globalEnv = buildYamlContentParsed.env || {};

    for (const setup of buildYamlContentParsed.setup) {
        if (setup.command) {
            const env = EnvManager.merge(globalEnv, setup.env || {});
            await DockerCommandRunner.run({ containerId, command: setup.command, env });
        }
        else if (setup.apt) {
            const env = EnvManager.merge(globalEnv, setup.env || {});
            await DockerAptInstaller.run({ containerId, pkg: setup.apt, env });
        }
        else if (setup.git) {
            const env = EnvManager.merge(globalEnv, setup.env || {});
            await DockerGitCloner.run({ containerId, repo: setup.git, env });
        }
        else {
            console.error('unknown setup command');
        }
    }
};