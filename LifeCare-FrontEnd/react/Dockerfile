FROM node:lts-alpine3.15

COPY package.json package-lock.json .

RUN npm install

COPY . .

RUN npm run build