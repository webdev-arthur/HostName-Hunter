const loadConfig = () => {
    let batchSize = 10;
    let maxConcurrentLookups = 5;
    let outputFileName = 'output.csv';

    // Manual argument parsing for batchSize, maxConcurrentLookups, and output file name
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--batchSize' && args[i + 1]) {
            batchSize = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '--maxConcurrentLookups' && args[i + 1]) {
            maxConcurrentLookups = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '-o' && args[i + 1]) {
            outputFileName = args[i + 1];
            i++;
        }
    }

    return { batchSize, maxConcurrentLookups, outputFileName };
};

module.exports = { loadConfig };
