import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../config/settings.json');
const settings = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const defaults = settings.defaults;

/**
 * Sets up and configures the yargs command-line argument parser.
 * @returns {object} The configured yargs instance.
 */
export function setupYargs() {
  return yargs(hideBin(process.argv))
    .usage('Usage: node index.js [options]')
    .option('i', {
      alias: ['inlineIPs', 'ip'], 
      describe: 'Input IP addresses (e.g., "8.8.8.8,1.1.1.1")',
      type: 'string',
    })
    .option('iF', {
      alias: ['inputFilePath', 'file', 'f'],
      describe: 'Specify a file containing IP addresses',
      type: 'string',
    })
    .option('o', {
      alias: 'outputFileName',
      describe: 'Specify output file name (e.g., results.json)',
      type: 'string',
    })
    .option('v', {
      alias: 'verbose',
      describe: 'Enable verbose output for table view',
      type: 'boolean',
      default: false
    })
    .option('batchSize', {
      describe: 'Set the batch size for DNS lookups',
      type: 'number',
      default: defaults.batchSize,
    })
    .option('maxConcurrentLookups', {
      describe: 'Define max concurrent lookups',
      type: 'number',
      default: defaults.maxConcurrentLookups,
    })
    .help('h')
    .alias('h', 'help')
    .strict()
    .group(['i', 'iF'], 'Input Options:')
    .group(['o', 'format', 'v'], 'Output Options:')
    .group(['batchSize', 'maxConcurrentLookups'], 'Performance Options:')
    .conflicts('i', 'iF')
    .check((argv) => {
        if (!argv.h && !argv.help && !argv.i && !argv.iF) {
            throw new Error('You must provide an input source with --ip or --file.');
        }
        return true;
    })
    .epilog('Happy hunting!');
}