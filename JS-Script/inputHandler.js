const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Parsing the command-line arguments manually
const args = process.argv.slice(2);
let inlineIPs = null;
let filePath = null;

// Custom function to parse arguments without minimist
for (let i = 0; i < args.length; i++) {
    if (args[i] === '-i' && args[i + 1]) {
        inlineIPs = args[i + 1];
        i++; // Skip the next item since it's the value
    } else if (args[i] === '-iF' && args[i + 1]) {
        filePath = args[i + 1];
        i++; // Skip the next item since it's the value
    }
}

const loadIpsFromInput = (inlineIPs) => {
    return inlineIPs.split(',').map(ip => ip.trim()).filter(Boolean);
};

const loadIpsFromFile = (filePath) => {
    try {
        const resolvedPath = path.resolve(filePath);
        if (!fs.existsSync(resolvedPath)) {
            console.error(chalk.red(`File not found: ${resolvedPath}`));
            process.exit(1);
        }

        const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
        return fileContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    } catch (error) {
        console.error(chalk.red(`Error reading file: ${error.message}`));
        process.exit(1);
    }
};

const processInput = (inlineIPs, filePath) => {
    let ipAddresses = [];

    if (inlineIPs) {
        console.log(chalk.blue("Loading IPs from inline input..."));
        ipAddresses = loadIpsFromInput(inlineIPs);
    } else if (filePath) {
        // console.log(chalk.blue(`Attempting to load IPs from file path: ${filePath}`));
        ipAddresses = loadIpsFromFile(filePath);
    } else {
        console.error(chalk.red("No IP addresses provided. Use inline input or provide a file path."));
        process.exit(1);
    }

    if (ipAddresses.length === 0) {
        console.error(chalk.red("No valid IP addresses found in the input."));
        process.exit(1);
    }

    // console.log(chalk.green("Loaded IP addresses:"), ipAddresses);
    return ipAddresses;
};

// Call processInput with parsed arguments
const ipAddresses = processInput(inlineIPs, filePath);

module.exports = { ipAddresses };
