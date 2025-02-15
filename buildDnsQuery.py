import random

RRDict = {
    "A": 1,
    "NS": 2,
    "CNAME": 5,
    "SOA": 6,
    "PTR": 12,
    "MX": 15,
    "AAAA": 28
}

# build header returns 12 bytes as according to
# https://datatracker.ietf.org/doc/html/rfc1035#section-4.1.1
# optional flags argument will default to a query with recursion request by default
def buildHeader(numQues, numAns, numAuth, numAdd, flags=0x0120) -> bytes:
    # ID - 2 bytes
    id = random.randint(0, 65535).to_bytes(2, 'big')

    # Flags QR + Opcode + AA + TC + RD + RA + Z + RCODE - 2 bytes
    # 0x120 = standard query with recursion desired
    flags = flags.to_bytes(2, 'big')

    ques = (numQues).to_bytes(2, 'big')

    ans = (numAns).to_bytes(2, 'big')

    auth = (numAuth).to_bytes(2, 'big')

    add = (numAdd).to_bytes(2, 'big')

    return id + flags + ques + ans + auth + add

# buildQName is based on https://datatracker.ietf.org/doc/html/rfc1035#section-4.1.2
def buildQName(domain: str) -> bytes:
    labels = domain.split(".")
    name = b''
    for label in labels:
        name += len(label).to_bytes(1, 'big')
        name += label.encode('ascii')

    if name[-1] != 0:
        name += (0).to_bytes(1, 'big')

    return name

# build question returns bytes as according to
# https://datatracker.ietf.org/doc/html/rfc1035#section-4.1.2
def buildQuestion(domain: str, RRType: str) -> bytes:
    # QNAME is a variable length
    name = buildQName(domain)

    # 1 means A record
    qTypeVal = RRDict.get(RRType)
    if qTypeVal is None:
        print("Error: invalid arguments")
        exit(1)

    qType = qTypeVal.to_bytes(2, 'big')

    # 1 means IN
    qClass = (1).to_bytes(2, 'big')

    return name + qType + qClass

# expects RRType to be A, NS, CNAME, PTR or MX (does not support others)
def buildQuery(domain: str, rrType: str) -> bytes:
    header = buildHeader(1, 0, 0, 0)

    if rrType == "PTR":
        reversed_ip = ".".join(reversed(domain.split(".")))
        question = buildQuestion(reversed_ip + ".in-addr.arpa", rrType)
    else:
        question = buildQuestion(domain, rrType)

    return header + question
