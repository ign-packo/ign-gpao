const { matchedData } = require('express-validator/filter');
const debug = require('debug')('job');

async function getAllJobs(req, res, next) {
  await req.client.query('SELECT * FROM jobs')
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'getAlljobs',
      };
    });
  next();
}

async function getJobReady(req, res, next) {
  const params = matchedData(req);

  const id = params.id_cluster;
  try {
    await req.client.query('LOCK TABLE cluster IN EXCLUSIVE MODE');
    await req.client.query(
      "UPDATE jobs SET status = 'running', start_date=NOW(), id_cluster = $1 WHERE id = (SELECT id FROM jobs WHERE status = 'ready' LIMIT 1) RETURNING id, command", [id],
    ).then((results) => { req.result = results.rows; });
  } catch (error) {
    req.error = {
      msg: error.toString(),
      code: 500,
      function: 'getJobReady',
    };
  }
  next();
}

async function updateJobStatus(req, res, next) {
  const params = matchedData(req);
  const { id } = params;
  const { status } = params;
  const { returnCode } = params;
  const { log } = params;

  debug(`id = ${id}`);
  debug(`status = ${status}`);
  debug(`returnCode = ${returnCode}`);
  debug(`log = ${log}`);

  await req.client.query(
    'UPDATE jobs SET status = $1, log = $2, return_code = $4, end_date=NOW() WHERE id = $3', [status, log, id, returnCode],
  )
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'updateJobStatus',
      };
    });
  next();
}

function insertProject(req, res){	
  const projects = req.body.projects
  const projectDependencies = req.body.projectDependencies
  const jobs = req.body.jobs
  const jobDependencies = req.body.jobDependencies
  
  console.log(projects)
  console.log(projectDependencies)
  console.log(jobs)
  console.log(jobDependencies)

  // On cree les projets
  script = 'INSERT INTO projects (name) VALUES '
  first = true
  projects.forEach(project => {
    if (first){
      first = false
    }else{
      script += ','
    }
    script += '(\'' + project.name + '\')'
  })
  script += ' RETURNING id'

  console.log(script)
    pool.query(
      script,
      (error, results) => {
        // on recupere les id des projets
        results.rows.forEach( (row, i) => {
          projects[i].id = row.id
        })
        // on ajoute les projectDependencies
        // script = 'INSERT INTO projectDependencies (from_id, to_id) VALUES '
        // first = true
        // projectDependencies.forEach(projectDependencie => {
        //   if (first){
        //     first = false
        //   }else{
        //     script += ','
        //   }
        //   script += '( + projects[projectDependencie.from_id].id + ',' + projects[projectDependencie.to_id].id + ')'
        // })

        // on ajoute les jobs
        script = 'INSERT INTO jobs (name, command, id_project, status) VALUES '
        first = true
        jobs.forEach(job => {
          if (first){
            first = false
          }else{
            script += ','
          }
          script += '(\'' + job.name + '\',\'' + job.command + '\',' + projects[job.id_project].id + ', \'ready\')'
        })
        script += ' RETURNING id'
        pool.query(
          script,
          (error, results) => {
            // on recupere les id des jobs
            results.rows.forEach( (row, i) => {
              jobs[i].id = row.id
            })
            console.log(jobs)
            if (error) {
              throw error
            }
            res.status(200).send(`Project inserted`)
          })

        if (error) {
          throw error
        }
      }
    )
}

module.exports = {
  getAllJobs,
  getJobReady,
  updateJobStatus,
};
