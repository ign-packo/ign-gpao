"""
Client pour la GPAO
Permet de lancer un thread par coeur
"""
# !/usr/bin/python
import multiprocessing
import random
import subprocess
import time
import os
import io
import socket
import signal
import tempfile
import shlex
import requests

HostName = socket.gethostname()
nb_process = multiprocessing.cpu_count()
url_api = os.getenv('URL_API', 'localhost')
MIN_AVAILABLE_SPACE = 1


def process(thread_id):
    """ Traitement pour un thread """
    str_id = "["+str(thread_id)+"] : "
    print(str_id, "begin")
    id_session = -1

    try:
        # On cree un dossier temporaire dans le dossier
        # courant qui devient le dossier d'execution
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
            if req and req.json():
                id_job = req.json()[0]['id']
                command = req.json()[0]['command']
                print(str_id, "L'identifiant du job " +
                      str(id_job) +
                      " est disponible")
                print(str_id,
                      "Execution de la commande [" +
                      str(command) +
                      "]")
                return_code = None
                error_message = ''
                try:
                    proc = subprocess.Popen(shlex.split(command),
                                            stdout=subprocess.PIPE,
                                            stderr=subprocess.PIPE,
                                            cwd=working_dir.name)
                    for line in io.TextIOWrapper(proc.stdout,
                                                 encoding="utf-8"):
                        req = requests.post('http://' +
                                            url_api +
                                            ':8080/api/job/' +
                                            str(id_job) +
                                            '/appendLog',
                                            json={"log": line})
                    return_code = proc.poll()

                    status = 'done'
                    error_message += proc.stderr.read().decode()

                except subprocess.CalledProcessError as ex:
                    print('failed : ', ex)
                    status = 'failed'
                    error_message += str(ex)

                except FileNotFoundError as ex:
                    print('failed : ', ex)
                    status = 'failed'
                    error_message += str(ex)

                if return_code != 0:
                    status = 'failed'
                    if return_code is None:
                        return_code = -1

                print('Mise a jour : ', return_code, status, error_message)
                req = requests.post('http://' +
                                    url_api +
                                    ':8080/api/job?id=' +
                                    str(id_job) +
                                    '&status=' +
                                    str(status) +
                                    '&return_code=' +
                                    str(return_code),
                                    json={"log": error_message})
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

    pool = multiprocessing.Pool(nb_process)
    signal.signal(signal.SIGINT, signal.SIG_IGN)

    try:
        pool.map(process, range(nb_process))

    except KeyboardInterrupt:
        print("on demande au pool de s'arreter")
        pool.terminate()
    else:
        print("Normal termination")
        pool.close()
    pool.join()

    print("Fin du client GPAO")
