const { displayBanner } = require('./banner');
const { loadConfig } = require('./config');
const { ipAddresses } = require('./inputHandler');
const { processInBatches } = require('./dnsLookup');
const { printTable, saveToCSV } = require('./output');

const config = loadConfig();

(async () => {
    displayBanner();

    if (ipAddresses.length === 0) {
        console.error("No IP addresses provided. Use -i <IP-Address> or -iF <File-Path>.");
        process.exit(1);
    }

    // console.log(`Starting HostHunter with ${ipAddresses.length} IPs, batch size ${config.batchSize}, and concurrency ${config.maxConcurrentLookups}...`);

    const results = await processInBatches(ipAddresses, config.batchSize, config.maxConcurrentLookups);
    printTable(results);

    // Save to CSV if output filename is provided
    if (config.outputFileName) {
        saveToCSV(results, config.outputFileName);
    }
})();
