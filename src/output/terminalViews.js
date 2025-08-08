import chalk from 'chalk';
import { formatSslDate, formatSecurityHeaders, getStatusIcon } from '../utils/formatters.js';

const stripAnsi = (str) => str.replace(/\u001b\[\d+m/g, '');

/**
 * Renders results in a polished, dynamically sized table.
 * This version sorts failures to the bottom and colors failed rows red.
 *
 * @param {object[]} results The array of all result objects.
 * @param {object} config The application configuration object.
 */
function printAdvancedTable(results, config) {

    results.sort((a, b) => {
        if (a.status === 'Success' && b.status === 'Failed') return -1;
        if (a.status === 'Failed' && b.status === 'Success') return 1;
        return 0; 
    });

    const headers = config.verbose
        ? ['Status', 'IP Address', 'Hostname', 'Server', 'SSL Issuer', 'SSL Expires', 'Security Headers']
        : ['Status', 'IP Address', 'Hostname', 'Server'];

    const tableData = results.map(result => {
        const hostnameDisplay = result.status === 'Success' ? result.hostname : chalk.gray(result.error || 'N/A');
        return {
            _rawStatus: result.status,
            'Status': getStatusIcon(result.status),
            'IP Address': result.ip,
            'Hostname': hostnameDisplay,
            'Server': result.headers?.server || 'N/A',
            'SSL Issuer': result.sslCertificate?.issuer || 'N/A',
            'SSL Expires': result.sslCertificate?.validTo ? formatSslDate(result.sslCertificate.validTo) : 'N/A',
            'Security Headers': formatSecurityHeaders(result.headers?.securityHeaders),
        };
    });

    const columnWidths = {};
    for (const header of headers) {
        const dataWidths = tableData.map(row => stripAnsi(row[header] || '').length);
        columnWidths[header] = Math.max(stripAnsi(header).length, ...dataWidths);
    }


    const drawBorder = (left, mid, right, conn) => {
        const parts = headers.map(h => mid.repeat(columnWidths[h] + 2));
        return chalk.white(`${left}${parts.join(conn)}${right}`);
    };

    const topBorder = drawBorder('┌', '─', '┐', '┬');
    const middleBorder = drawBorder('├', '─', '┤', '┼');
    const bottomBorder = drawBorder('└', '─', '┘', '┴');

    console.log(topBorder);
    const headerRow = headers.map(h => ` ${chalk.bold.cyan(h.padEnd(columnWidths[h]))} `).join(chalk.white('│'));
    console.log(chalk.white('│') + headerRow + chalk.white('│'));
    console.log(middleBorder);

    tableData.forEach(row => {
        const rowContent = headers.map(h => {
            const content = row[h];
            const visibleLength = stripAnsi(content).length;
            const padding = ' '.repeat(columnWidths[h] - visibleLength);
            return ` ${content}${padding} `;
        }).join(chalk.white('│'));

        let finalRowString = chalk.white('│') + rowContent + chalk.white('│');
        if (row._rawStatus === 'Failed') {
            finalRowString = chalk.red(finalRowString);
        }

        console.log(finalRowString);
    });

    console.log(bottomBorder);
}


export function printResults(results, config) {
    if (results.length === 0) {
        console.log(chalk.yellow('No results to display.'));
        return;
    }
    
    printAdvancedTable(results, config);
}