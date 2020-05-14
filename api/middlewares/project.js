const { matchedData } = require('express-validator/filter')

debug = require('debug')('project')

async function insertProject(name, req){
  debug("Insertion du projet "+name)
  await req.pgPool.query(
      "INSERT INTO projects (name) VALUES ($1) RETURNING id", [name])
      .then(results => req.idProjects.push(results.rows[0].id))
      .catch(error => req.error = {
        msg: error.toString(),
        code: 500,
        function : "insertProject"
      })
      debug("Fin insertion projet")
}

async function insertJob(name, command, id_project, req){
  debug("Insertion du job "+name)
  await req.pgPool.query(
      "INSERT INTO jobs (name, command, id_project) VALUES ($1, $2, $3) RETURNING id", [name, command, id_project])
      .then(results => req.idJobs.push(results.rows[0].id))
      .catch(error => req.error = {
        msg: error.toString(),
        code: 500,
        function : "insertJob"
      })
      debug("Fin insertion job")
}

async function insertJobDependency(upstream, downstream, req){
  debug("Insertion  de la dependance entre le job "+upstream+" et "+downstream)
  await req.pgPool.query(
      "INSERT INTO jobdependencies (upstream, downstream) VALUES ($1, $2)", [upstream, downstream])
      .then()
      .catch(error => req.error = {
        msg: error.toString(),
        code: 500,
        function : "insertJobDependency"
      })
      debug("Fin insertion job dependence")
}

async function insertProjectDependency(upstream, downstream, req){
  debug("Insertion  de la dependance entre le projet "+upstream+" et "+downstream)
  await req.pgPool.query(
      "INSERT INTO projectdependencies (upstream, downstream) VALUES ($1, $2)", [upstream, downstream])
      .then()
      .catch(error => req.error = {
        msg: error.toString(),
        code: 500,
        function : "insertProjectDependency"
      })
      debug("Fin insertion project dependence")
}

async function insertProjectFromJson(req, res, next){
  const projects = req.body.projects

  req.idProjects = []
  for(i=0; i<projects.length; i++){
    project = projects[i]
    
    await insertProject(project.name, req)

    req.idJobs = []

    for(j=0; j<project.jobs.length; j++){
      job = project.jobs[j]

      id_project = req.idProjects[i]

      debug("id_project = "+id_project)

      await insertJob(job.name, job.command, id_project, req)

      //Si il y a des dépendances entre les jobs
      if(job.deps){
        for(k=0; k<job.deps.length; k++){
          dep = job.deps[k]
  
          upstream = req.idJobs[dep.id]
          downstream = req.idJobs[j]
  
          await insertJobDependency(upstream, downstream, req)
        }
      }
    }
    if(project.deps){
      for(l=0; l<project.deps.length; l++){
        dep = project.deps[l]

        upstream = req.idProjects[dep.id]
        downstream = req.idProjects[i]

        await insertProjectDependency(upstream, downstream, req)
      }
    }

  }
  next()
}
  
async function getAllProjects(req, res, next){
    await req.pgPool.query("SELECT * FROM projects")
    .then(results => req.result = results.rows)
    .catch(error => req.error = {
        msg: error.toString(),
        code: 500,
        function : "getAllProjects"
    })
    next()
  }

module.exports = {
    insertProjectFromJson,
    getAllProjects
}