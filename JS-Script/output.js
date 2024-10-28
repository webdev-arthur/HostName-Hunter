const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const printTable = (results) => {
    if (results.length === 0) {
        console.log(chalk.yellow("No results to display."));
        return;
    }

    // Determine the maximum column widths
    const maxIpLength = Math.max(...results.map(row => row.ip.length), 'IP Address'.length);
    const maxStatusLength = Math.max(...results.map(row => row.status.length), 'Status'.length);
    const maxHostnameLength = Math.max(...results.map(row => row.hostname.length), 'Hostname'.length);

    // Construct row separator based on column widths
    const rowSeparator = `+${'-'.repeat(maxIpLength + 2)}+${'-'.repeat(maxStatusLength + 2)}+${'-'.repeat(maxHostnameLength + 2)}+`;

    // Print table header
    console.log(rowSeparator);
    console.log(`| ${'IP Address'.padEnd(maxIpLength)} | ${'Status'.padEnd(maxStatusLength)} | ${'Hostname'.padEnd(maxHostnameLength)} |`);
    console.log(rowSeparator);

    // Print each row with color-coded status
    results.forEach(({ ip, status, hostname }) => {
        const colorStatus = status === 'Success' 
            ? chalk.green(status.padEnd(maxStatusLength)) 
            : chalk.red(status.padEnd(maxStatusLength));

        console.log(`| ${ip.padEnd(maxIpLength)} | ${colorStatus} | ${hostname.padEnd(maxHostnameLength)} |`);
        console.log(rowSeparator);
    });
};

const saveToCSV = (results, outputFileName) => {
    const csvData = results.map(({ ip, status, hostname }) => `${ip},${status},${hostname}`).join('\n');
    const filePath = path.resolve(outputFileName);
    fs.writeFileSync(filePath, csvData);
    console.log(chalk.green(`Results saved to ${filePath}`));
};

module.exports = { printTable, saveToCSV };
