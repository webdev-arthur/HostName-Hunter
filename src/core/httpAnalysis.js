import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration Loading ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../../config/settings.json');
const settings = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const TIMEOUT = settings.defaults.timeout || 5000;

/**
 * Makes a request to an IP using a specific protocol (http or https) to get headers.
 * @param {object} protocol - The Node.js http or https module.
 * @param {string} ip - The target IP address.
 * @returns {Promise<object|null>} A promise that resolves with header data or null on failure.
 */
function requestHeaders(protocol, ip) {
    return new Promise((resolve) => {
        const options = {
            hostname: ip,
            port: protocol === https ? 443 : 80,
            method: 'GET',
            timeout: TIMEOUT,
            // Important for HTTPS requests to IPs without a matching hostname
            rejectUnauthorized: false,
            // Send a common user-agent to mimic a browser
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const req = protocol.get(options, (res) => {
            // We only need the headers, so we immediately destroy the socket after receiving them.
            // This prevents downloading the entire body.
            res.socket.destroy();

            resolve({
                server: res.headers['server'] || 'N/A',
                xPoweredBy: res.headers['x-powered-by'] || 'N/A',
                location: res.headers['location'] || 'N/A',
                securityHeaders: {
                    hsts: res.headers['strict-transport-security'] || 'N/A',
                    csp: res.headers['content-security-policy'] || 'N/A',
                    xFrameOptions: res.headers['x-frame-options'] || 'N/A',
                    xContentTypeOptions: res.headers['x-content-type-options'] || 'N/A',
                },
            });
        });

        // Handle request errors
        req.on('error', () => {
            resolve(null);
        });

        // Handle request timeout
        req.on('timeout', () => {
            req.destroy(); // Ensure the socket is closed
            resolve(null);
        });

        req.end();
    });
}

/**
 * Fetches HTTP and HTTPS headers for a given IP address.
 * It tries HTTPS first, then falls back to HTTP.
 * @param {string} ip - The target IP address.
 * @returns {Promise<object>} A promise that resolves with the collected header data.
 */
export async function fetchHttpHeaders(ip) {
    // Default structure to return in case of complete failure
    const defaultHeaders = {
        ip,
        server: 'N/A',
        xPoweredBy: 'N/A',
        location: 'N/A',
        securityHeaders: {},
    };

    // Try HTTPS first, as it's the most common for web services
    const httpsResult = await requestHeaders(https, ip);
    if (httpsResult) {
        return { ip, ...httpsResult };
    }

    // If HTTPS fails, try HTTP
    const httpResult = await requestHeaders(http, ip);
    if (httpResult) {
        return { ip, ...httpResult };
    }

    // If both fail, return the default structure
    return defaultHeaders;
}