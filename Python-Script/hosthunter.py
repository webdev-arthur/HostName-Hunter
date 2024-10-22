import socket
import sys
import os
import csv
import pyfiglet
import random
from colorama import Fore, Style, init

# Initialize colorama for cross-platform colored output
init(autoreset=True)

def get_random_color():
    colors = [Fore.RED, Fore.GREEN, Fore.YELLOW, Fore.CYAN, Fore.MAGENTA, Fore.BLUE, Fore.WHITE]
    return random.choice(colors)

# Generate dynamic ASCII banner using pyfiglet
ascii_banner = pyfiglet.figlet_format("HostName Hunter")
colored_banner = get_random_color() + ascii_banner + Style.RESET_ALL

# Display the tool name banner
print(colored_banner)

def is_valid_ip(ip):
    try:
        socket.inet_aton(ip)
        return True
    except socket.error:
        return False

def is_valid_ip_range(ip):
    return '/' in ip

def perform_dns_lookup(ip):
    try:
        hostname = socket.gethostbyaddr(ip)[0]
        return "Success", hostname
    except socket.herror:
        return "Failed", "No hostname found"

def load_ips_from_file(file_path):
    with open(file_path, 'r') as file:
        return [line.strip() for line in file if line.strip()]

def print_table(results):
    max_ip_len = max(len(row[0]) for row in results)
    max_status_len = max(len(row[1]) for row in results)
    max_hostname_len = max(len(row[2]) for row in results)

    row_separator = f"+{'-' * (max_ip_len + 2)}+{'-' * (max_status_len + 2)}+{'-' * (max_hostname_len + 2)}+"
    print(row_separator)
    print(f"| {'IP Address'.ljust(max_ip_len)} | {'Status'.ljust(max_status_len)} | {'Hostname'.ljust(max_hostname_len)} |")
    print(row_separator)

    for row in results:
        ip, status, hostname = row
        color_status = Fore.GREEN + status if status == "Success" else Fore.RED + status
        print(f"| {ip.ljust(max_ip_len)} | {color_status.ljust(max_status_len + len(Fore.GREEN))} | {hostname.ljust(max_hostname_len)} |")
        print(row_separator)

def save_to_csv(results, output_file):
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['IP Address', 'Status', 'Hostname'])
        writer.writerows(results)
    print(Fore.GREEN + f"Results saved to {output_file}")

def main():
    if len(sys.argv) < 3:
        print(Fore.RED + "Usage: python hosthunter.py -i <IP-Address or IP-Addresses> or -iF <File-Path> [-o <Output-File>]")
        sys.exit(1)

    args = sys.argv[1:]
    ip_addresses = []
    output_file = None

    if '-i' in args:
        index = args.index('-i') + 1
        if index >= len(args):
            print(Fore.RED + "No IP address provided after -i.")
            sys.exit(1)
        ip_addresses = [ip.strip() for ip in args[index].split(',')]
    
    elif '-iF' in args:
        index = args.index('-iF') + 1
        if index >= len(args):
            print(Fore.RED + "No file path provided after -iF.")
            sys.exit(1)
        file_path = args[index]
        if not os.path.exists(file_path):
            print(Fore.RED + f"File not found: {file_path}")
            sys.exit(1)
        ip_addresses = load_ips_from_file(file_path)
    
    if not ip_addresses:
        print(Fore.RED + "No IP addresses provided.")
        sys.exit(1)

    if '-o' in args:
        index = args.index('-o') + 1
        if index < len(args):
            output_file = args[index]
        else:
            output_file = 'output.csv'

    # Check for CIDR and mixed IP/CIDR content
    has_cidr = any(is_valid_ip_range(ip) for ip in ip_addresses)
    has_ips = any(is_valid_ip(ip) for ip in ip_addresses)

    if has_cidr and has_ips:
        print(Fore.YELLOW + "Only IPs are accepted, convert the CIDR into the list of IPs and update the file.")
        sys.exit(1)
    elif has_cidr:
        print(Fore.YELLOW + "I don't handle the CIDR Range.")
        sys.exit(1)

    results = [['IP Address', 'Status', 'Hostname']]
    
    for ip in ip_addresses:
        if is_valid_ip(ip):
            status, hostname = perform_dns_lookup(ip)
            results.append([ip, status, hostname])
        else:
            print(Fore.RED + f"Invalid IP address format: {ip}")
            results.append([ip, "Invalid", "N/A"])

    print_table(results[1:])

    if output_file:
        save_to_csv(results[1:], output_file)

if __name__ == "__main__":
    main()
