# HostName Hunter v2.0

![Node.js](https://img.shields.io/badge/Node.js-18.x+-green.svg)
![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

**HostName Hunter** is a powerful and fast command-line tool for network reconnaissance. It takes a list of IP addresses and performs a comprehensive analysis, including reverse DNS lookups, SSL/TLS certificate details, and HTTP header inspection.

## Key Features

-   **Multi-Faceted Analysis:** Gathers data from three sources: DNS records, SSL/TLS certificates, and HTTP server headers.
-   **High-Performance:** Uses asynchronous, concurrent lookups to process large lists of IPs quickly.
-   **Polished Terminal UI:** Displays results in a clean, dynamically sized, and color-coded table for immediate readability. Failed lookups and expiring certificates are highlighted automatically.
-   **Flexible Input:** Accepts IP addresses directly from the command line or from a file.
-   **Data Export:** Save the full results to structured files like `JSON` or `CSV` for reporting or further analysis.
-   **Intuitive CLI:** Designed with simple, easy-to-remember command-line flags and aliases.

## Terminal Output

The tool presents data in a clean, sorted table. Failures are automatically grouped at the bottom, and their rows are colored red for high visibility.

## Installation

To use HostName Hunter, you need [Node.js](https://nodejs.org/) (v18.x or newer) installed.

1.  Clone the repository and navigate to the project’s directory:
    ```bash
    git clone https://github.com/your-username/HostName-Hunter.git
    cd HostName-Hunter
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

## Usage

You can now run the tool using `node .` or `node index.js`.

### Command-Line Options

| Argument                 | Aliases                         | Description                                            |
| ------------------------ | ------------------------------- | ------------------------------------------------------ |
| **Input Options**        |                                 |                                                        |
| `--ip`                   | `-i`, `--inlineIPs`             | Provide a comma-separated list of IPs directly.        |
| `--file`                 | `-f`, `--iF`, `--inputFilePath` | Provide a path to a file containing IPs (one per line).|
| **Output Options**       |                                 |                                                        |
| `--outputFileName`       | `-o`                            | Save results to a file. Format (`.json`, `.csv`) is inferred. |
| `--verbose`              | `-v`                            | Show extra columns in the table (SSL details, etc.).   |
| **Performance Options**  |                                 |                                                        |
| `--batchSize`            |                                 | Set the batch size for DNS lookups. (Default: 10)      |
| `--maxConcurrentLookups` |                                 | Define max concurrent lookups. (Default: 5)            |
| **General Options**      |                                 |                                                        |
| `--help`                 | `-h`                            | Display the help menu.                                 |

## Examples

#### 1. Basic lookup from a file (most common)

```bash
node . --file ./test_IPs.txt
```

#### 2. Lookup with verbose output to see SSL details

```bash
node . -f ./test_IPs.txt -v
```

#### 3. Lookup using inline IP addresses

```bash
node . --ip "8.8.8.8,9.9.9.9,1.1.1.1"
```

#### 4. Saving results to a JSON file

The output format is determined automatically by the file extension.

```bash
node . -f ./test_IPs.txt -o results.json
```

#### 5. Saving results to a CSV file

```bash
node . -f ./test_IPs.txt -o results.csv -v
```
