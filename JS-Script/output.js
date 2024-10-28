const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const printTable = (results) => {
    if (results.length === 0) {
        console.log(chalk.yellow("No results to display."));
        return;
    }

    // Determine column widths
    const ipWidth = Math.max('IP Address'.length, ...results.map(row => row.ip.length));
    const statusWidth = Math.max('Status'.length, ...results.map(row => row.status.length));
    const hostnameWidth = Math.max('Hostname'.length, ...results.map(row => row.hostname.length));

    // Print header
    const separator = `+${'-'.repeat(ipWidth + 2)}+${'-'.repeat(statusWidth + 2)}+${'-'.repeat(hostnameWidth + 2)}+`;
    console.log(separator);
    console.log(`| ${'IP Address'.padEnd(ipWidth)} | ${'Status'.padEnd(statusWidth)} | ${'Hostname'.padEnd(hostnameWidth)} |`);
    console.log(separator);

    // Print rows
    results.forEach(row => {
        const statusColor = row.status === 'Success' ? chalk.green : chalk.red;
        console.log(`| ${row.ip.padEnd(ipWidth)} | ${statusColor(row.status.padEnd(statusWidth))} | ${row.hostname.padEnd(hostnameWidth)} |`);
        console.log(separator);
    });
};

const saveToCSV = (results, outputFileName) => {
    const csvData = ['IP Address,Status,Hostname', ...results.map(row => `${row.ip},${row.status},${row.hostname}`)].join('\n');
    const filePath = path.resolve(outputFileName || 'output.csv');
    fs.writeFileSync(filePath, csvData);
    console.log(chalk.green(`Results saved to ${filePath}`));
};

const saveToHTML = (results, outputFileName) => {
    const htmlData = `
        <html>
        <head>
            <title>HostName Hunter Results</title>
            <style>
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>HostName Hunter Results</h2>
            <table>
                <tr><th>IP Address</th><th>Status</th><th>Hostname</th></tr>
                ${results.map(row => `<tr><td>${row.ip}</td><td>${row.status}</td><td>${row.hostname}</td></tr>`).join('')}
            </table>
        </body>
        </html>
    `;
    const filePath = path.resolve(outputFileName || 'output.html');
    fs.writeFileSync(filePath, htmlData);
    console.log(chalk.green(`Results saved to ${filePath}`));
};

const saveToJSON = (results, outputFileName) => {
    const jsonData = JSON.stringify(results, null, 2);
    const filePath = path.resolve(outputFileName || 'output.json');
    fs.writeFileSync(filePath, jsonData);
    console.log(chalk.green(`Results saved to ${filePath}`));
};

module.exports = { printTable, saveToCSV, saveToHTML, saveToJSON };
