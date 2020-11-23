FROM node:latest
LABEL maintainer="arnaud.birk@ign.fr"
LABEL version="1.0"

ENV http_proxy=$http_proxy
ENV https_proxy=$http_proxy
ENV NO_PROXY=api-gpao

ADD ./ /usr/local/src/gpao

WORKDIR /usr/local/src/gpao/api

RUN npm config set http-proxy $http_proxy
RUN npm config set https-proxy $http_proxy

RUN npm install supervisor -g
RUN npm install

EXPOSE 8080

ENTRYPOINT ["npm", "start"]

