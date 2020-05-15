const axios = require('axios');
const serveur = require('../serveur');

async function getProjects(req, res, next) {
  const json = await axios.get(`http://${serveur.URL_API}:${serveur.URL_API_PORT}/api/projects`);

  req.body = json.data;
  next();
}

module.exports = {
  getProjects,
};
