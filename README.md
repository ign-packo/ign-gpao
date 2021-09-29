# Introduction

Ce projet a pour but de pouvoir lancer et de répartir des traitements sur plusieurs machine ou VM et de les traiter en sur plusieurs coeurs de calcul.

# Modele de données

![](doc/BD_gpao.drawio.png)

## Architecture en utilisant docker-compose

![](doc/docker-compose.png)

## Architecture en en utilisant docker swarm

ToDo : Faire un jolie schéma

## Ouverture des ports

| Service       | Port | Url                            |
|:------------- | ---- | ------------------------------ |
| Postgres      | 5432 |                                |
| Api           | 8080 | http://localhost:8080/api/**** |
| Api doc       | 8080 | http://localhost:8080/api/doc  |
| Moniteur      | 8000 | http://localhost:8000/         |
| Client 1... N |      |                                |

## Lancement de la stack

A la racine du projet se trouve le script `build-image.sh` à lancer impérativement à la première utilisation car il permet de construire les images composant la stack applicative.

Ensuite le script `start.sh` lance les différents service en s'appuyant sur le fichier descriptif `docker-compose.yml``.

[Installation du client](./client/INSTALL.md)

