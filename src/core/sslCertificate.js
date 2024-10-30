// src/plugins/sslCertificate.js
const https = require('https');
const tls = require('tls');

// Configurable list of ports to check for SSL/TLS certificates
const DEFAULT_PORTS = [21, 25, 443, 993, 8443, 465, 995];
const PORTS_TO_CHECK = process.env.CERT_PORTS ? process.env.CERT_PORTS.split(',').map(Number) : DEFAULT_PORTS;

// Set a debug flag for controlling verbose logging
const DEBUG = process.env.DEBUG === 'true';

// Function to retrieve basic SSL certificate details using `https`
function getHttpsCertificate(hostname) {
    return new Promise((resolve) => {
        const req = https.get(`https://${hostname}`, { timeout: 3000 }, (res) => {
            const cert = res.socket.getPeerCertificate();
            const server = res.headers['server'] || 'N/A';
            const location = res.headers['location'] || 'N/A';

            if (!cert || Object.keys(cert).length === 0) {
                if (DEBUG) console.log(`No HTTPS certificate found for ${hostname}`);
                resolve({ server, location, sslCertificate: null });
            } else {
                if (DEBUG) console.log(`HTTPS certificate found for ${hostname}`);
                resolve({
                    issuer: cert.issuer?.O || cert.issuer?.CN || 'N/A',
                    validFrom: cert.valid_from || 'N/A',
                    validTo: cert.valid_to || 'N/A',
                    server,
                    location,
                    port: 443 // Indicate the port used
                });
            }
        });

        req.on('error', (err) => {
            if (DEBUG) console.log(`HTTPS connection error for ${hostname}: ${err.message}`);
            resolve({ server: 'N/A', location: 'N/A', sslCertificate: null });
        });
        req.on('timeout', () => {
            if (DEBUG) console.log(`HTTPS connection timed out for ${hostname}`);
            req.destroy();
            resolve({ server: 'N/A', location: 'N/A', sslCertificate: null });
        });
    });
}

// Function to retrieve SSL certificate information using `tls` for specified port
function getTlsCertificate(hostname, port) {
    return new Promise((resolve) => {
        const socket = tls.connect(
            port,
            hostname,
            { rejectUnauthorized: false, timeout: 3000 },
            () => {
                const cert = socket.getPeerCertificate();
                if (!cert || Object.keys(cert).length === 0) {
                    if (DEBUG) console.log(`No TLS certificate found on port ${port} for ${hostname}`);
                    resolve({ server: 'N/A', location: 'N/A', sslCertificate: null });
                } else {
                    if (DEBUG) console.log(`TLS certificate found on port ${port} for ${hostname}`);
                    resolve({
                        issuer: cert.issuer?.O || cert.issuer?.CN || 'N/A',
                        validFrom: cert.valid_from || 'N/A',
                        validTo: cert.valid_to || 'N/A',
                        server: 'N/A', // Server info might not be available through TLS alone
                        location: 'N/A', // Location info might not be available through TLS alone
                        port
                    });
                }
                socket.end();
            }
        );

        socket.on('error', () => resolve({ server: 'N/A', location: 'N/A', sslCertificate: null }));
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ server: 'N/A', location: 'N/A', sslCertificate: null });
        });
    });
}

// Main function to attempt SSL certificate retrieval on multiple ports
async function fetchSSLCertificateDetails(hostname) {
    if (DEBUG) console.log(`Fetching SSL/TLS details for ${hostname}`);

    // First, try to retrieve certificate using HTTPS on port 443
    const httpsCert = await getHttpsCertificate(hostname);
    if (httpsCert.sslCertificate || httpsCert.server !== 'N/A' || httpsCert.location !== 'N/A') {
        return httpsCert;
    }

    // If HTTPS fails, attempt TLS on specified ports
    for (const port of PORTS_TO_CHECK) {
        const tlsCert = await getTlsCertificate(hostname, port);
        if (tlsCert.sslCertificate) {
            return tlsCert;
        }
    }

    // No certificate data available after all attempts
    if (DEBUG) console.log(`No certificate data available for ${hostname}`);
    return { issuer: 'N/A', validFrom: 'N/A', validTo: 'N/A', server: 'N/A', location: 'N/A', port: 'N/A' };
}

module.exports = { fetchSSLCertificateDetails };
