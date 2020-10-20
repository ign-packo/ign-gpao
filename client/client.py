#!/usr/bin/python
"""
client GPAO:
- creation d'autant de threads que de coeurs sur la machine
- avec un dossier temp indépendant pour chaque thread
"""

import multiprocessing
import random
import subprocess
import time
import os
import socket
import signal
import tempfile
import requests

HostName = socket.gethostname()
NbProcess = multiprocessing.cpu_count()
UrlApi = os.getenv('URL_API', 'localhost')
minAvailableSpace = 10


def process(thread_id):
    ''' processus par thread '''
    str_id = "["+str(thread_id)+"] : "
    print(str_id, "begin")
    id_session = -1

    try:
        # On cree un dossier temporaire dans le dossier courant
        # qui devient le dossier d'execution
        working_dir = tempfile.TemporaryDirectory(dir='.')
        print('working dir : ', working_dir.name)

        req = requests.put('http://'+UrlApi+':8080/api/session?host='+HostName)
        id_session = req.json()[0]['id']
        print(str_id, "id_session = ", str(id_session))
        while True:
            # on verifie l'espace disponible dans le dossier de travail
            stat = os.statvfs(working_dir.name)
            freeGb = int(stat.f_frsize * stat.f_bavail / (1024 * 1024 * 1024))
            req = None
            if freeGb < minAvailableSpace:
                print('espace disque insuffisant pour prendre des traitements : ', freeGb, '/', minAvailableSpace)
            else:
                req=requests.get('http://'+UrlApi+':8080/api/job/ready?id_session='+str(id_session))
            if (req) and (len(req.json())!=0):
                id_job = req.json()[0]['id']
                command = req.json()[0]['command']
                print(str_id, "L'identifiant du job " +
                      str(id_job) + " est disponible")
                print(str_id, "Execution de la commande [" +
                      str(command)+"]")
                array_command = command.split()
                return_code = 999
                try:
                    proc = subprocess.Popen(array_command,
                                            stdout=subprocess.PIPE,
                                            cwd=working_dir.name)
                    (out, _) = proc.communicate()
                    status = 'done'
                    return_code = proc.returncode
                    json_data = out.decode()

                except subprocess.SubprocessError as ex:
                    print('failed : ', ex)
                    status = 'failed'
                    json_data = str(ex)

                if return_code != 0:
                    status = 'failed'

                print('Mise a jour : ', return_code, status, json_data)
                req = requests.post('http://' + UrlApi +
                                    ':8080/api/job?id=' +
                                    str(id_job) +
                                    '&status=' +
                                    str(status) +
                                    '&returnCode='+str(return_code),
                                    json={"log": json_data})
            time.sleep(random.randrange(10))
    except KeyboardInterrupt:
        print("on demande au process de s'arreter")
        req = requests.post('http://' +
                            UrlApi +
                            ':8080/api/session/close?id=' +
                            str(id_session))
    print(str_id, "end thread ")


if __name__ == "__main__":

    print("Demarrage du client GPAO")
    print("Hostname : ", HostName)

    POOL = multiprocessing.Pool(NbProcess)
    ORIGINAL_SIGINT_HANDLER = signal.signal(signal.SIGINT, signal.SIG_IGN)

    try:
        POOL.map(process, range(NbProcess))

    except KeyboardInterrupt:
        print("on demande au pool de s'arreter")
        POOL.terminate()
    else:
        print("Normal termination")
        POOL.close()
    POOL.join()

    print("Fin du client GPAO")
