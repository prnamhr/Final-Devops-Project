const DockerProvider = require('../providers/docker');
const fs = require('fs');
const path = require('path');

exports.command = ['provision'];
exports.desc = 'Provision a new Docker container';

exports.builder = yargs => {
    yargs.example('$0 provision --name mycontainer --image ubuntu:22.04');

    yargs.options({
        name: {
            describe: 'The name of the container to create',
            demand: false,
            type: 'string',
            default: 'devops-container'
        },
        image: {
            describe: 'The Docker image to use',
            demand: false,
            type: 'string',
            default: 'ubuntu:22.04'
        }
    });
};

exports.handler = async argv => {
    const { name, image } = argv;

    try {
        const dockerProvider = new DockerProvider();
        console.log('Provisioning Docker container...');
        const container = await dockerProvider.create({ name, image });

        const inventoryPath = path.join(process.cwd(), 'inventory.json');
        const inventory = {
            id: container.id,
            name: container.name,
            type: 'docker',
            image: image
        };

        fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
        console.log(`Container ID: ${container.id}`);
        console.log(`Container Name: ${container.name}`);
        console.log('Inventory updated at inventory.json');
        console.log('Done!');
    } catch (error) {
        console.error('Provisioning failed:', error.message);
    }
};