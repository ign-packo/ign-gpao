const router = require('express').Router();
const { body } = require('express-validator/check');

const validateParams = require('../../middlewares/validateParams');
const createErrorMsg = require('../../middlewares/createErrorMsg');
const validator = require('../../validator');
const project = require('../../middlewares/project');
const pgClient = require('../../middlewares/db/pgClient');
const returnMsg = require('../../middlewares/returnMsg');

router.put('/project',
  body()
    .exists().withMessage(createErrorMsg.getMissingParameterMsg('body'))
    .custom(validator.checkProjectSchema)
    .withMessage(createErrorMsg.getInvalidProjectSchema())
    .custom(validator.checkProjectDependencies)
    .withMessage(createErrorMsg.getInvalidProjectDependencies())
    .custom(validator.checkJobDependencies)
    .withMessage(createErrorMsg.getInvalidJobsDependencies()),
  validateParams,
  pgClient.open,
  project.insertProjectFromJson,
  pgClient.close,
  returnMsg);

router.get('/projects',
  pgClient.open,
  project.getAllProjects,
  pgClient.close,
  returnMsg);

module.exports = router;
