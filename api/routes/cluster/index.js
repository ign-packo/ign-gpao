const router = require('express').Router();
const {
  query,
} = require('express-validator/check');

const validateParams = require('../../middlewares/validateParams');
const createErrorMsg = require('../../middlewares/createErrorMsg');
const clusters = require('../../middlewares/cluster');
const pgClient = require('../../middlewares/db/pgClient');
const returnMsg = require('../../middlewares/returnMsg');

router.get('/clusters',
  pgClient.open,
  clusters.getAllClusters,
  pgClient.close,
  returnMsg);

router.put('/cluster', [
  query('host')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('host'))],
validateParams,
pgClient.open,
clusters.insertCluster,
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
