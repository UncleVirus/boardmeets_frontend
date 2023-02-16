FROM node:16.13-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm.install
COPY . .
RUN npm run build

#stage 2
FROM nginx:1.17.1-alpine
COPY /usr/src/app/dist/eboard-frontend /usr/share/nginx/html
EXPOSE 80
