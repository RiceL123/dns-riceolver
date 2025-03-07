FROM node:22-alpine

# Update package lists and install dig
RUN apt-get update && apt-get install -y dnsutils python3

RUN npm install

CMD python3 resolver.py && npm start
