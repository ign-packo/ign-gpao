if [ "$(docker ps -aq -f name=client-gpao)" ]; then
    echo "Suppression du container client-gpao"
    docker rm -f client-gpao
fi

python client.py