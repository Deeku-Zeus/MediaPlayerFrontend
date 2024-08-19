FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i @rollup/rollup-linux-arm64-gnu
RUN npm i --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]