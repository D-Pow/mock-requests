#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const packageJson = require('../package.json');

const rootDir = path.resolve('./');
const defaultMocksDir = path.resolve(rootDir, 'mocks');

const yargs = require('yargs')
    .scriptName('mock-requests')
    .usage(`$0 v${packageJson.version}

Usage: $0 [options] <command>
    e.g. \`mock-requests -c mocks/MockConfig.js -e src/index.html webpack-dev-server\`

For more information, see https://www.npmjs.com/package/mock-requests.
`
    )
    .help('help')
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .options({
        config: {
            alias: 'c',
            default: './mocks/MockConfig.js',
            describe: 'Path to MockRequests configuration entry JavaScript file'
        },
        entry: {
            alias: 'e',
            describe: 'Path to entry index.html or index.js file'
        }
    })
    .check(argv => {
        const mockConfigDefined = fs.existsSync(argv.config);
        const entryFileDefined = fs.existsSync(argv.entry);

        if (mockConfigDefined && entryFileDefined) {
            return true;
        } else if (!mockConfigDefined && !entryFileDefined) {
            throw 'Error: Please specify a JavaScript file that configures MockRequest and the entry index.(html|js) file.'
        } else if (!mockConfigDefined) {
            throw 'Error: Please specify a JavaScript file that imports and configures MockRequests.';
        } else if (!entryFileDefined) {
            throw 'Error: Please specify the entry level index.(html|js) file.';
        }
    })
    .argv
;

console.log(yargs);
console.log('Proceeding...')
