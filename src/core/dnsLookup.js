const dns = require('dns').promises; 

// Helper function to create batches without external dependencies
const createBatches = (array, batchSize) => {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
        batches.push(array.slice(i, i + batchSize));
    }
    return batches;
};

// Function to perform DNS lookup with retries
const performDnsLookup = async (ip, retries = 3) => {
    try {
        const hostnames = await dns.reverse(ip);
        return { ip, status: 'Success', hostname: hostnames.join(', ') };
    } catch (err) {
        if (retries > 0) {
            return performDnsLookup(ip, retries - 1);
        }
        return { ip, status: 'Failed', hostname: `Error: ${err.message}` };
    }
};

// Processes a batch of lookups with a set concurrency limit
const processBatch = async (batch, maxConcurrentLookups, debug = false) => {
    const lookupPromises = batch.map(ip => performDnsLookup(ip));
    const results = [];
    const startTime = Date.now();

    while (lookupPromises.length > 0) {
        const currentLookups = lookupPromises.splice(0, maxConcurrentLookups);
        const batchResults = await Promise.all(currentLookups);
        results.push(...batchResults);
    }

    if (debug) {
        const endTime = Date.now();
        const batchTime = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`Batch processed with ${results.length} results in ${batchTime} seconds.`);
    }

    return results;
};

// Processes IP addresses in batches
const processInBatches = async (ipAddresses, batchSize, maxConcurrentLookups, debug = false) => {
    const allResults = [];
    const batches = createBatches(ipAddresses, batchSize);

    for (let i = 0; i < batches.length; i++) {
        if (debug) {
            console.log(`Processing batch ${i + 1} of ${batches.length}...`);
        }
        const batchResults = await processBatch(batches[i], maxConcurrentLookups, debug);
        allResults.push(...batchResults);
    }

    return allResults;
};

module.exports = { processInBatches };
