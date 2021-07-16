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
import requests

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


def read_stdout_process(proc, id_job):
    """ Lecture de la sortie console """
    last_flush = time.time()
    realtime_output = ""
    while True:
        realtime_output += proc.stdout.readline()

        if proc.poll() is not None:
            # entre temps, des nouveaux messages sont peut-etre arrives
            for line in proc.stdout.readlines():
                realtime_output += line
            if len(realtime_output) > 0:
                requests.post(
                    URL_API + "job/" + str(id_job) + "/appendLog",
                    json={"log": realtime_output},
                )
            break

        if (
            len(realtime_output) > 0
            and (time.time() - last_flush) > MIN_FLUSH_RATE
        ):
            requests.post(
                URL_API + "job/" + str(id_job) + "/appendLog",
                json={"log": realtime_output},
            )
            realtime_output = ""
            last_flush = time.time()


def launch_command(job, str_thread_id, shell, working_dir):
    """ Lancement d'une ligne de commande """
    id_job = job["id"]
    command = job["command"]
    print(
        str_thread_id,
        "L'identifiant du job "
        + str(id_job)
        + " est disponible"
        + " Execution de la commande ["
        + str(command)
        + "]",
    )
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
            read_stdout_process(proc, id_job)
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
        print("Erreur : " + error_message)
    error_message += "FIN"
    return id_job, return_code, status, error_message


def process(param):
    """ Traitement pour un thread """
    thread_id = param[0]
    hostname = param[1]
    tags = param[2]
    str_thread_id = "[" + str(thread_id) + "] : "
    id_session = -1
    # AB : Il faut passer shell=True sous windows
    # pour que les commandes systemes soient reconnues
    shell = platform.system() == "Windows"

    try:
        # On cree un dossier temporaire dans le dossier
        # courant qui devient le dossier d'execution
        with tempfile.TemporaryDirectory(dir=".") as working_dir:

            url = URL_API + "session?host=" + hostname
            if tags:
                url += "&tags=" + tags

            print(url)

            req = requests.put(url)
            id_session = req.json()[0]["id"]
            print(
                str_thread_id
                + " : working dir ("
                + working_dir
                + ") id_session ("
                + str(id_session)
                + ")"
            )
            while True:
                # on verifie l'espace disponible dans le dossier de travail
                free_gb = get_free_space_gb(working_dir)
                req = None
                if free_gb < MIN_AVAILABLE_SPACE:
                    print(
                        "espace disque insuffisant : ",
                        free_gb,
                        "/",
                        MIN_AVAILABLE_SPACE,
                    )
                else:
                    req = requests.get(
                        URL_API + "job/ready?id_session=" + str(id_session)
                    )
                if req and req.json():
                    (
                        id_job,
                        return_code,
                        status,
                        error_message,
                    ) = launch_command(
                        req.json()[0], str_thread_id, shell, working_dir
                    )
                    print("Mise a jour : ", return_code, status, error_message)
                    req = requests.post(
                        URL_API
                        + "job?id="
                        + str(id_job)
                        + "&status="
                        + str(status)
                        + "&returnCode="
                        + str(return_code),
                        json={"log": error_message},
                    )
                    if req.status_code != 200:
                        print("Error : ", req.status_code, req.content)

                time.sleep(random.randrange(10))
    except KeyboardInterrupt:
        print("on demande au process de s'arreter")
        req = requests.post(URL_API + "session/close?id=" + str(id_session))
    print(str_thread_id, "end thread ")


if __name__ == "__main__":
    HOSTNAME = socket.gethostname()
    NB_PROCESS = multiprocessing.cpu_count()

    print("Demarrage du client GPAO")
    print("URL_API : " + URL_API)

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-n",
        "--threads",
        required=False,
        type=int,
        help="fix the number of threads \
                        (default: estimated number of cpu on the system)",
    )
    parser.add_argument(
        "-s",
        "--suffix",
        help="add a suffix on the hostname \
                        (necessary if using several \
                        client instances on a machine)",
        required=False,
        type=str,
    )
    parser.add_argument(
        "-t",
        "--tags",
        required=False,
        type=str,
        default="",
        help="comma separated list of tags",
    )
    args = parser.parse_args()

    print(args)
    if args.threads:
        if args.threads <= 0:
            print("Le nombre de thread doit être >0 : ", args.threads)
            sys.exit(1)
        NB_PROCESS = args.threads
    if args.suffix:
        HOSTNAME += args.suffix

    print("HOSTNAME : ", HOSTNAME)
    print("NB_PROCESS : ", NB_PROCESS)

    req_nb_sessions = requests.get(URL_API + "nodes")
    nodes = req_nb_sessions.json()
    NB_SESSION = 0
    for node in nodes:
        if node["host"] == HOSTNAME:
            # attention, les donnees sont en string
            # a corriger dans l'API
            NB_SESSION = (
                int(node["active"]) + int(node["idle"]) + int(node["running"])
            )
    if NB_SESSION > 0:
        print(
            "Erreur: il y a déjà des sessions "
            "ouvertes avec ce nom de machine."
        )
        print(
            "Pour lancer plusieurs client sur une même machine, "
            "utiliser un suffixe (ex: python client.py -s _MonSuffixe)."
        )
        sys.exit(1)

    with multiprocessing.Pool(NB_PROCESS) as POOL:
        signal.signal(signal.SIGINT, signal.SIG_IGN)

        parameters = []
        for thread_number in range(NB_PROCESS):
            parameters.append((thread_number, HOSTNAME, args.tags))

        try:
            POOL.map(process, parameters)

        except KeyboardInterrupt:
            print("on demande au pool de s'arreter")
            POOL.terminate()
        else:
            print("Normal termination")
            POOL.close()
        POOL.join()

    print("Fin du client GPAO")
