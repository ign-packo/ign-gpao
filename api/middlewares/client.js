const debug = require('debug')('client');
const AdmZip = require('adm-zip');

async function getClient(req, res, next) {
  debug('getClient');

  const zip = new AdmZip();
  debug(`dirname = ${__dirname}`);
  zip.addLocalFile(`${__dirname}/../../client/client.py`);
  zip.addLocalFile(`${__dirname}/../../client/start.sh`);

  // AB : A decommenter lorsque ce fichier sera dans le dépôt
  // zip.addLocalFile(`${__dirname}/../../client/start.bat`);

  // AB : On ajoute un fichier de version pour pouvoir faire un
  // contrôle sur les version au lacement du client ?

  const data = zip.toBuffer();
  const zipName = 'client.zip';

  zip.writeZip(`${zipName}`);

  debug(`Zip : ${__dirname}/../${zipName}`);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Description,content-disposition');
  res.setHeader('Content-Length', data.length);
  res.send(data);
  debug('Fin getClient');

  next();
}

module.exports = {
  getClient,
};
