const router = require('express').Router();

const changeLog = require('../../middlewares/changeLog');
const returnMsg = require('../../middlewares/returnMsg');

router.get('/changeLog',
  changeLog.getChangeLog,
  returnMsg);

module.exports = router;
