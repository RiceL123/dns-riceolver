#!/usr/bin/env python3

from socket import *
import sys, re, threading

from parseDnsResponse import parseHeader, parseQuestion, parseRecords
from buildDnsQuery import buildQuery, buildHeader

def getRootServers():
    rootServers = []

    rootServerFile = open("./named.root", "r")
    for line in rootServerFile:
        if (re.search(r"^[^;.][^ ]+\s+\d+\s+A\s+\d+\.\d+\.\d+\.\d+", line)):
            rootServers.append(line.split()[3])

    return rootServers

def forwardQuery(query: bytes, server: str, rootServers: list, timeout) -> str:
    forwardSocket = socket(AF_INET, SOCK_DGRAM)
    forwardSocket.sendto(query, (server, 53))
    forwardSocket.settimeout(timeout)

    forwardedResponse, addr = forwardSocket.recvfrom(2048)
    headerInfo, numQues, numAns, numAuth, numAdd = parseHeader(forwardedResponse)

    offset = 12
    qName, qType, qClass, offset = parseQuestion(forwardedResponse, offset)
    recordsAns, offset = parseRecords(forwardedResponse, offset, numAns)
    recordsAuth, offset = parseRecords(forwardedResponse, offset, numAuth)
    recordsAdd, offset = parseRecords(forwardedResponse, offset, numAdd)

    if numAns > 0:
        print(f"Answer found for {headerInfo['ID']}, returning")
        return forwardedResponse

    if numAdd > 0:
        for record in recordsAdd:
            # 2nd field is rType
            if record[1] == "A":
                print(f"forwarding query ID: {headerInfo['ID']} to glue record {record[0]}: {record[5]['A']}")
                return forwardQuery(query, record[5]['A'], rootServers, timeout)

    if numAuth > 0:
        for record in recordsAuth:
            if record[1] == "NS":
                for rootServer in rootServers:
                    print(f"getting IP for auth NS {record[0]}: {record[5]['NS']} -> querying {rootServer}")
                    nsAddress = forwardQuery(buildQuery(record[5]['NS'], 'A'), rootServer, rootServers, timeout)
                    if nsAddress is not None:
                        break
                else:
                    print(f"couldn't find IP for auth NS {record[0]}")
                    continue

                # extract the IP of the auth NS and forward query to NS's IP address

                _, _, numAns, numAuth, numAdd = parseHeader(nsAddress)
                offset = 12
                _, _, _, offset = parseQuestion(nsAddress, offset)
                answers, offset = parseRecords(nsAddress, offset, numAns)
                for rr in answers:
                    if rr[1] == "A":
                        print(f"fowarding query ID: {headerInfo['ID']} to auth NS {rr[0]}: {rr[5]['A']}")
                        return forwardQuery(query, rr[5]['A'], rootServers, timeout)
                else:
                    print(f"couldn't find IP for auth NS {record[0]}")
                    continue
        else:
            print("authoratative NS does not have answer")

    print("No Answers")
    return forwardedResponse

def handle_client_request(serverSocket, clientMessage, clientAddress, rootServers, timeout):
    try:
        for rootServer in rootServers:
            print(f"trying root server: {rootServer}")
            forwardedResponse = forwardQuery(clientMessage, rootServer, rootServers, timeout)
            if forwardedResponse is not None:
                break
    except Exception as e:
        print(e)
        # 0x8082 means message is a response, there was a server error and recursion is available
        forwardedResponse = buildHeader(0, 0, 0, 0, 0x8082)

    serverSocket.sendto(forwardedResponse, clientAddress)

def runResolver(serverSocket, timeout):
    # save root servers into memory
    rootServers = getRootServers()

    while True:
        clientMessage, clientAddress = serverSocket.recvfrom(2048)

        # Create a new thread for each client request to handle it concurrently
        client_handler_thread = threading.Thread(
            target=handle_client_request, args=(serverSocket, clientMessage, clientAddress, rootServers, timeout))

        client_handler_thread.start()

if __name__ == "__main__":
    # if (len(sys.argv) < 2):
    #     print("Error: missing port number argument")
    #     print("Usage: resolver port [timeout=10]")
    #     sys.exit(1)

    # port = int(sys.argv[1])
    port = 5321
    ip = '127.0.0.1'

    serverSocket = socket(AF_INET, SOCK_DGRAM)
    serverSocket.bind((ip, port))

    # timeout value will
    timeout = 10
    if len(sys.argv) == 3:
        timeout = int(sys.argv[2])

    print (f'The resolver is listening on {ip}:{port}')
    runResolver(serverSocket, timeout)
