const axios = require('axios');

async function getHosts(req, res, next) {
  const json = await axios.get(`${req.app.api_url}/api/nodes`);

  req.body = json.data;
  next();
}

module.exports = {
  getHosts,
};
