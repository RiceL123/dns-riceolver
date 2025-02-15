RRDict = {
    0: "Unused",
    1: "A",       # a host address
    2: "NS",      # an authoritative name server
    3: "MD",      # a mail destination (Obsolete - use MX)
    4: "MF",      # a mail forwarder (Obsolete - use MX)
    5: "CNAME",   # the canonical name for an alias
    6: "SOA",     # marks the start of a zone of authority
    7: "MB",      # a mailbox domain name (EXPERIMENTAL)
    8: "MG",      # a mail group member (EXPERIMENTAL)
    9: "MR",      # a mail rename domain name (EXPERIMENTAL)
    10: "NULL",   # a null RR (EXPERIMENTAL)
    11: "WKS",    # a well known service description
    12: "PTR",    # a domain name pointer
    13: "HINFO",  # host information
    14: "MINFO",  # mailbox or mail list information
    15: "MX",     # mail exchange
    16: "TXT",    # text strings
    28: "AAAA",   # IPv6 address
    41: "OPT"
}

ClassDict = {
    0: "Reserved",
    1: "IN",    # Internet
    2: "Unassigned",
    3: "CH",    # Chaos
    4: "HS",    # Hesiod
    254: "None", # QCLASS NONE (Special value used in some DNS queries)
    255: "Any"   # QCLASS ANY (Special value used in some DNS queries)
}

errorCode = {
    0: "No error condition",
    1: "Format Error",
    2: "Server Failure",
    3: "Server can't find domain name",
    4: "Not Implemented - name server does not support this type of query",
    5: "Refused"
}

OPCodes = {
    0: "a standard query (QUERY)",
    1: "an inverse query (IQUERY)",
    2: "a server status request (STATUS)",
}

# expects the 4th byte of the header as the argument RA + Z + RCODE
def responseCodeCheck(RCODE: bytes):
    # ignore RA + Z and only use last 4 bits

    error = errorCode.get(RCODE)

    if RCODE == 0:
        return
    else:
        print(f"[Reply Code {RCODE}: {error}]")
        exit(1)

# expects the argument to be the first 12 bytes corresponding to the DNS header
def format_flags(flags):
    return f"""
    Response: {flags >> 15} {flags >> 15 == 1}
    OPCode: {flags >> 11 & 0b1111} {OPCodes.get(flags >> 11 & 0b1111)}
    Authoritative: {flags >> 10 & 0b1} {flags >> 10 & 0b1 == 1}
    Truncated: {flags >> 9 & 0b1} {flags >> 9 & 0b1 == 1}
    Recursion desired: {flags >> 8 & 0b1} {flags >> 8 & 0b1 == 1}
    Recursion available: {flags >> 7 & 0b1} {flags >> 7 & 0b1 == 1}
    Z reserved: {flags >> 4 & 0b111}
    Reply Code: {flags & 0b1111} {errorCode.get(flags & 0b1111)}
    """

def parseHeader(header: bytes) -> tuple:
    # Unpack the header fields
    id = int.from_bytes(header[0:2], 'big')
    flags = int.from_bytes(header[2:4], 'big')
    numQuestions = int.from_bytes(header[4:6], 'big')
    numAnswers = int.from_bytes(header[6:8], 'big')
    numAuthAnswers = int.from_bytes(header[8:10], 'big')
    numAdditionalAnswers = int.from_bytes(header[10:12], 'big')

    # Format the Flags field using the helper function
    formatted_flags = format_flags(flags)

    # Create the formatted output
    #     header_info = f"""
    # ID: {ID}
    # Flags: {header[2:4]} {formatted_flags}
    # Questions: {numQuestions}
    # Answers: {numAnswers}
    # Authority RRs: {numAuthAnswers}
    # Additional RRs: {numAdditionalAnswers}
    # """

    header_info = {
        "ID": id,
        "Flag": flags,
        "Flags": formatted_flags
    }

    return header_info, numQuestions, numAnswers, numAuthAnswers, numAdditionalAnswers

