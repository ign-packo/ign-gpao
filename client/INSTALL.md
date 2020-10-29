# Client GPAO

*Le client GPAO est un script python qui va chercher et executer les jobs disponibles dans la GPAO au travers de l'API.*

Une fois le client téléchargé, il y a un quelques étapes à réaliser pour qu'il se lance correctement.

## 1. Prérequis

Avoir une version de python supérieur à la version 3.

## 2. Installation des dépendances

*L'installation des dépendances repose sur le gestionnaire de paquet pip*

Si il n'est pas disponible directement, il est possible de l'activer en créant un environement virtuel via la commande :

`python -m venv gpao-client-env`

### Windows

`gpao-client-env\Scripts\activate.bat`

### Linux et MacOS

`source gpao-client-env/bin/activate`

## 3. Configuration de l'API

Pour se connecter à l'api le client utilise une variable d'environement `URL_API` qui doit pointer sur le bon serveur.

### Windows

Sous windows dans l'invite de commande qui va executer le script, il faut au préalable faire `set URL_API=NOM_SERVER`

### Linux et MacOS

Sous linux et macOS dans le terminal qui va executer le script, il faut au préalable configurer cette variable avec la commande : `export URL_API=NOM_SERVER`

Une fois `pip` disponible, il faut télécharger les dépendances au client via la commande : `pip install -r requirements.txt`.
Si vous travaillez derriére un proxy il faut le configurer via l'option `--proxy`.

La commande sera donc :

`pip --proxy [user:passwd@]proxy.server:port install -r requirements.txt`

## 4. Execution du client

`start.bat` ou `start.sh` selon votre OS.
