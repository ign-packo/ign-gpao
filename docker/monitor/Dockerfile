FROM node:latest
LABEL maintainer="arnaud.birk@ign.fr"
LABEL version="1.0"

#ENV http_proxy=$http_proxy
#ENV https_proxy=$http_proxy

ADD monitor /usr/local/src/monitor

WORKDIR /usr/local/src/monitor

#RUN npm config set http-proxy $http_proxy
#RUN npm config set https-proxy $http_proxy

RUN npm install supervisor -g
RUN npm install

EXPOSE 8000

ENTRYPOINT ["npm", "start"]

