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
nb_process = multiprocessing.cpu_count()
url_api = os.getenv('URL_API', 'localhost')
MIN_AVAILABLE_SPACE = 1


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

        req = requests.put('http://' +
                           url_api +
                           ':8080/api/session?host=' +
                           HostName)
        id_session = req.json()[0]['id']
        print(str_id, "id_session = ", str(id_session))
        while True:
            # on verifie l'espace disponible dans le dossier de travail
            stat = os.statvfs(working_dir.name)
            free_gb = int(stat.f_frsize * stat.f_bavail / (1024 * 1024 * 1024))
            req = None
            if free_gb < MIN_AVAILABLE_SPACE:
                print('espace disque insuffisant : ',
                      free_gb,
                      '/',
                      MIN_AVAILABLE_SPACE)
            else:
                req = requests.get('http://' +
                                   url_api +
                                   ':8080/api/job/ready?id_session=' +
                                   str(id_session))
            if (req) and (req.json()):
                id_job = req.json()[0]['id']
                print(str_id, "L'identifiant du job " +
                      str(id_job) + " est disponible")
                print(str_id, "Execution de la commande [" +
                      str(req.json()[0]['command'])+"]")
                return_code = 999
                try:
                    proc = subprocess.Popen(req.json()[0]['command'].split(),
                                            stdout=subprocess.PIPE,
                                            stderr=subprocess.STDOUT,
                                            cwd=working_dir.name)
                    (out, _) = proc.communicate()
                    status = 'done'
                    return_code = proc.returncode
                    json_data = out.decode()

                except subprocess.CalledProcessError as ex:
                    print('failed : ', ex)
                    status = 'failed'
                    json_data += str(ex)

                except FileNotFoundError as ex:
                    print('failed : ', ex)
                    status = 'failed'
                    json_data += str(ex)

                if return_code != 0:
                    status = 'failed'

                print('Mise a jour : ', return_code, status, json_data)
                req = requests.post('http://' + url_api +
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
                            url_api +
                            ':8080/api/session/close?id=' +
                            str(id_session))
    print(str_id, "end thread ")


if __name__ == "__main__":

    print("Demarrage du client GPAO")
    print("Hostname : ", HostName)

    POOL = multiprocessing.Pool(nb_process)
    signal.signal(signal.SIGINT, signal.SIG_IGN)

    try:
        POOL.map(process, range(nb_process))

    except KeyboardInterrupt:
        print("on demande au pool de s'arreter")
        POOL.terminate()
    else:
        print("Normal termination")
        POOL.close()
    POOL.join()

    print("Fin du client GPAO")
