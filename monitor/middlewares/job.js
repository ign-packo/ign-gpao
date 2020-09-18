const axios = require('axios');

async function getJobs(req, res, next) {
  const json = await axios.get(`${req.app.api_url}/api/jobs`);

  req.body = json.data;
  next();
}

module.exports = {
  getJobs,
};
