FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    python3 python3-venv python3-pip \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /

RUN npm install

COPY . .

EXPOSE 5123 5321 53

CMD sh -c "python3 server.py & npm start"
