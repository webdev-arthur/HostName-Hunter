const { displayBanner } = require("./src/core/banner");
const loadConfig = require("./src/core/config");
const { loadInputData } = require("./src/core/inputHandler");
const { processInBatches } = require("./src/core/dnsLookup");
const { fetchSSLCertificateDetails } = require("./src/core/sslCertificate");
const { saveResults } = require("./src/output/outputFormatter");
const { fetchHttpHeaders } = require("./src/core/headerAnalysis");


const SSL_PORTS = [21, 25, 443, 993, 8443, 465, 995];

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

const config = loadConfig();
displayBanner();

(async () => {
  const startTime = Date.now(); 
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

  let results = await processInBatches(
    ipAddresses,
    config.batchSize,
    config.maxConcurrentLookups
  );

  results = await Promise.all(
    results.map(async (result) => {
      if (result.status === "Success") {
        try {
          const sslData = await fetchSSLCertificateDetails(result.ip);
          result.sslCertificate = sslData;
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

  if (!config.outputFormat) {
    saveResults(results, "table");
  } else {
    saveResults(results, config.outputFormat, config.outputFileName);
  }

  const endTime = Date.now();
  const elapsedTime = new Date(endTime - startTime).toISOString().substr(11, 8);
  console.log(`\nProcess completed in ${elapsedTime}.`);

  console.log("\n");
  setTimeout(() => process.exit(0), 100);
})();
