FROM library/python:latest
LABEL maintainer="arnaud.birk@ign.fr"
LABEL version="1.0"

# ARG HTTP_PROXY

ADD client /usr/local/src/client

WORKDIR /usr/local/src/client

RUN pip --proxy http://proxy.ign.fr:3128 install -r requirements.txt