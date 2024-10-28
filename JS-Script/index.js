const { displayBanner } = require('./banner');
const loadConfig = require('./config');
const { loadInputData } = require('./inputHandler');
const { processInBatches } = require('./dnsLookup');
const { printTable, saveToCSV, saveToHTML, saveToJSON } = require('./output');

const config = loadConfig();

(async () => {
    displayBanner();

    const ipAddresses = await loadInputData(config);

    if (ipAddresses.length === 0) {
        console.error("No IP addresses provided. Use -i <IP-Address> or -iF <File-Path>.");
        process.exit(1);
    }

    console.log(`Starting HostHunter with ${ipAddresses.length} IPs, batch size ${config.batchSize}, and concurrency ${config.maxConcurrentLookups}...`);

    const results = await processInBatches(ipAddresses, config.batchSize, config.maxConcurrentLookups);

    // Determine output format based on config
    if (!config.outputFormat) {
        // No output format specified, default to table output
        printTable(results);
    } else {
        // Output format is specified
        switch (config.outputFormat) {
            case 'csv':
                if (config.outputFileName) {
                    saveToCSV(results, config.outputFileName);
                    console.log(`Results saved to ${config.outputFileName}`);
                } else {
                    printTable(results); // Show in terminal if no file name provided
                }
                break;
            case 'html':
                if (config.outputFileName) {
                    saveToHTML(results, config.outputFileName);
                    console.log(`Results saved to ${config.outputFileName}`);
                } else {
                    saveToHTML(results); // Display as HTML in terminal if no file name
                }
                break;
            case 'json':
                if (config.outputFileName) {
                    saveToJSON(results, config.outputFileName);
                    console.log(`Results saved to ${config.outputFileName}`);
                } else {
                    console.log("JSON Output:");
                    console.log(JSON.stringify(results, null, 2)); // Display JSON in terminal if no file name
                }
                break;
            default:
                // If format is unknown, fallback to table output
                console.warn(`Unknown format "${config.outputFormat}". Defaulting to table output.`);
                printTable(results);
        }
    }
})();
