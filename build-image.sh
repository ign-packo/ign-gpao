export SERVER_HOSTNAME=$HOSTNAME

docker-compose build --build-arg http_proxy=${http_proxy} --build-arg https_proxy=${https_proxy} --parallel --no-cache --force-rm
