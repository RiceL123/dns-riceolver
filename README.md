# COMP3331 Assignment - 19/20

## Basic implementation
`client.py` works with `resolver.py` correctly

`client.py` can be substituted for commands like dig (`dig www.example.com @127.0.0.1 -p 5300`) with `resolver.py` if it running on localhost port 5300.

`resolver.py` can be substituted for public resolvers like google DNS (`python3 client.py 8.8.8.8 53 www.unsw.edu.au`) with `client.py`

## Error handling
### Timeouts
`client.py` defaults to 5 second timeouts. Timeouts can be changed with the `--timeout` flag.
```
$ python3 client.py 1.1.1.1 1 www.example.com
www.example.com: type A to 1.1.1.1:1 timed out after 5s

$ python3 client.py 1.1.1.1 1 www.example.com --timeout 10
www.example.com: type A to 1.1.1.1:1 timed out after 10.0s
```

### Error Codes
The last 4 bits of the flags of DNS responses represent the response code where 0 represents no error. The following errors will cause `client.py` to terminate and print an error message accordingly

- [[#format error]]
- [[#server failure]]
- [[#name error]]
#### format error
`client.py` won't send an incorrectly formatted query on its own

However, if the `buildQuery()` function was changed to just return random bytes, the output would look like
```
$ python3 client_with_format_error.py 8.8.8.8 53 www.example.com
[Reply Code 1: Format Error]
```

#### server failure
`client.py` will terminate on server failures returned by the resolver
```
$ python3 client.py 8.8.8.8 53 www.xeample.com
[Reply Code 2: Server Failure]
```

#### name error
`client.py` will terminate on name errors returned by the resolver
```
$ python3 client.py 8.8.8.8 53 www.xeample.com
[Reply Code 3: Server can't find domain name]
```

## Advanced Records and Reverse DNS
`client.py` can generate *A*, *MX*, *CNAME*, *NS* and *PTR* requests. When the RR type is not specified, `client.py` will default to *A* record queries. This can be specified with the `--type` flag.

An example with an MX RR type
```
$ python3 client.py 127.0.0.1 5300 unsw.edu.au --type MX
ID: 43198
flags:
    Response: 1 True
    OPCode: 0 a standard query (QUERY)
    Authoritative: 1 True
    Truncated: 0 False
    Recursion desired: 0 False
    Recursion available: 0 False
    Z reserved: 0
    Reply Code: 0 No error condition

Questions: 1
Answers: 1
Authority: 3
Additional: 7


Question:
unsw.edu.au. MX IN

Answer:
('unsw.edu.au.', 'MX', 'IN', ['TTL', 300], ['length', 9], {'preference': 10, 'MX': 'smtp.unsw.edu.au.'})

Authority:
('unsw.edu.au.', 'NS', 'IN', ['TTL', 300], ['length', 6], {'NS': 'ns1.unsw.edu.au.'})
('unsw.edu.au.', 'NS', 'IN', ['TTL', 300], ['length', 6], {'NS': 'ns3.unsw.edu.au.'})
('unsw.edu.au.', 'NS', 'IN', ['TTL', 300], ['length', 6], {'NS': 'ns2.unsw.edu.au.'})

Additional:
('smtp.unsw.edu.au.', 'A', 'IN', ['TTL', 300], ['length', 4], {'A': '149.171.193.32'})
('ns3.unsw.edu.au.', 'A', 'IN', ['TTL', 300], ['length', 4], {'A': '192.155.82.178'})
('ns3.unsw.edu.au.', 'AAAA', 'IN', ['TTL', 300], ['length', 16], {'AAAA': 'RRType Not Implemented'})
('ns2.unsw.edu.au.', 'A', 'IN', ['TTL', 300], ['length', 4], {'A': '129.94.0.193'})
('ns2.unsw.edu.au.', 'AAAA', 'IN', ['TTL', 300], ['length', 16], {'AAAA': 'RRType Not Implemented'})
('ns1.unsw.edu.au.', 'A', 'IN', ['TTL', 300], ['length', 4], {'A': '129.94.0.192'})
('ns1.unsw.edu.au.', 'AAAA', 'IN', ['TTL', 300], ['length', 16], {'AAAA': 'RRType Not Implemented'})
```

When `PTR` is used, it is expected that the 3rd positional command line argument is an IPv4 address for reverse lookups.

```
$ python3 client.py 127.0.0.1 5300 8.8.8.8 --type PTR
ID: 16943
flags:
    Response: 1 True
    OPCode: 0 a standard query (QUERY)
    Authoritative: 1 True
    Truncated: 0 False
    Recursion desired: 0 False
    Recursion available: 0 False
    Z reserved: 0
    Reply Code: 0 No error condition

Questions: 1
Answers: 1
Authority: 0
Additional: 0


Question:
8.8.8.8.in-addr.arpa. PTR IN

Answer:
('8.8.8.8.in-addr.arpa.', 'PTR', 'IN', ['TTL', 86400], ['length', 12], {'PTR': 'dns.google.'})

Authority:


Additional:


```

## Client Multiplexing
Whenever a client makes a request to `resolver.py` and new thread will be created for the DNS resolution. This is not the most scalable approach
