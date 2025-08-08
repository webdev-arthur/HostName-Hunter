import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/**
 * Validates if a string is a syntactically correct IPv4 address.
 * @param {string} ip - The string to validate.
 * @returns {boolean} - True if the string is a valid IP, false otherwise.
 */
function isValidIPv4(ip) {
  // This regex checks for four blocks of 1-3 digits, separated by dots.
  // It's a good-enough check for this tool's purpose.
  const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Regex.test(ip);
}

/**
 * Loads IP addresses from command-line arguments and/or a file.
 * It validates, cleans, and deduplicates the IPs before returning them.
 *
 * @param {object} config - The configuration object from yargs.
 * @returns {Promise<string[]>} A promise that resolves to an array of unique, valid IP addresses.
 * @throws {Error} If the input file cannot be found or if no valid IPs are provided.
 */
export async function loadInputData(config) {
  let allIPs = [];


  if (config.inlineIPs) {
    allIPs.push(...config.inlineIPs.split(',').map(ip => ip.trim()));
  }


  if (config.inputFilePath) {
    const filePath = path.resolve(config.inputFilePath);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const fileIPs = fileContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      allIPs.push(...fileIPs);
    } catch (error) {
      // Throw a specific, user-friendly error if the file is not found
      if (error.code === 'ENOENT') {
        throw new Error(`Input file not found at: ${chalk.red(filePath)}`);
      }

      throw error;
    }
  }


  const validIPs = [];
  const invalidEntries = [];

  for (const ip of allIPs) {
    if (isValidIPv4(ip)) {
      validIPs.push(ip);
    } else if (ip) { 
      invalidEntries.push(ip);
    }
  }


  if (invalidEntries.length > 0) {
    console.warn(chalk.yellow(`Warning: The following ${invalidEntries.length} entries were ignored as they are not valid IPs:`));
    console.warn(chalk.gray(`  ${invalidEntries.join(', ')}`));
  }


  const uniqueValidIPs = [...new Set(validIPs)];


  if (uniqueValidIPs.length === 0) {
    throw new Error('No valid IP addresses were provided. Please check your input.');
  }

  return uniqueValidIPs;
}