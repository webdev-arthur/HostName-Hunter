const { displayBanner } = require("./src/core/banner");
const loadConfig = require("./src/core/config");
const { loadInputData } = require("./src/core/inputHandler");
const { processInBatches } = require("./src/core/dnsLookup");
const { fetchSSLCertificateDetails } = require("./src/core/sslCertificate"); // Import SSL fetching function
const { saveResults } = require("./src/output/outputFormatter");
const { fetchHttpHeaders } = require("./src/core/headerAnalysis");

// List of ports to check for SSL/TLS certificates
const SSL_PORTS = [21, 25, 443, 993, 8443, 465, 995];

// Check for help argument first
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log(`
Usage: node index.js [options]

Options:
  -i <IP-Addresses>             Input IP addresses (comma-separated if multiple)
  -iF <File-Path>               Specify a file containing IP addresses
  -o <Output-Filename>          Specify output file name (supports CSV, JSON, HTML, XML)
  --format <csv|json|html|xml>  Define the output format
  --batchSize <number>          Set the batch size for DNS lookups
  --maxConcurrentLookups <number> Define max concurrent lookups for optimized performance
  -h, --help                    Display this help message
    `);
  process.exit(0);
}

function startLoadingBar(message, length = 20) {
    let progress = 0;
    const interval = setInterval(() => {
      const filled = "=".repeat(progress);
      const empty = " ".repeat(length - progress);
      process.stdout.write(
        `\r${message} [${filled}${empty}] ${Math.round(
          (progress / length) * 100
        )}% `
      );
      progress = (progress + 1) % (length + 1);
    }, 200);
    return interval;
  }

function stopAnimation(interval) {
  clearInterval(interval);
  process.stdout.write("\r");
}

// Load configuration and display banner
const config = loadConfig();
displayBanner();

(async () => {
  const startTime = Date.now(); // Track start time
  const ipAddresses = await loadInputData(config);

  if (ipAddresses.length === 0) {
    console.error(
      "No IP addresses provided. Use inline input or provide a file path."
    );
    process.exit(1);
  }

  console.log(
    `Starting HostName Hunter with ${ipAddresses.length} IPs, batch size ${config.batchSize}, and concurrency ${config.maxConcurrentLookups}...\n`
  );

  const animationInterval = startLoadingBar("Processing IP addresses");

  // Process IPs in batches and fetch results with console feedback
  let results = await processInBatches(
    ipAddresses,
    config.batchSize,
    config.maxConcurrentLookups
  );

  // Fetch SSL/TLS details and HTTP headers if enabled
  results = await Promise.all(
    results.map(async (result) => {
      if (result.status === "Success") {
        try {
          // Fetch SSL certificate details
          const sslData = await fetchSSLCertificateDetails(result.ip);
          result.sslCertificate = sslData;

          // Fetch HTTP headers
          const headersData = await fetchHttpHeaders(result.ip);
          result.headers = headersData;
        } catch (err) {
          console.error(`Error processing ${result.ip}: ${err.message}`);
          result.sslCertificate = {
            issuer: "N/A",
            validFrom: "N/A",
            validTo: "N/A",
          };
          result.headers = {
            server: "N/A",
            xPoweredBy: "N/A",
            location: "N/A",
            securityHeaders: {},
          };
        }
      } else {
        result.sslCertificate = {
          issuer: "N/A",
          validFrom: "N/A",
          validTo: "N/A",
        };
        result.headers = {
          server: "N/A",
          xPoweredBy: "N/A",
          location: "N/A",
          securityHeaders: {},
        };
      }
      return result;
    })
  );

  stopAnimation(animationInterval);

  // Output results in specified format
  if (!config.outputFormat) {
    saveResults(results, "table");
  } else {
    saveResults(results, config.outputFormat, config.outputFileName);
  }

  // Calculate and display process completion time
  const endTime = Date.now();
  const elapsedTime = new Date(endTime - startTime).toISOString().substr(11, 8);
  console.log(`\nProcess completed in ${elapsedTime}.`);

  // Add space after the table and exit
  console.log("\n"); // Add extra space for readability
  setTimeout(() => process.exit(0), 100); // Exit after a short delay
})();
