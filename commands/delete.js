const ArvanProvider = require('../providers/arvan');

exports.command = ['delete'];
exports.desc = 'Delete a cloud instance by name';

exports.builder = yargs => {
    yargs.options({
        provider: {
            describe: 'Set the cloud-instance provider to use',
            demand: false,
            type: 'string',
            default: 'arvan'
        },
        name: {
            describe: 'Name of the VM to delete',
            demand: true,
            type: 'string',
            default: 'name'
        },
        region: {
            describe: 'Region of the VM',
            demand: false,
            type: 'string',
            default: 'ir-thr-ba1'
        }
    });
};

exports.handler = async argv => {
    let { provider, name, region } = argv;

    try {
        if (provider !== 'arvan') {
            throw new Error(`The provider ${provider} is not supported yet.`);
        }
        const arvanProvider = new ArvanProvider({ token: process.env.ARVAN_TOKEN });
        console.log(`Searching for instance: ${name}...`);
        if (!arvanProvider) {
            throw new Error(`No instance found with name: ${name}`);
        }

        console.log(`Deleting instance: ${name}...`);
        await arvanProvider.delete(name, region);
        console.log(`Instance ${name} deleted successfully!`);
    } catch (error) {
        console.error(error.message);
    }
};
