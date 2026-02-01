const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function dockerExec(containerId, command) {
    const encodedCommand = Buffer.from(command).toString('base64');
    
    const dockerCommand = `docker exec ${containerId} bash -c "echo ${encodedCommand} | base64 --decode | bash"`;
    
    console.log(`[DEBUG] Executing in ${containerId}: ${command.substring(0, 50)}...`);
    
    try {
        const { stdout, stderr } = await execPromise(dockerCommand);
        if (stdout) console.log('[DEBUG] Output:', stdout);
        if (stderr) console.error('[DEBUG] Errors:', stderr);
        return { stdout, stderr };
    } catch (error) {
        console.error('[ERROR] Execution failed:', error.message);
        throw error;
    }
}

module.exports = dockerExec;