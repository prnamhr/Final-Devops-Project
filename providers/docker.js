const Docker = require('dockerode');
const path = require('path');
const fs = require('fs');

class DockerProvider {
    constructor() {
        this.docker = new Docker();
    }

    async create({ name, image = 'ubuntu:22.04' }) {
        try {
            await new Promise((resolve, reject) => {
                this.docker.pull(image, (err, stream) => {
                    if (err) return reject(err);

                    this.docker.modem.followProgress(stream, (err, res) =>
                        err ? reject(err) : resolve(res)
                    );
                });
            });


            const container = await this.docker.createContainer({
                Image: image,
                name: `devops-${name}-${Date.now()}`,
                HostConfig: {
                    PortBindings: {
                        '2368/tcp': [{ HostPort: '2368' }] // For Ghost
                    }
                },
                Tty: true,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                Cmd: ['/bin/bash'] 
            });

   
            await container.start();

      
            const info = await container.inspect();

            return {
                id: info.Id,
                name: info.Name.replace(/^\//, ''),
                status: info.State.Status,
                ip: 'localhost'
            };
        } catch (error) {
            console.error('Docker error:', error.message);
            throw error;
        }
    }

    async delete(containerId) {
        try {
            const container = this.docker.getContainer(containerId);
            await container.stop();
            await container.remove();
            return true;
        } catch (error) {
            console.error('Docker error:', error.message);
            return false;
        }
    }
}

module.exports = DockerProvider;