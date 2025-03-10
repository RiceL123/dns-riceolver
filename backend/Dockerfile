# Use an official lightweight image with both Python and Node
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    python3 python3-venv \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

RUN ln -s /usr/bin/python3 /usr/bin/python

COPY . .

RUN npm install

# Expose necessary ports (change if needed)
# EXPOSE 8000

CMD ["python3", "server.py"]
CMD ["npm start"]
