const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

const loadConfig = () => {
    const config = {
        inlineIPs: args.includes('-i') ? args[args.indexOf('-i') + 1] : null,
        inputFilePath: args.includes('-iF') ? args[args.indexOf('-iF') + 1] : null,
        batchSize: args.includes('--batchSize') ? parseInt(args[args.indexOf('--batchSize') + 1], 10) : 10,
        maxConcurrentLookups: args.includes('--maxConcurrentLookups') ? parseInt(args[args.indexOf('--maxConcurrentLookups') + 1], 10) : 5,
        outputFormat: args.includes('--format') ? args[args.indexOf('--format') + 1] : null,
        outputFileName: args.includes('-o') ? args[args.indexOf('-o') + 1] : null,
        plugins: {} 
    };

    const configPath = path.resolve(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        Object.assign(config.plugins, fileConfig.plugins || {});
    }

    return config;
};

module.exports = loadConfig;
