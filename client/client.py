#!/usr/bin/python
import requests
import subprocess
import json
import time


if __name__ == "__main__":

    print("Demarrage du client GPAO")

    while True:
        print("Recherche d'un nouveau job")
        req=requests.get('http://localhost:3000/api/job/ready')
        #print (req.json())
        if(len(req.json())!=0):
            id = req.json()[0]['id']
            command = req.json()[0]['command']
            
            print("L'identifiant du job "+str(id)+" est disponible")

            print("Execution de la commande "+ str(command))
            array_command = command.split()
            proc = subprocess.Popen(array_command, stdout=subprocess.PIPE)
            (out, err) = proc.communicate()
            status='done'
            if (proc.returncode != 0):
                status='failed'
                print("le job a echoue")

            req=requests.post('http://localhost:3000/api/job/'+str(id)+'/'+str(status), data=out)
        else:
            print("Aucun job disponible dans la base")

        time.sleep(5)

        #break