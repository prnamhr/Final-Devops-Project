#!/usr/bin/env node
const yargs = require('yargs');
const { version } = require('./package.json');
const { exit } = require('yargs');

// init dotenv to load the environment variables from the .env file
require('dotenv').config();

yargs
    .commandDir('./commands')
    .version()
    .epilog(version ? `Version: ${version}` : '')
    .demandCommand(1, 'Did you forget to specify a command?')
    .recommendCommands()
    .showHelpOnFail(false, 'Specify --help for available options')
    .strict(true)
    .help()
    .wrap(yargs.terminalWidth())
    .argv

