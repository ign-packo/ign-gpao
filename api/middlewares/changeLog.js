const debug = require('debug')('changeLog');

async function getChangeLog(req, res, next) {
  debug('changeLog');

  debug('Fin changeLog');

  next();
}

module.exports = {
  getChangeLog,
};
