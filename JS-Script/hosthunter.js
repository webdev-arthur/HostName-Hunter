const dns = require('dns');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');

const getRandomColor = () => {
    const colors = [
        chalk.red, chalk.green, chalk.yellow, chalk.cyan, chalk.magenta, chalk.blue, chalk.white
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

figlet('HostName Hunter', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    const coloredBanner = getRandomColor()(data);
    console.log(coloredBanner);
});

const getTerminalWidth = () => {
    return process.stdout.columns || 80;
};

const isValidIp = (ip) => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
};

const isValidIpRange = (range) => {
    const rangeRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1-9]|[1-2][0-9]|3[0-2]))$/;
    return rangeRegex.test(range);
};

const validateIps = (ips) => {
    return ips.every(ipLine => {
        const ipParts = ipLine.split(',').map(part => part.trim());
        return ipParts.every(ip => {
            const isValid = isValidIp(ip) || isValidIpRange(ip);
            if (!isValid) {
                console.error(chalk.red(`Invalid IP address or range format: "${ip}"`));
            }
            return isValid;
        });
    });
};

const args = process.argv.slice(2);
let ipAddresses = [];
let outputFileName = null;
let results = [['IP Address', 'Status', 'Hostname']];
let completedLookups = 0;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-i') {
        const input = args[i + 1];
        ipAddresses = input.split(',').map(ip => ip.trim());
        i++;
    } else if (args[i] === '-iF') {
        const filePath = args[i + 1];
        try {
            if (!fs.existsSync(filePath)) {
                console.error(chalk.red(`File not found: ${filePath}`));
                process.exit(1);
            }
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            ipAddresses = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line);
            
            const hasCidr = ipAddresses.some(isValidIpRange);
            const hasIps = ipAddresses.some(isValidIp);

            if (hasCidr && hasIps) {
                console.log(chalk.yellow("CIDR is mixed with valid IPs, convert those to IPs."));
                process.exit(1);
            } else if (hasCidr) {
                console.log(chalk.yellow("Please provide the list of IPs, not the CIDR Notation. Can't Handle that as of now."));
                process.exit(1);
            } else if (!validateIps(ipAddresses)) {
                console.error(chalk.red("File contains invalid IP address or range format."));
                process.exit(1);
            }
            i++;
        } catch (error) {
            console.error(chalk.red(`Error reading file: ${error.message}`));
            process.exit(1);
        }
    } else if (args[i] === '-o') {
        outputFileName = args[i + 1] ? args[i + 1] : 'output.csv';
        i++;
    }
}

if (ipAddresses.length === 0) {
    console.error(chalk.red("No IP addresses provided. Use -i <IP-Address> or -iF <File-Path>."));
    process.exit(1);
}

const hasCidrInArgs = ipAddresses.some(isValidIpRange);
if (hasCidrInArgs) {
    console.log(chalk.yellow("I don't handle the CIDR Range."));
    process.exit(1);
}

const handleDnsLookup = (ip) => {
    if (isValidIpRange(ip)) {
        console.log(chalk.yellow(`Can't handle the CIDR range: "${ip}"`));
        results.push([ip, 'Not Applicable', 'CIDR range - Not handled']);
        completedLookups++;
        if (completedLookups === totalLookups) {
            finalizeOutput();
        }
    } else if (isValidIp(ip)) {
        dns.reverse(ip, (err, hostnames) => {
            const status = err ? 'Failed' : 'Success';
            const hostname = err ? `Error: ${err.message}` : hostnames.join(', ');
            results.push([ip, status, hostname]);
            completedLookups++;
            if (completedLookups === totalLookups) {
                finalizeOutput();
            }
        });
    } else {
        console.error(chalk.red(`Invalid IP address or range format encountered: "${ip}"`));
        completedLookups++;
        if (completedLookups === totalLookups) {
            finalizeOutput();
        }
    }
};

let totalLookups = 0;
ipAddresses.forEach(ipLine => {
    const ipParts = ipLine.split(',').map(part => part.trim());
    totalLookups += ipParts.length;
    ipParts.forEach(ip => handleDnsLookup(ip));
});

function finalizeOutput() {
    printTable();
    if (outputFileName) saveToCSV();
}

function printTable() {
    if (results.length <= 1) {
        console.log(chalk.yellow("No results to display."));
        return;
    }

    const maxIpLength = Math.max(...results.map(row => row[0].length), 'IP Address'.length);
    const maxStatusLength = Math.max(...results.map(row => row[1].length), 'Status'.length);
    const maxHostnameLength = Math.max(...results.map(row => row[2].length), 'Hostname'.length);

    const rowSeparator = `+${'-'.repeat(maxIpLength + 2)}+${'-'.repeat(maxStatusLength + 2)}+${'-'.repeat(maxHostnameLength + 2)}+`;

    console.log(rowSeparator);
    console.log(`| ${'IP Address'.padEnd(maxIpLength)} | ${'Status'.padEnd(maxStatusLength)} | ${'Hostname'.padEnd(maxHostnameLength)} |`);
    console.log(rowSeparator);

    results.slice(1).forEach(row => {
        const colorStatus = row[1] === 'Success' 
            ? chalk.green(row[1].padEnd(maxStatusLength)) 
            : chalk.red(row[1].padEnd(maxStatusLength));

        console.log(`| ${row[0].padEnd(maxIpLength)} | ${colorStatus} | ${row[2].padEnd(maxHostnameLength)} |`);
        console.log(rowSeparator);
    });
}

function saveToCSV() {
    const csvData = results.map(row => row.join(',')).join('\n');
    const filePath = path.resolve(__dirname, outputFileName);
    fs.writeFileSync(filePath, csvData);
    console.log(chalk.green(`Results saved to ${filePath}`));
}
