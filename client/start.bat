REM AB : Encodage UTF8 de la console windows de python
chcp 65001

SET PYTHONIOENCODING=UTF-8

@REM set URL_API=del1709p042.ign.fr
@REM set URL_PORT=8080

@REM Pour neutraliser le proxy
set http_proxy=

python client.py