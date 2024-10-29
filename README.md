# HostHunter - JavaScript (Node.js) Version

This is the **HostHunter** tool, a reverse DNS lookup tool. It allows users to perform DNS lookups on individual IP addresses and retrieve hostname information.

## Purpose

The purpose of providing HostName Hunter in multiple languages is to offer flexibility and compatibility across various platforms. Whether you prefer the JavaScript/Node.js ecosystem or the Python environment, you can use HostName Hunter to perform efficient DNS lookups for individual IP addresses.

## Functionality Overview

HostName Hunter is designed to:
1. Perform reverse DNS lookups for a list of individual IP addresses (CIDR ranges are not supported).
2. Accept IP input directly from the command line or via a file.
3. Output results in a structured table format with color-coded status (success or failure).
4. Support CSV output if specified.

Refer to the specific README files within the `JS-Script` and `Python-Script` folders for detailed installation and usage instructions for each language.


## Features

- **Reverse DNS Lookup**: Provides hostname information for each IP address.
- **Flexible Input**: Accepts IP addresses from the command line or from a file.
- **Formatted Output**: Displays results in a structured table format with color-coded status.
- **CSV Output**: Optionally save results to a CSV file.

## Installation

To use HostHunter in JavaScript, you need [Node.js](https://nodejs.org/) installed.

1. Navigate to the `JS-Script` folder:
    ```bash
    cd JS-Script
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Usage

HostHunter accepts input in two ways:
1. **Command Line**: Provide IP addresses as a single or comma-separated list.
2. **File**: Specify a file containing a list of IP addresses, each on a new line.

### Basic Usage

```bash
node hosthunter.js -i <IP-Address or IP-Addresses>
node hosthunter.js -iF <File-Path>
node hosthunter.js -i <IP-Address> -o <Output-Filename>
```

-i: Input IP addresses (comma-separated if multiple).
-iF: Specify a file containing IP addresses.
-o: Specify an output file (CSV format).


### Examples

1. Single IP Lookup:
```bash
node hosthunter.js -i 8.8.8.8
```

2. Multiple IPs from Command Line:
```bash
node hosthunter.js -i 8.8.8.8,1.1.1.1,192.168.1.1
```

3. Lookup from a File:
```bash
node hosthunter.js -iF ./sample_ips.txt
```

5. Save Output to CSV:
```bash
node hosthunter.js -i 8.8.8.8,1.1.1.1 -o results.csv
```

---