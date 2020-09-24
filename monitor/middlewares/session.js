const axios = require('axios');

async function getSessions(req, res, next) {
  const json = await axios.get(`${req.app.api_url}/api/sessions`);

  req.body = json.data;
  next();
}

module.exports = {
  getSessions,
};
