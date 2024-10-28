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
const processBatch = async (batch, maxConcurrentLookups) => {
    const lookupPromises = batch.map(ip => performDnsLookup(ip));
    const results = [];

    while (lookupPromises.length > 0) {
        const currentLookups = lookupPromises.splice(0, maxConcurrentLookups);
        const batchResults = await Promise.all(currentLookups);
        results.push(...batchResults);
    }
    return results;
};

// Processes IP addresses in batches
const processInBatches = async (ipAddresses, batchSize, maxConcurrentLookups) => {
    const allResults = [];
    const batches = createBatches(ipAddresses, batchSize);

    for (let i = 0; i < batches.length; i++) {
        console.log(`Processing batch ${i + 1} of ${batches.length}...`); // Optional for debugging
        const batchResults = await processBatch(batches[i], maxConcurrentLookups);
        allResults.push(...batchResults);
    }
    return allResults;
};

module.exports = { processInBatches };
