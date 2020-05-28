const { matchedData } = require('express-validator/filter');
const debug = require('debug')('job');

async function getAllSessions(req, res, next) {
  await req.client.query('SELECT * FROM sessions')
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'getAllSessions',
      };
    });
  next();
}


async function insertSession(req, res, next) {
  const params = matchedData(req);

  const { host } = params;

  await req.client.query(
    'INSERT INTO sessions (host, id_thread, start_date) VALUES ( $1 , (select count(id) from sessions where host = $2), NOW()) RETURNING id',
    [host, host],
  )
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertSession',
      };
    });
  next();
}

async function unavailableCluster(req, res, next) {
  const params = matchedData(req);
  const { id } = params;
  debug('update ', id);
  await req.client.query('UPDATE cluster SET available=\'False\' WHERE id=$1', [id])
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'updateCluster',
      };
    });
  next();
}

module.exports = {
  getAllSessions,
  insertSession,
};
