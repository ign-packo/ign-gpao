set SERVER_HOSTNAME=%COMPUTERNAME%

docker-compose -f docker-compose.yml up -d --scale client-gpao=1
