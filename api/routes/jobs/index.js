const router = require('express').Router()
const { query, body, param, oneOf } = require('express-validator/check');

const jobs = require('./../../middlewares/jobs')

router.get('/job/ready', jobs.getJobReady)
router.get('/jobs', jobs.getAllJobs)
router.post('/job/:id/:status(done|failed)',
    body('log').exists(),
    jobs.updateJobStatus)

module.exports = router
