#!/usr/bin/python
import requests
import subprocess
import json
import time
import os


if __name__ == "__main__":

    print("Demarrage du client GPAO")

    url_api = os.getenv('URL_API', 'localhost')

    print(url_api)

    while True:
        print("Recherche d'un nouveau job")
        req=requests.get('http://'+url_api+':8080/api/job/ready')
        #print (req.json())
        if(len(req.json())!=0):
            id = req.json()[0]['id']
            command = req.json()[0]['command']

            print("L'identifiant du job "+str(id)+" est disponible")

            print("Execution de la commande "+ str(command))
            array_command = command.split()
            return_code = -1
            try:
                proc = subprocess.Popen(array_command, stdout=subprocess.PIPE)
                (out, err) = proc.communicate()
                status='done'
                return_code = proc.returncode
                json_data = out.decode()

            except Exception as ex:
                status='failed'
                json_data=str(ex)
                print('failed', ex)
            
            if (return_code != 0):
                status='failed'
                print("le job a echoue")

            req=requests.post('http://'+url_api+':8080/api/job/'+str(id)+'/'+str(status)+'/'+str(return_code), json={"log": json_data})
        else:
            print("Aucun job disponible dans la base")

        time.sleep(5)