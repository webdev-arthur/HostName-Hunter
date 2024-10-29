const { displayBanner } = require("./src/core/banner");
const loadConfig = require("./src/core/config");
const { loadInputData } = require("./src/core/inputHandler");
const { processInBatches } = require("./src/core/dnsLookup");
const printTable = require('./output/outputFormatter').printTable;

// Import output functions
const saveToCSV = require("./output/saveToCSV");
const saveToHTML = require("./output/saveToHTML");
const saveToJSON = require("./output/saveToJSON");

const config = loadConfig();

// Conditionally require plugins based on config
if (config.plugins.geolocation) {
    const { performGeolocationLookup } = require("./plugins/geoLookup");
    // Use geolocation plugin if enabled
}
if (config.plugins.dnsLookup) {
    // Any specific DNS plugin handling or setup if required
}

(async () => {
    displayBanner();
    const ipAddresses = await loadInputData(config);

    if (ipAddresses.length === 0) {
        console.error("No IP addresses provided. Use -i <IP-Address> or -iF <File-Path>.");
        process.exit(1);
    }

    console.log(`Starting HostName Hunter with ${ipAddresses.length} IPs, batch size ${config.batchSize}, and concurrency ${config.maxConcurrentLookups}...`);

    const results = await processInBatches(ipAddresses, config.batchSize, config.maxConcurrentLookups);

    if (!config.outputFormat) {
        printTable(results);
    } else {
        switch (config.outputFormat) {
            case "csv":
                if (config.outputFileName) {
                    saveToCSV(results, config.outputFileName);
                    console.log(`Results saved to ${config.outputFileName}`);
                } else {
                    printTable(results);
                }
                break;
            case "html":
                if (config.outputFileName) {
                    saveToHTML(results, config.outputFileName);
                    console.log(`Results saved to ${config.outputFileName}`);
                } else {
                    saveToHTML(results);
                }
                break;
            case "json":
                if (config.outputFileName) {
                    saveToJSON(results, config.outputFileName);
                    console.log(`Results saved to ${config.outputFileName}`);
                } else {
                    console.log("JSON Output:");
                    console.log(JSON.stringify(results, null, 2));
                }
                break;
            default:
                console.warn(`Unknown format "${config.outputFormat}". Defaulting to table output.`);
                printTable(results);
        }
    }
})();
