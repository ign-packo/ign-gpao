const { matchedData } = require('express-validator/filter');

async function getAllClusters(req, res, next) {
  await req.pgPool.query('SELECT * FROM cluster')
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'getAllClusters',
      };
    });
  next();
}


async function insertCluster(req, res, next) {
  const params = matchedData(req);

  const { host } = params;

  await req.pgPool.query(
    'INSERT INTO cluster (host, id_thread, active, available) VALUES ( $1 , (select count(id) from cluster where host = $2), true, true ) RETURNING id',
    [host, host],
  )
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertCluster',
      };
    });
  next();
}

module.exports = {
  getAllClusters,
  insertCluster,
};
