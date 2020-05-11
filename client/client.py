#!/usr/bin/python
import multiprocessing
import sys
import random
import requests
import subprocess
import json
import time
import os
import socket
import signal

HostName=socket.gethostname()
NbProcess = multiprocessing.cpu_count()
UrlApi = os.getenv('URL_API', 'localhost')

def init_worker():
    signal.signal(signal.SIGINT, signal.SIG_IGN)


def process(id):
    strId = "["+str(id)+"] : "
    print(strId, " : begin")
    id_cluster = -1

    def signal_handler(sig, frame):
        print(strId, "Interruption")
        print(strId, "Il faut liberer le id_cluster : ", str(id_cluster))
        sys.exit(0)
    signal.signal(signal.SIGINT, signal_handler)
    
    Ok = True

    req=requests.put('http://'+UrlApi+':8080/api/cluster/'+HostName)
    id_cluster = req.json()[0]['id']
    print(strId, "id_cluster = ", str(id_cluster))
    while Ok:
        print(strId, Ok)
        req=requests.get('http://'+UrlApi+':8080/api/job/ready/'+str(id_cluster))
        if(len(req.json())!=0):
            id_job = req.json()[0]['id']
            command = req.json()[0]['command']
            print(strId, "L'identifiant du job "+str(id_job)+" est disponible")
            print(strId, "Execution de la commande "+ str(command))
            array_command = command.split()
            returnCode = 999
            try:
                proc = subprocess.Popen(array_command, stdout=subprocess.PIPE)
                (out, err) = proc.communicate()
                status='done'
                returnCode = proc.returncode
                json_data = out.decode()

            except Exception as ex:
                status='failed'
                json_data=str(ex)
            
            if (returnCode != 0):
                status='failed'

            req=requests.post('http://'+UrlApi+':8080/api/job?id='+str(id_job)+'&status='+str(status)+'&returnCode='+str(returnCode), json={"log": json_data})
        # else:
        #     print(strId, "Aucun job disponible dans la base")
        time.sleep(random.randrange(10))
    print(strId, "end thread ")

if __name__ == "__main__":

    print("Demarrage du client GPAO")
    print("Hostname : ", HostName)
    pool = multiprocessing.Pool(NbProcess, init_worker)
    
    try:
        pool.map(process, range(NbProcess))
        pool.join()

    except KeyboardInterrupt:
        pool.terminate()
        pool.join()
 
    print("Fin du client GPAO")