def parseName(message: bytes, offset: int) -> tuple:
    name = ''

    length = message[offset]
    offset += 1

    if length == 0:
        return ".", offset
    elif length >= 0xc0:
        ptr = int.from_bytes(message[offset - 1: offset + 1], 'big') & 0b0011111111111111
        pointerName, _ = parseName(message, ptr)
        name += pointerName
        offset += 1
    else:
        while length > 0:
            if length >= 0xc0:
                ptr = int.from_bytes(message[offset - 1: offset + 1], 'big') & 0b0011111111111111
                pointerName, _ = parseName(message, ptr)
                name += pointerName
                offset += 1
                break
            name += message[offset:offset + length].decode() + "."
            offset += length + 1
            length = message[offset - 1]

    return name, offset


def parseQuestion(message: bytes, offset: int) -> tuple:
    name, offset = parseName(message, offset)

    # get the QTYPE - 2 bytes
    qType = RRDict.get(int.from_bytes(message[offset:offset + 2], 'big'))
    offset += 2

    # get the QCLASS - 2 bytes
    qClass = ClassDict.get(int.from_bytes(message[offset:offset + 2], 'big'))
    offset += 2

    return name, qType, qClass, offset

def parseRecords(message, offset, numRecords) -> tuple:
    records = []

    for _ in range(numRecords):
        name, offset = parseName(message, offset)

        # get the TYPE - 2 bytes
        rType = RRDict.get(int.from_bytes(message[offset:offset + 2], 'big'))
        offset += 2

        # get the CLASS - 2 bytes
        rClass = ClassDict.get(int.from_bytes(message[offset:offset + 2], 'big'))
        offset += 2

        # TTL - 4 bytes
        rTTL = ["TTL", int.from_bytes(message[offset:offset + 4], 'big')]
        offset += 4

        # RDLength - 2 bytes
        rLength = ["length", int.from_bytes(message[offset:offset + 2], 'big')]
        offset += 2

        rData = {}
        # A Types
        if rType == "A":
            rData[rType] = '.'.join([str(i) for i in message[offset:offset + 4]])
        # CNAME will have a name
        elif rType in ["CNAME", "NS", "PTR"] :
            answerName, _ = parseName(message, offset)
            rData[rType] = answerName
        # MX will 2 bytes of preferences followed by a name
        elif rType == "MX":
            rData["preference"] = int.from_bytes(message[offset: offset + 2], 'big')
            answerName, _ = parseName(message, offset + 2)
            rData[rType] = answerName
        else:
            rData[rType] = "RRType Not Implemented"

        offset += rLength[1]

        records.append((name, rType, rClass, rTTL, rLength, rData))

    return records, offset

# parses a queries questions +
def parseQuery(response):
    offset = 12
    headerInfo, numQuestions, numAns, numAuthAns, numAddAns = parseHeader(response[:offset])

    headerStr = f"ID: {headerInfo['ID']}\n"
    headerStr += f"flags: {headerInfo['Flags']}\n"
    headerStr += f"Questions: {numQuestions}\n"
    headerStr += f"Answers: {numAns}\n"
    headerStr += f"Authority: {numAuthAns}\n"
    headerStr += f"Additional: {numAddAns}\n"

    questionStr = ''
    if (numQuestions > 0):
        name, qType, qClass, offset = parseQuestion(response, offset)
        questionStr += f"{name} {qType} {qClass}"

    answerStr = ''
    if numAns > 0:
        records, offset = parseRecords(response, offset, numAns)
        answerStr = "\n".join(str(i) for i in records)

    authStr = ''
    if numAuthAns > 0:
        records, offset = parseRecords(response, offset, numAuthAns)
        authStr = "\n".join(str(i) for i in records)

    addStr = ''
    if numAddAns > 0:
        records, offset = parseRecords(response, offset, numAddAns)
        addStr = "\n".join(str(i) for i in records)


    return headerStr, questionStr, answerStr, authStr, addStr
