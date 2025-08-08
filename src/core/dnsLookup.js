import dns from 'dns/promises';

/**
 * Performs a reverse DNS lookup for a single IP address with a retry mechanism.
 * @param {string} ip - The IP address to look up.
 * @param {number} [retries=3] - The number of times to retry on failure.
 * @returns {Promise<object>} A promise that resolves with the lookup result.
 */
async function performDnsLookup(ip, retries = 3) {
  try {
    const hostnames = await dns.reverse(ip);
    return { ip, status: 'Success', hostname: hostnames.join(', ') };
  } catch (err) {
  
    if (retries > 0) {
      return performDnsLookup(ip, retries - 1);
    }
    return { ip, status: 'Failed', hostname: 'N/A', error: err.message };
  }
}

/**
 * Processes a list of IP addresses concurrently using a worker pool pattern.
 *
 * This function ensures that no more than `maxConcurrentLookups` are running at any given moment.
 *
 * @param {string[]} ipAddresses - An array of IP addresses to process.
 * @param {number} maxConcurrentLookups - The maximum number of lookups to run in parallel.
 * @returns {Promise<object[]>} A promise that resolves to an array of all lookup results.
 */
export async function processInBatches(ipAddresses, maxConcurrentLookups) {
  const results = [];
  const ipQueue = [...ipAddresses]; 

  const run = async () => {
    if (ipQueue.length === 0) {
      return;
    }

    const ip = ipQueue.shift(); 
    const result = await performDnsLookup(ip);
    results.push(result);

    await run();
  };

 
  const activeWorkers = [];
  const workerCount = Math.min(ipAddresses.length, maxConcurrentLookups);

 
  for (let i = 0; i < workerCount; i++) {
    activeWorkers.push(run());
  }

  
  await Promise.all(activeWorkers);

  return results;
}