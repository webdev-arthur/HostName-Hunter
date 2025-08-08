import tls from 'tls';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration Loading ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// CORRECTED PATH: ../../ instead of ../../../
const configPath = path.resolve(__dirname, '../../config/settings.json');
const settings = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Get default ports and timeout from the central config file
const DEFAULT_PORTS = settings.defaults.sslPorts || [443, 8443, 993, 465];
const TIMEOUT = settings.defaults.timeout || 5000;

/**
 * Attempts to establish a TLS connection to a given host and port to retrieve its certificate.
 *
 * @param {string} hostname - The IP address or hostname to connect to.
 * @param {number} port - The port number to connect to.
 * @returns {Promise<object|null>} A promise that resolves with the parsed certificate object or null on failure.
 */
function getCertificateForPort(hostname, port) {
  return new Promise((resolve) => {
    const options = {
      host: hostname,
      port: port,
      rejectUnauthorized: false, // Essential for connecting to IPs where cert name won't match
      timeout: TIMEOUT,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      socket.end(); // We have what we need, close the connection.

      if (!cert || Object.keys(cert).length === 0) {
        // No certificate found on this port
        return resolve(null);
      }
      
      // Successfully found a certificate, resolve with its details.
      resolve({
        issuer: cert.issuer?.O || cert.issuer?.CN || 'N/A',
        validFrom: cert.valid_from || 'N/A',
        validTo: cert.valid_to || 'N/A',
        port,
      });
    });

    // Handle connection errors gracefully
    socket.on('error', () => resolve(null));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

/**
 * Fetches SSL/TLS certificate details for a given hostname by checking a list of common ports.
 * It checks port 443 first, then proceeds to other configured ports.
 *
 * @param {string} hostname - The IP address or hostname to check.
 * @returns {Promise<object>} A promise that resolves with the details of the first found certificate.
 */
export async function fetchSSLCertificateDetails(hostname) {
  // Always check port 443 first, then add the other default ports.
  // Using a Set ensures there are no duplicate ports in the list.
  const portsToCheck = [...new Set([443, ...DEFAULT_PORTS])];

  for (const port of portsToCheck) {
    const certDetails = await getCertificateForPort(hostname, port);
    if (certDetails) {
      // If we find a certificate on any port, we can stop and return it.
      return certDetails;
    }
  }

  // If the loop completes without finding any certificate, return the default empty state.
  return {
    issuer: 'N/A',
    validFrom: 'N/A',
    validTo: 'N/A',
    port: 'N/A',
  };
}