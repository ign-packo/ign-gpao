const { matchedData } = require('express-validator/filter')

async function getAllJobs(req, res, next){
  await req.pgPool.query("SELECT * FROM jobs")
            .then(results => req.result = results.rows)
            .catch(error => req.error = {
              msg: error.toString(),
              code: 500,
              function : "getAlljobs"
            })
  next()
}

async function getJobReady(req, res, next){
  var params = matchedData(req)

  const id = params.id_cluster
	await req.pgPool.query(
    "UPDATE jobs SET status = 'running', start_date=NOW(), id_cluster = $1 WHERE id = (SELECT id FROM jobs WHERE status = 'ready' LIMIT 1) RETURNING id, command", [id])
    .then(results => req.result = results.rows)
    .catch(error => req.error = {
      msg: error.toString(),
      code: 500,
      function : "getJobReady"
    })
    next()
}

async function updateJobStatus(req, res, next){
  var params = matchedData(req)
  
  debug = require('debug')('job')

  const id = params.id
  const status = params.status
  const return_code = params.return_code
  const log = params.log
  
  debug("id = "+id)
  debug("status = "+status)
  debug("return_code = "+return_code)
  debug("log = "+log)
	
  await req.pgPool.query(
    'UPDATE jobs SET status = $1, log = $2, return_code = $4, end_date=NOW() WHERE id = $3', [status, log, id, return_code])
    .then(results => req.result = results.rows)
    .catch(error => req.error = {
      msg: error.toString(),
      code: 500,
      function : "updateJobStatus"
    })
    next()
}

module.exports = {
	getAllJobs,
	getJobReady,
	updateJobStatus
}
