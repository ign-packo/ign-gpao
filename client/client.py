"""
Client pour la GPAO
Permet de lancer un thread par coeur
"""
# !/usr/bin/python
import sys
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
import argparse
import logging
import requests

HOSTNAME = socket.gethostname()
NB_PROCESS = multiprocessing.cpu_count()

logging.basicConfig(
    handlers=[
        logging.FileHandler("client.log"),
        logging.StreamHandler()
    ],
    format='%(asctime)s %(levelname)-5s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S')

URL_API = (
    "http://"
    + os.getenv("URL_API", "localhost")
    + ":"
    + os.getenv("API_PORT", "8080")
    + "/api/"
)
# espace libre minimal en Go sur un dossier de travail pour accepter un job
MIN_AVAILABLE_SPACE = 5
# duree minimale en s entre deux requetes de mise a jour du log
MIN_FLUSH_RATE = 5


def send_request(url, mode, json=None, str_thread_id=None):
    """ Fonction executant les requetes http """
    success = False
    logging.debug("%s : %s : %s%s", str_thread_id, mode, URL_API, url)
    while not success:
        try:
            if mode == "GET":
                req = requests.get(URL_API+url)
                req.raise_for_status()
                return req
            if mode == "PUT":
                req = requests.put(URL_API+url)
                req.raise_for_status()
                return req
            if mode == "POST":
                req = requests.post(URL_API+url, json=json)
                req.raise_for_status()
                return req
        except requests.exceptions.Timeout:
            logging.error("%s : timeout sur l'url : %s", str_thread_id, url)
            time.sleep(1)
        except requests.exceptions.TooManyRedirects:
            logging.error("%s : timeout sur l'url : %s", str_thread_id, url)
            time.sleep(1)
        except requests.exceptions.RequestException as exception:
            logging.error("%s : Erreur sur la requete : %s",
                          str_thread_id, url)
            logging.error("%s : Erreur %s", str_thread_id, exception)
            time.sleep(1)


def get_free_space_gb(dirname):
    """ Fonction renvoyant l'espace disque disponible """
    space_available = 0
    if platform.system() == "Windows":
        free_bytes = ctypes.c_ulonglong(0)
        ctypes.windll.kernel32.GetDiskFreeSpaceExW(
            ctypes.c_wchar_p(dirname), None, None, ctypes.pointer(free_bytes)
        )
        space_available = free_bytes.value / 1024 / 1024 / 1024
    else:
        stat = os.statvfs(dirname)
        space_available = stat.f_bavail * stat.f_frsize / 1024 / 1024 / 1024

    return space_available


def read_stdout_process(proc, id_job, str_thread_id, command):
    """ Lecture de la sortie console """
    last_flush = time.time()
    realtime_output = "Commande : "+str(command)+"\n\n"
    while True:
        realtime_output += proc.stdout.readline()

        if proc.poll() is not None:
            # entre temps, des nouveaux messages sont peut-etre arrives
            for line in proc.stdout.readlines():
                realtime_output += line

            if realtime_output:
                url_tmp = "job/" + str(id_job) + "/appendLog"

                send_request(url_tmp,
                             "POST",
                             json={"log": realtime_output},
                             str_thread_id=str_thread_id)
            break

        if (realtime_output and (time.time() - last_flush) > MIN_FLUSH_RATE):
            url_tmp = "job/" + str(id_job) + "/appendLog"

            send_request(url_tmp,
                         "POST",
                         json={"log": realtime_output},
                         str_thread_id=str_thread_id)

            realtime_output = ""
            last_flush = time.time()


def launch_command(job, str_thread_id, shell, working_dir):
    """ Lancement d'une ligne de commande """
    id_job = job["id"]
    command = job["command"]

    command = os.path.expandvars(command)

    logging.info("%s L'id du job %s est disponible. "
                 "Execution de la commande [%s]",
                 str_thread_id, id_job, command)
    return_code = None
    error_message = ""
    try:
        if not shell:
            command = shlex.split(command, posix=False)
        with subprocess.Popen(
            command,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            encoding="utf8",
            errors="replace",
            universal_newlines=True,
            cwd=working_dir,
        ) as proc:
            read_stdout_process(proc, id_job, str_thread_id, command)
            return_code = proc.poll()
            status = "done"
    except subprocess.CalledProcessError as ex:
        status = "failed"
        error_message += str(ex)
    except OSError as ex:
        status = "failed"
        error_message += str(ex)
    if return_code != 0:
        status = "failed"
        if return_code is None:
            return_code = -1
    if error_message:
        logging.error("Erreur : %s", error_message)
    error_message += "FIN"
    return id_job, return_code, status, error_message


