const fs = require('fs');
const chalk = require('chalk');

// Function to print results in a dynamically sized table with color-coded output
const printTable = (results) => {
    // Determine column widths dynamically based on the longest content in each column
    const maxIpLength = Math.max(...results.map(result => result.ip.length), 'IP Address'.length);
    const maxStatusLength = Math.max(...results.map(result => result.status.length), 'Status'.length);
    const maxHostnameLength = Math.max(...results.map(result => (result.hostname || 'N/A').length), 'Hostname'.length);
    const maxIssuerLength = Math.max(...results.map(result => (result.sslCertificate?.issuer || 'N/A').length), 'Issuer'.length);
    const maxValidFromLength = Math.max(...results.map(result => (result.sslCertificate?.validFrom || 'N/A').length), 'Valid From'.length);
    const maxValidToLength = Math.max(...results.map(result => (result.sslCertificate?.validTo || 'N/A').length), 'Valid To'.length);
    const maxServerLength = Math.max(...results.map(result => (result.headers?.server || 'N/A').length), 'Server'.length);
    const maxLocationLength = Math.max(...results.map(result => (result.headers?.location || 'N/A').length), 'Location'.length);

    // Define the table divider based on column widths
    const divider = `+${'-'.repeat(maxIpLength + 2)}+${'-'.repeat(maxStatusLength + 2)}+${'-'.repeat(maxHostnameLength + 2)}+${'-'.repeat(maxIssuerLength + 2)}+${'-'.repeat(maxValidFromLength + 2)}+${'-'.repeat(maxValidToLength + 2)}+${'-'.repeat(maxServerLength + 2)}+${'-'.repeat(maxLocationLength + 2)}+`;
    console.log(chalk.cyan(divider));

    // Print the header
    console.log(
        chalk.cyan(`| ${'IP Address'.padEnd(maxIpLength)} | ${'Status'.padEnd(maxStatusLength)} | ${'Hostname'.padEnd(maxHostnameLength)} | ${'Issuer'.padEnd(maxIssuerLength)} | ${'Valid From'.padEnd(maxValidFromLength)} | ${'Valid To'.padEnd(maxValidToLength)} | ${'Server'.padEnd(maxServerLength)} | ${'Location'.padEnd(maxLocationLength)} |`)
    );
    console.log(chalk.cyan(divider));

    // Print each row with color-coded status
    results.forEach(result => {
        const statusColor = result.status === 'Success' ? chalk.green : chalk.red;
        const issuer = result.sslCertificate?.issuer || 'N/A';
        const validFrom = result.sslCertificate?.validFrom || 'N/A';
        const validTo = result.sslCertificate?.validTo || 'N/A';
        const server = result.headers?.server || 'N/A';
        const location = result.headers?.location || 'N/A';

        console.log(
            `| ${result.ip.padEnd(maxIpLength)} | ${statusColor(result.status.padEnd(maxStatusLength))} | ${(result.hostname || 'N/A').padEnd(maxHostnameLength)} | ${issuer.padEnd(maxIssuerLength)} | ${validFrom.padEnd(maxValidFromLength)} | ${validTo.padEnd(maxValidToLength)} | ${server.padEnd(maxServerLength)} | ${location.padEnd(maxLocationLength)} |`
        );
    });

    console.log(chalk.cyan(divider));
};


// Function to save results as CSV
const saveAsCSV = (data, filePath) => {
    const csvData = data.map(row => row.join(',')).join('\n');
    fs.writeFileSync(filePath, csvData);
    console.log(`Results saved in CSV format at: ${filePath}`);
};

// Function to save results as JSON
const saveAsJSON = (data, filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Results saved in JSON format at: ${filePath}`);
};

// Function to save results as XML
const saveAsXML = (data, filePath) => {
    let xmlData = `<?xml version="1.0" encoding="UTF-8"?>\n<results>\n`;
    data.forEach(row => {
        xmlData += `  <result>\n`;
        xmlData += `    <ip>${row[0]}</ip>\n`;
        xmlData += `    <status>${row[1]}</status>\n`;
        xmlData += `    <hostname>${row[2]}</hostname>\n`;
        xmlData += `  </result>\n`;
    });
    xmlData += `</results>`;
    fs.writeFileSync(filePath, xmlData);
    console.log(`Results saved in XML format at: ${filePath}`);
};

// Function to save results as HTML
const saveAsHTML = (results, outputFileName) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HostHunter Results</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f4f4f4; }
    </style>
</head>
<body>
    <h1>HostHunter Results</h1>
    <table>
        <thead>
            <tr>
                <th>IP Address</th>
                <th>Status</th>
                <th>Hostname</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(result => `
                <tr>
                    <td>${result.ip || 'N/A'}</td>
                    <td>${result.status || 'N/A'}</td>
                    <td>${result.hostname || 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `;
    fs.writeFileSync(outputFileName, htmlContent);
    console.log(chalk.green(`Results saved to ${outputFileName}`));
};


const saveResults = (data, format = 'table', filePath = null) => {
    switch (format) {
        case 'json':
            if (filePath) saveAsJSON(data, filePath);
            else console.log(JSON.stringify(data, null, 2));
            break;
        case 'xml':
            if (filePath) saveAsXML(data, filePath);
            else console.log("XML output requires a file path.");
            break;
        case 'html':
            if (filePath) saveAsHTML(data, filePath);
            else console.log("HTML output requires a file path.");
            break;
        case 'csv':
            if (filePath) saveAsCSV(data, filePath);
            else console.log("CSV output requires a file path.");
            break;
        case 'table':
        default:
            printTable(data);
            break;
    }
};

module.exports = { saveResults };