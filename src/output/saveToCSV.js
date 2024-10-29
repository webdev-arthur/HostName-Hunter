// saveToCSV.js
const fs = require('fs');
const path = require('path');

function saveToCSV(results, outputFileName) {
    const csvData = results.map(row => row.join(',')).join('\n');
    const filePath = path.resolve(outputFileName || 'output.csv');
    fs.writeFileSync(filePath, csvData);
    console.log(`Results saved in CSV format at: ${filePath}`);
}

module.exports = saveToCSV;
