// outputFormatter.js
const fs = require('fs');

const saveAsCSV = (data, filePath) => {
    const csvData = data.map(row => row.join(',')).join('\n');
    fs.writeFileSync(filePath, csvData);
    console.log(`Results saved in CSV format at: ${filePath}`);
};

const saveAsJSON = (data, filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Results saved in JSON format at: ${filePath}`);
};

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

function saveAsHTML(results, outputFileName) {
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
}


const saveResults = (data, format, filePath) => {
    switch (format) {
        case 'json': return saveAsJSON(data, filePath);
        case 'xml': return saveAsXML(data, filePath);
        case 'html': return saveAsHTML(data, filePath);
        case 'csv':
        default: return saveAsCSV(data, filePath);
    }
};

module.exports = { saveResults };
