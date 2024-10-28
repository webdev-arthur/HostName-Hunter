const args = process.argv.slice(2);

const loadConfig = () => {
    return {
        inlineIPs: args.includes('-i') ? args[args.indexOf('-i') + 1] : null,
        inputFilePath: args.includes('-iF') ? args[args.indexOf('-iF') + 1] : null,
        batchSize: args.includes('--batchSize') ? parseInt(args[args.indexOf('--batchSize') + 1], 10) : 10,
        maxConcurrentLookups: args.includes('--maxConcurrentLookups') ? parseInt(args[args.indexOf('--maxConcurrentLookups') + 1], 10) : 5,
        outputFormat: args.includes('--format') ? args[args.indexOf('--format') + 1] : null,
        // Set outputFileName only if `-o` is provided; otherwise, it should be null
        outputFileName: args.includes('-o') ? args[args.indexOf('-o') + 1] : null,
    };
};

module.exports = loadConfig;
