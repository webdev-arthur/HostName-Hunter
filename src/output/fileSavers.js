import fs from 'fs';
import chalk from 'chalk';

// --- Utility to flatten data for simple formats ---
const flattenData = (results) => {
  return results.map(result => ({
    ip: result.ip,
    status: result.status,
    hostname: result.hostname || 'N/A',
    server: result.headers?.server || 'N/A',
    location: result.headers?.location || 'N/A',
    ssl_issuer: result.sslCertificate?.issuer || 'N/A',
    ssl_valid_from: result.sslCertificate?.validFrom || 'N/A',
    ssl_valid_to: result.sslCertificate?.validTo || 'N/A',
  }));
};

const saveAsJSON = (data, filePath) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(chalk.green(`\n💾 Results saved in JSON format at: ${filePath}`));
};

const saveAsCSV = (data, filePath) => {
    const flatData = flattenData(data);
    if (flatData.length === 0) return;
    
    const headers = Object.keys(flatData[0]).join(',');
    const rows = flatData.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    fs.writeFileSync(filePath, csvContent);
    console.log(chalk.green(`\n💾 Results saved in CSV format at: ${filePath}`));
};

// ... other save functions (XML, HTML) can be added here following the same pattern.

export const saveResults = (data, format, filePath) => {
    switch (format) {
        case 'json':
            saveAsJSON(data, filePath);
            break;
        case 'csv':
            saveAsCSV(data, filePath);
            break;
        // Add other cases here
        default:
            // If the format is 'card' or 'table', it's handled by terminalViews,
            // but if an output file is specified, default to JSON.
            if (filePath) {
                 console.log(chalk.yellow(`\nOutput format for file not specified, defaulting to JSON.`));
                 saveAsJSON(data, filePath);
            }
            break;
    }
};