const axios = require('axios');
const serveur = require('../serveur');

async function getSessions(req, res, next) {
  const json = await axios.get(`http://${serveur.URL_API}:${serveur.URL_API_PORT}/api/sessions`);

  req.body = json.data;
  next();
}

module.exports = {
  getSessions,
};
