const { matchedData } = require('express-validator/filter');
<<<<<<< HEAD
const debug = require('debug')('job');
=======
const debug = require('debug')('session');
>>>>>>> d317e49... gestion fermeture des sessions

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

async function closeSession(req, res, next) {
  debug('closeSession');
  const params = matchedData(req);

  const { id } = params;
  debug(id);

  await req.client.query(
    "UPDATE sessions SET status = 'closed', end_date=NOW() WHERE id=$1",
    [id],
  )
    .catch((error) => {
      debug(error);
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'closeSession',
      };
    });
  next();
  debug('fin');
}

module.exports = {
  getAllSessions,
  insertSession,
  closeSession,
};