def process(parameters):
    """ Traitement pour un thread """
    str_thread_id = "[" + str(parameters[0]) + "]"
    tags = parameters[1]
    id_session = -1
    # AB : Il faut passer shell=True sous windows
    # pour que les commandes systemes soient reconnues
    shell = platform.system() == "Windows"

    try:
        # On cree un dossier temporaire dans le dossier
        # courant qui devient le dossier d'execution
        with tempfile.TemporaryDirectory(dir=".") as working_dir:

            url = "session?host=" + HOSTNAME
            if tags:
                url += id_session + "&tags=" + tags

            req = send_request(url, "PUT", str_thread_id=str_thread_id)

            id_session = req.json()[0]["id"]
            logging.info("%s : working dir (%s) id_session (%s)",
                         str_thread_id, working_dir, id_session)
            while True:
                # on verifie l'espace disponible dans le dossier de travail
                free_gb = get_free_space_gb(working_dir)
                req = None
                if free_gb < MIN_AVAILABLE_SPACE:
                    logging.warning(
                        "Espace disque insuffisant : %s/%s",
                        free_gb,
                        MIN_AVAILABLE_SPACE
                        )
                else:
                    url_tmp = "job/ready?id_session=" + str(id_session)
                    req = send_request(url_tmp,
                                       "GET",
                                       str_thread_id=str_thread_id)
                if req and req.json():
                    (
                        id_job,
                        return_code,
                        status,
                        error_message,
                    ) = launch_command(
                        req.json()[0], str_thread_id, shell, working_dir
                    )

                    logging.info("%s Maj du job: %s, code_retour: %s, "
                                 "status : %s, error : %s",
                                 str_thread_id,
                                 id_job, return_code,
                                 status,
                                 error_message)

                    url_tmp = ("job?id=" + str(id_job) +
                               "&status=" + str(status) +
                               "&returnCode=" + str(return_code))

                    req = send_request(url_tmp,
                                       "POST",
                                       json={"log": error_message},
                                       str_thread_id=str_thread_id)

                    if req.status_code != 200:
                        logging.error("%s Mauvais statut code : %s, %s",
                                      str_thread_id,
                                      req.status_code,
                                      req.content)

                time.sleep(random.randrange(10))
    except KeyboardInterrupt:
        logging.info("%s : on demande au process de s'arreter", str_thread_id)

        req = send_request("session/close?id=" + str(id_session),
                           "POST",
                           str_thread_id=str_thread_id)

    logging.info("%s : Fin du thread", str_thread_id)


if __name__ == "__main__":
    logging.info("Demarrage du client GPAO")
    logging.info("URL_API : %s", URL_API)

    PARSER = argparse.ArgumentParser()
    PARSER.add_argument(
        "-n",
        "--threads",
        required=False,
        type=int,
        help="fix the number of threads \
                        (default: estimated number of cpu on the system)",
    )
    PARSER.add_argument(
        "-s",
        "--suffix",
        help="add a suffix on the hostname \
                        (necessary if using several \
                        client instances on a machine)",
        required=False,
        type=str,
    )
    PARSER.add_argument(
        "-t",
        "--tags",
        required=False,
        type=str,
        default="",
        help="comma separated list of tags",
    )
    ARGS = PARSER.parse_args()

    logging.debug(ARGS)
    if ARGS.threads:
        if ARGS.threads <= 0:
            logging.error("Le nombre de thread doit etre >0 : %s",
                          ARGS.threads)
            sys.exit(1)
        NB_PROCESS = ARGS.threads
    if ARGS.suffix:
        HOSTNAME += ARGS.suffix

    logging.info("HOSTNAME : %s", HOSTNAME)
    logging.info("NB_PROCESS : %s", NB_PROCESS)

    REQ_NB_SESSIONS = send_request("nodes", "GET")

    NODES = REQ_NB_SESSIONS.json()
    NB_SESSION = 0
    for node in NODES:
        if node["host"] == HOSTNAME:
            # attention, les donnees sont en string
            # a corriger dans l'API
            NB_SESSION = (
                int(node["active"]) + int(node["idle"]) + int(node["running"])
            )
    if NB_SESSION > 0:
        logging.error("Erreur: il y a deja des sessions "
                      "ouvertes avec ce nom de machine.")
        logging.error("Pour lancer plusieurs client sur une meme machine,"
                      " utiliser un suffixe "
                      "(ex: python client.py -s _MonSuffixe).")
        sys.exit(1)

    with multiprocessing.Pool(NB_PROCESS) as POOL:
        signal.signal(signal.SIGINT, signal.SIG_IGN)

        PARAMETERS = []
        for id_thread in range(NB_PROCESS):
            PARAMETERS.append((id_thread, ARGS.tags))

        try:
            POOL.map(process, PARAMETERS)

        except KeyboardInterrupt:
            logging.info("on demande au pool de s'arreter")
            POOL.terminate()
        else:
            logging.info("Normal termination")
            POOL.close()
        POOL.join()

    logging.info("Fin du client GPAO")
