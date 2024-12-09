# HostName Hunter - JavaScript (Node.js)

**HostName Hunter** is a reverse DNS lookup tool for performing efficient DNS lookups on individual IP addresses to retrieve hostname information.

## Functionality Overview

HostName Hunter allows you to:
1. Perform reverse DNS lookups for individual IP addresses (CIDR ranges are not supported).
2. Accept IP input from the command line or via a file.
3. Display results in a structured table with color-coded status (success or failure).
4. Optionally save results in various formats: CSV, JSON, HTML, or XML.


## Features

- **Reverse DNS Lookup**: Provides hostname information for each IP address.
- **Flexible Input**: Accepts IPs from the command line or from a file.
- **Formatted Output**: Displays results in a structured table with color-coded status.
- **Export Options**: Save results in multiple formats including CSV, JSON, HTML, or XML.

## Installation

To use HostHunter you need [Node.js](https://nodejs.org/) installed.

1. Clone the repository and navigate to the project’s directory:
    ```bash
    cd HostName-Hunter
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Usage

HostHunter accepts input in two ways:
1. **Command Line**: Provide IP addresses directly as a single or comma-separated list.
2. **File**: Specify a file containing a list of IP addresses, each on a new line.

### Arguments

| Argument                 | Description                                                                                 |
|--------------------------|---------------------------------------------------------------------------------------------|
| `-i`                     | Input IP addresses (comma-separated if multiple)                                            |
| `-iF`                    | Specify a file containing IP addresses                                                      |
| `-o`                     | Specify an output file (supported formats: CSV, JSON, HTML, or XML)                         |
| `--format`               | Define the output format (csv, json, html, xml)                                             |
| `--batchSize`            | Set the batch size for DNS lookups                                                          |
| `--maxConcurrentLookups` | Define max concurrent lookups for optimized performance                                     |
| `-h` or `--help`         | Display help message with information about all available arguments                         |


## Demo
https://github.com/user-attachments/assets/06126ad7-23d9-4a1f-92b1-b27516578bf7



### Help Option
To display help information, use:
```bash
node index.js -h
```

## Examples

1. Single IP Lookup:
```bash
node index.js -i 8.8.8.8
```

2. Multiple IPs from Command Line:
```bash
node index.js -i 8.8.8.8,1.1.1.1,192.168.1.1
```

3. Lookup from a File:
```bash
node index.js -iF ./sample_ips.txt
```

4. Save Output to CSV:
```bash
node index.js -i 8.8.8.8,1.1.1.1 -o results.csv
```

5. Save Output in JSON:
```bash
node index.js -i 8.8.8.8,1.1.1.1 --format json -o results.json
```
