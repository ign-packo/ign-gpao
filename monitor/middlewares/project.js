const axios = require('axios');

async function getProjects(req, res, next) {
  const json = await axios.get(`${req.app.api_url}/api/projects`);

  req.body = json.data;
  next();
}

module.exports = {
  getProjects,
};
