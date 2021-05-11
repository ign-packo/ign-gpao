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
import socket
import signal
import tempfile
import shlex
import platform
import ctypes
import requests

HOSTNAME = socket.gethostname()
NB_PROCESS = multiprocessing.cpu_count()
URL_API = "http://" \
    + os.getenv('URL_API', 'localhost') \
    + ":"+os.getenv('API_PORT', '8080') \
    + "/api/"
# espace libre minimal en Go sur un dossier de travail pour accepter un job
MIN_AVAILABLE_SPACE = 5
# duree minimale en s entre deux requetes de mise a jour du log
MIN_FLUSH_RATE = 5


def get_free_space_gb(dirname):
    """ Fonction renvoyant l'espace disque disponible """
    space_available = 0
    if platform.system() == 'Windows':
        free_bytes = ctypes.c_ulonglong(0)
        ctypes.windll.kernel32.GetDiskFreeSpaceExW(
            ctypes.c_wchar_p(dirname),
            None,
            None,
            ctypes.pointer(free_bytes)
        )
        space_available = free_bytes.value / 1024 / 1024 / 1024
    else:
        stat = os.statvfs(dirname)
        space_available = stat.f_bavail * stat.f_frsize / 1024 / 1024 / 1024

    return space_available


def read_stdout_process(proc, id_job):
    """ Lecture de la sortie console """
    last_flush = time.time()
    realtime_output = ''
    while True:
        realtime_output += proc.stdout.readline()

        if proc.poll() is not None:
            if len(realtime_output) > 0:
                requests.post(URL_API +
                              'job/' +
                              str(id_job) +
                              '/appendLog',
                              json={"log": realtime_output})
            break

        if len(realtime_output) > 0 and \
           (time.time() - last_flush) > MIN_FLUSH_RATE:
            requests.post(URL_API +
                          'job/' +
                          str(id_job) +
                          '/appendLog',
                          json={"log": realtime_output})
            realtime_output = ''
            last_flush = time.time()


def launch_command(job, str_thread_id, shell, working_dir):
    """ Lancement d'une ligne de commande """
    id_job = job['id']
    command = job['command']
    print(str_thread_id, "L'identifiant du job " +
          str(id_job) +
          " est disponible" +
          " Execution de la commande [" +
          str(command) +
          "]")
    return_code = None
    error_message = ''
    try:
        if not shell:
            command = shlex.split(command, posix=False)
        with subprocess.Popen(command,
                              shell=shell,
                              stdout=subprocess.PIPE,
                              stderr=subprocess.STDOUT,
                              encoding='utf8',
                              errors='replace',
                              universal_newlines=True,
                              cwd=working_dir) as proc:
            read_stdout_process(proc, id_job)
            return_code = proc.poll()
            status = 'done'
    except subprocess.CalledProcessError as ex:
        status = 'failed'
        error_message += str(ex)
    except OSError as ex:
        status = 'failed'
        error_message += str(ex)
    if return_code != 0:
        status = 'failed'
        if return_code is None:
            return_code = -1
    if error_message:
        print('Erreur : '+error_message)
    error_message += 'FIN'
    return id_job, return_code, status, error_message


def process(thread_id):
    """ Traitement pour un thread """
    str_thread_id = "["+str(thread_id)+"] : "
    id_session = -1
    # AB : Il faut passer shell=True sous windows
    # pour que les commandes systemes soient reconnues
    shell = platform.system() == 'Windows'

    try:
        # On cree un dossier temporaire dans le dossier
        # courant qui devient le dossier d'execution
        with tempfile.TemporaryDirectory(dir='.') as working_dir:

            req = requests.put(URL_API +
                               'session?host=' +
                               HOSTNAME)
            id_session = req.json()[0]['id']
            print(str_thread_id +
                  ' : working dir (' +
                  working_dir +
                  ') id_session (' +
                  str(id_session) +
                  ')')
            while True:
                # on verifie l'espace disponible dans le dossier de travail
                free_gb = get_free_space_gb(working_dir)
                req = None
                if free_gb < MIN_AVAILABLE_SPACE:
                    print('espace disque insuffisant : ',
                          free_gb,
                          '/',
                          MIN_AVAILABLE_SPACE)
                else:
                    req = requests.get(URL_API +
                                       'job/ready?id_session=' +
                                       str(id_session))
                if req and req.json():
                    id_job, return_code, status, error_message =\
                        launch_command(req.json()[0],
                                       str_thread_id,
                                       shell, working_dir)
                    print('Mise a jour : ', return_code, status, error_message)
                    req = requests.post(URL_API +
                                        'job?id=' +
                                        str(id_job) +
                                        '&status=' +
                                        str(status) +
                                        '&returnCode=' +
                                        str(return_code),
                                        json={"log": error_message})
                    if req.status_code != 200:
                        print('Error : ',
                              req.status_code,
                              req.content)

                time.sleep(random.randrange(10))
    except KeyboardInterrupt:
        print("on demande au process de s'arreter")
        req = requests.post(URL_API +
                            'session/close?id=' +
                            str(id_session))
    print(str_thread_id, "end thread ")


if __name__ == "__main__":

    print("Demarrage du client GPAO")
    print("HOSTNAME : ", HOSTNAME)
    print("URL_API : "+URL_API)

    with multiprocessing.Pool(NB_PROCESS) as POOL:
        signal.signal(signal.SIGINT, signal.SIG_IGN)

        try:
            POOL.map(process, range(NB_PROCESS))

        except KeyboardInterrupt:
            print("on demande au pool de s'arreter")
            POOL.terminate()
        else:
            print("Normal termination")
            POOL.close()
        POOL.join()

    print("Fin du client GPAO")
