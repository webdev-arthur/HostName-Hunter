const { displayBanner } = require("./src/core/banner");
const loadConfig = require("./src/core/config");
const { loadInputData } = require("./src/core/inputHandler");
const { processInBatches } = require("./src/core/dnsLookup");
const { saveResults } = require('./src/output/outputFormatter');

// Check for help argument first
const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
    console.log(`
Usage: node index.js [options]

Options:
  -i <IP-Addresses>             Input IP addresses (comma-separated if multiple)
  -iF <File-Path>               Specify a file containing IP addresses
  -o <Output-Filename>          Specify output file name (supports CSV, JSON, HTML, XML)
  --format <csv|json|html|xml>  Define the output format
  --batchSize <number>          Set the batch size for DNS lookups
  --maxConcurrentLookups <number> Define max concurrent lookups for optimized performance
  -h, --help                    Display this help message
    `);
    process.exit(0);
}

// Proceed with the rest of the setup if help argument isn't provided
const config = loadConfig();
displayBanner();

(async () => {
    const ipAddresses = await loadInputData(config);

    if (ipAddresses.length === 0) {
        console.error("No IP addresses provided. Use inline input or provide a file path.");
        process.exit(1);
    }

    console.log(`Starting HostName Hunter with ${ipAddresses.length} IPs, batch size ${config.batchSize}, and concurrency ${config.maxConcurrentLookups}...`);

    const results = await processInBatches(ipAddresses, config.batchSize, config.maxConcurrentLookups);

    if (!config.outputFormat) {
        saveResults(results, 'table');
    } else {
        saveResults(results, config.outputFormat, config.outputFileName);
    }
})();
