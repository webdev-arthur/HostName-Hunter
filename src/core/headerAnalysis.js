const http = require('http');
const https = require('https');

const TIMEOUT = 5000; 

async function fetchHttpHeaders(ip) {
    const headersData = {
        ip,
        server: 'N/A',
        xPoweredBy: 'N/A',
        location: 'N/A',
        securityHeaders: {}
    };

    const requestHeaders = (protocol) => {
        return new Promise((resolve) => {
            const request = protocol.get(
                { hostname: ip, timeout: TIMEOUT },
                (response) => {
                    headersData.server = response.headers['server'] || 'N/A';
                    headersData.xPoweredBy = response.headers['x-powered-by'] || 'N/A';
                    headersData.location = response.headers['location'] || 'N/A';

                    headersData.securityHeaders = {
                        hsts: response.headers['strict-transport-security'] || 'N/A',
                        csp: response.headers['content-security-policy'] || 'N/A',
                        xFrameOptions: response.headers['x-frame-options'] || 'N/A',
                        xContentTypeOptions: response.headers['x-content-type-options'] || 'N/A',
                        xXssProtection: response.headers['x-xss-protection'] || 'N/A'
                    };

                    resolve(headersData);
                    response.resume();
                }
            );

            request.on('error', () => resolve(null));
            request.on('timeout', () => {
                request.destroy();
                resolve(null);
            });
        });
    };

    const httpsResult = await requestHeaders(https);
    if (httpsResult) return httpsResult;

    const httpResult = await requestHeaders(http);
    return httpResult || headersData; 
}

module.exports = { fetchHttpHeaders };
