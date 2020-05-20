const router = require('express').Router();
const {
  query, body,
} = require('express-validator/check');

const validateParams = require('../../middlewares/validateParams');
const createErrorMsg = require('../../middlewares/createErrorMsg');
const jobs = require('../../middlewares/jobs');
const pgClient = require('../../middlewares/db/pgClient');
const returnMsg = require('../../middlewares/returnMsg');

router.get('/job/ready', [
  query('id_cluster')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('id_cluster'))
    .isInt({ min: 1 })
    .withMessage(createErrorMsg.getInvalidParameterMsg('id_cluster')),
],
validateParams,
pgClient.open,
jobs.getJobReady,
pgClient.close,
returnMsg);

router.get('/jobs',
  pgClient.open,
  jobs.getAllJobs,
  pgClient.close,
  returnMsg);

router.post('/job', [
  body('log').exists().withMessage(createErrorMsg.getMissingParameterMsg('log')),
  query('status')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('status'))
    .isIn(['done', 'failed'])
    .withMessage(createErrorMsg.getInvalidParameterMsg('status')),
  query('id')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('id'))
    .isInt({ min: 1 })
    .withMessage(createErrorMsg.getInvalidParameterMsg('id')),

  query('returnCode')
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('returnCode'))
    .isInt({ min: 0 })
    .withMessage(createErrorMsg.getInvalidParameterMsg('returnCode')),
],
validateParams,
pgClient.open,
jobs.updateJobStatus,
pgClient.close,
returnMsg);

module.exports = router;
