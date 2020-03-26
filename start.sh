NB_PROC=`grep processor /proc/cpuinfo | wc -l`
NB_PROC=$(( $NB_PROC - 1))
if [ $NB_PROC -lt 1 ]
then
    NB_PROC=1
fi

echo "Lancement de $NB_PROC thread(s)"

docker-compose -f docker-compose.yml up --scale client-gpao=$NB_PROC