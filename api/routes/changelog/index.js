const router = require('express').Router();

const log = require('../../middlewares/changelog');
const returnMsg = require('../../middlewares/returnMsg');

router.get('/changeLog',
  log.getChangeLog,
  returnMsg);

module.exports = router;
