const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

const loadConfig = () => {
    // Load basic config from command-line arguments
    const config = {
        inlineIPs: args.includes('-i') ? args[args.indexOf('-i') + 1] : null,
        inputFilePath: args.includes('-iF') ? args[args.indexOf('-iF') + 1] : null,
        batchSize: args.includes('--batchSize') ? parseInt(args[args.indexOf('--batchSize') + 1], 10) : 10,
        maxConcurrentLookups: args.includes('--maxConcurrentLookups') ? parseInt(args[args.indexOf('--maxConcurrentLookups') + 1], 10) : 5,
        outputFormat: args.includes('--format') ? args[args.indexOf('--format') + 1] : null,
        outputFileName: args.includes('-o') ? args[args.indexOf('-o') + 1] : null,
        plugins: {} // Initialize plugins as an empty object
    };

    // Load additional plugin settings from config.json if available
    const configPath = path.resolve(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        // Merge file config into command-line config, giving priority to command-line args
        Object.assign(config.plugins, fileConfig.plugins || {});
    }

    return config;
};

module.exports = loadConfig;
