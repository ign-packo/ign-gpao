const axios = require('axios');

async function getDependencies(req, res, next) {
  const json = await axios.get(`${req.app.get('apiUrl')}/api/dependencies?id_job=${req.params.id}`);

  req.dependencies_data = JSON.stringify(json.data);
  req.dependencies_columns = JSON.stringify([
    {
      title: 'Id',
      data: 'dep_id',
    },
    {
      title: 'Job en amont',
      data: 'dep_up',
    },
    {
      title: 'Nom du job',
      data: 'job_name',
    },
    {
      title: 'Statut',
      data: 'job_status',
    },
    {
      title: 'Active',
      data: 'dep_active',
    },
  ]);
  req.deps = json.data;
  next();
}

module.exports = {
  getDependencies,
};
