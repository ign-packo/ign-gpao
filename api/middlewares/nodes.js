const { matchedData } = require('express-validator/filter');
const debug = require('debug')('nodes');

async function getAllNodes(req, res, next) {
  debug('getAllNodes');
  await req.client.query('SELECT host, status, count(*) FROM sessions S GROUP BY host, status')
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'getAllSessions',
      };
    });
  next();
  debug('fin');
}

async function setNbActiveNodes(req, res, next) {
  debug('setNbActiveNodes');
  const params = matchedData(req);
  const { host } = params;
  const { limit } = params;
  debug(`host = ${host}`);
  debug(`limit = ${limit}`);
  await req.client.query('UPDATE sessions SET status = ('
    + 'CASE '
      + "WHEN status = 'idle' AND id in (SELECT id FROM sessions WHERE host=$1 AND status <> 'closed' ORDER BY id LIMIT $2) THEN 'active'::session_status "
      + "WHEN status = 'idle_requested' AND id in (SELECT id FROM sessions WHERE host=$1 AND status <> 'closed' ORDER BY id LIMIT $2) THEN 'running'::session_status "
      + "WHEN status = 'active' AND id not in (SELECT id FROM sessions WHERE host=$1 AND status <> 'closed' ORDER BY id LIMIT $2) THEN 'idle'::session_status "
      + "WHEN status = 'running' AND id not in (SELECT id FROM sessions WHERE host=$1 AND status <> 'closed' ORDER BY id LIMIT $2) THEN 'idle_requested'::session_status "
      + 'ELSE status '
    + "END) WHERE status <> 'closed'", [host, limit])
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'setNbActiveNodes',
      };
    });
  next();
  debug('fin');
}

module.exports = {
  getAllNodes,
  setNbActiveNodes,
};
