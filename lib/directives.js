const dockerExec = require('./docker-exec');

class EnvManager {
    static merge(globalEnv, stepEnv) {
        return { ...globalEnv, ...stepEnv };
    }

    static toExportString(envObj) {
        if (!envObj || Object.keys(envObj).length === 0) return '';
        return Object.entries(envObj)
            .map(([k, v]) => `export ${k}='${v}'`)
            .join(' && ');
    }
}

class DockerAptInstaller {
    static async run({ containerId, pkg, env }) {
        console.log(`Installing packages: ${pkg}`);
        const envStr = EnvManager.toExportString(env);
        const cmd = envStr ?
            `${envStr} && apt-get update -qq && apt-get install -y ${pkg}` :
            `apt-get update -qq && apt-get install -y ${pkg}`;
        await dockerExec(containerId, cmd);
    }
}

class DockerCommandRunner {
    static async run({ containerId, command, env }) {
        const envStr = EnvManager.toExportString(env);
        const fullCommand = envStr ? `${envStr} && ${command}` : command;
        return dockerExec(containerId, fullCommand);
    }
}

class DockerGitCloner {
    static async run({ containerId, repo, env }) {
        const clonePath = env.GIT_CLONE_PATH || '/Ghost';
        console.log(`Cloning ${repo} to ${clonePath}`);

        await dockerExec(containerId, `
            if [ -d "${clonePath}" ]; then
                echo "Removing existing directory...";
                rm -rf ${clonePath};
            fi;
            git clone ${repo} ${clonePath} && \
            echo "Clone successful" && \
            ls -la ${clonePath}
        `);
    }
}

module.exports = {
    DockerAptInstaller,
    DockerCommandRunner,
    DockerGitCloner,
    EnvManager
};