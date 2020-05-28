const router = require('express').Router();
const {
  query,
} = require('express-validator/check');

const validateParams = require('../../middlewares/validateParams');
const createErrorMsg = require('../../middlewares/createErrorMsg');
const sessions = require('../../middlewares/sessions');
const pgClient = require('../../middlewares/db/pgClient');
const returnMsg = require('../../middlewares/returnMsg');

router.get('/sessions',
  pgClient.open,
  sessions.getAllSessions,
  pgClient.close,
  returnMsg);

router.put('/session', [
  query('host')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('host'))],
validateParams,
pgClient.open,
sessions.insertSession,
pgClient.close,
returnMsg);

router.post('/cluster/unavailable', [
  query('id')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('id'))
    .isInt({ min: 1 })
    .withMessage(createErrorMsg.getInvalidParameterMsg('id')),
],
validateParams,
pgClient.open,
clusters.unavailableCluster,
pgClient.close,
returnMsg);

module.exports = router;
