#!/usr/bin/env python3

from socket import *
import argparse, time

from buildDnsQuery import buildQuery
from parseDnsResponse import parseQuery, responseCodeCheck

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="client.py")

    parser.add_argument('resolver_ip', type=str, help='resolver IPv4 address')
    parser.add_argument('resolver_port', type=int, help='resolver_port number', default=53)
    parser.add_argument('name', type=str, help='domain name')
    parser.add_argument('--timeout', type=float, required=False, default=5, metavar="default=5")
    parser.add_argument('--type', type=str, help='RR type', default="A", metavar="default='A'")

    args = parser.parse_args()

    resolver_ip = args.resolver_ip
    resolver_port = args.resolver_port
    domainName = args.name
    timeout = args.timeout
    rrType = args.type.upper()

    query = buildQuery(domainName, rrType)

    clientSocket = socket(AF_INET, SOCK_DGRAM)
    clientSocket.settimeout(timeout)

    start = time.time()

    try:
        clientSocket.sendto(query ,(resolver_ip, resolver_port))
        message, addr = clientSocket.recvfrom(2048)
    except Exception as e:
        if str(e) == "timed out":
            print(f"{domainName}: type {rrType} to {resolver_ip}:{resolver_port} timed out after {timeout}s")
        exit(1)

    end = time.time() - start

    # extract RCODE from 4th byte of header (RA + Z + RCODE)
    responseCodeCheck(int.from_bytes(message[3:4], 'big') & 0b1111)

    # skip 12 bytes + question length to give answer section
    header, question, answer, auth, add = parseQuery(message)

    print(f"{header}\n")
    print(f"Question:\n{question}\n")
    print(f"Answer:\n{answer}\n")
    print(f"Authority:\n{auth}\n")
    print(f"Additional:\n{add}\n")
    print(f"query time: {end:.6}")
