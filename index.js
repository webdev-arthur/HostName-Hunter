import chalk from 'chalk';
import ora from 'ora'; // <-- Import the spinner library
import { displayBanner } from './src/core/banner.js';
import { setupYargs } from './src/core/configLoader.js';
import { loadInputData } from './src/core/inputHandler.js';
import { processInBatches } from './src/core/dnsLookup.js';
import { fetchSSLCertificateDetails } from './src/core/sslCertificate.js';
import { fetchHttpHeaders } from './src/core/httpAnalysis.js';
import { saveResults } from './src/output/fileSavers.js';
import { printResults } from './src/output/terminalViews.js';

async function main() {
  await displayBanner();

  const yargsInstance = setupYargs();
  const config = await yargsInstance.argv;

  const spinner = ora({ text: 'Starting scan...', color: 'cyan' });

  try {
    const ipAddresses = await loadInputData(config);
    
    spinner.start();
    spinner.text = `Scanning ${ipAddresses.length} IP(s)...`;
    
    const startTime = Date.now();

    spinner.text = 'Performing DNS Lookups...';
    let results = await processInBatches(ipAddresses, config.maxConcurrentLookups);

    spinner.text = 'Fetching HTTP Headers & SSL Certificates...';
    results = await Promise.all(
      results.map(async (result) => {
        if (result.status === 'Success') {
          try {
            const [sslData, headersData] = await Promise.all([
              fetchSSLCertificateDetails(result.ip),
              fetchHttpHeaders(result.ip)
            ]);
            return { ...result, sslCertificate: sslData, headers: headersData };
          } catch (err) {
            return { ...result, sslCertificate: {}, headers: {} };
          }
        }
        return { ...result, sslCertificate: {}, headers: {} };
      })
    );
    
    spinner.succeed(chalk.green('Scan complete!'));

    printResults(results, config);
    
    if (config.outputFileName) {
      const fileFormat = config.outputFileName.split('.').pop() || 'json';
      saveResults(results, fileFormat, config.outputFileName);
    }
    
    const endTime = Date.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(chalk.blue(`\n✨ Process completed in ${elapsedTime} seconds.`));

  } catch (error) {
    spinner.fail(chalk.red('An error occurred.'));
    console.error(`\n${chalk.red.bold('Error Details:')} ${error.message}`);
    process.exit(1);
  }
}

main();