FROM library/python:latest
LABEL maintainer="arnaud.birk@ign.fr"
LABEL version="1.0"

ADD client /usr/local/src/client

WORKDIR /usr/local/src/client

RUN pip install -r requirements.txt