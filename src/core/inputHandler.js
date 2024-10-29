const fs = require('fs');
const path = require('path');

const loadInputData = async (config) => {
    let ipAddresses = [];

    // Parse inline IPs if provided
    if (config.inlineIPs) {
        ipAddresses = config.inlineIPs.split(',').map(ip => ip.trim());
    }

    // Parse IPs from file if file path is provided
    if (config.inputFilePath) {
        const filePath = path.resolve(config.inputFilePath);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const fileIPs = fileContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        ipAddresses = ipAddresses.concat(fileIPs);
    }

    // Validate if we have IP addresses after parsing
    if (ipAddresses.length === 0) {
        console.error("No IP addresses provided. Use inline input or provide a file path.");
        process.exit(1);
    }

    return ipAddresses;
};

module.exports = { loadInputData };
