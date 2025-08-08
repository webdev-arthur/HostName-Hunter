import chalk from 'chalk';
import dayjs from 'dayjs';

/**
 * Formats a date string for display, coloring it if it's expired or expiring soon.
 * @param {string} dateString The date string to format.
 * @param {boolean} [includeRelative=true] Include relative time like "(Expired)".
 * @returns {string} The formatted date string.
 */
export function formatSslDate(dateString, includeRelative = true) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = dayjs(dateString);
    if (!date.isValid()) return 'Invalid Date';

    const formatted = date.format('MMM D, YYYY');
    if (!includeRelative) return formatted;
    
    const daysDiff = date.diff(dayjs(), 'day');

    if (daysDiff < 0) return chalk.red.bold(`${formatted} (Expired)`);
    if (daysDiff <= 30) return chalk.yellow.bold(`${formatted} (${daysDiff}d left)`);
    return chalk.green(formatted);
}

/**
 * Formats security headers into a compact string of icons.
 * @param {object} securityHeaders The security headers object.
 * @returns {string} A compact, readable string of security headers.
 */
export function formatSecurityHeaders(securityHeaders) {
    if (!securityHeaders || Object.keys(securityHeaders).length === 0) return chalk.gray('N/A');
    const headers = [
        { key: 'hsts', name: 'HSTS', present: securityHeaders.hsts !== 'N/A' },
        { key: 'csp', name: 'CSP', present: securityHeaders.csp !== 'N/A' },
        { key: 'xFrameOptions', name: 'X-Frame', present: securityHeaders.xFrameOptions !== 'N/A' },
    ];

    return headers.map(h => (h.present ? chalk.green('✔') : chalk.red('✖')) + ` ${h.name}`).join(' ');
}

/**
 * Returns a colored status icon.
 * @param {string} status The status string ('Success' or 'Failed').
 * @returns {string} A colored icon.
 */
export function getStatusIcon(status) {
    return status === 'Success' ? chalk.green('✔') : chalk.red('✖');
}