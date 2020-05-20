const debug = require('debug')('project');

async function insertProject(name, req) {
  debug(`Insertion du projet ${name}`);
  await req.client.query(
    'INSERT INTO projects (name) VALUES ($1) RETURNING id', [name],
  )
    .then((results) => { req.idProjects.push(results.rows[0].id); })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertProject',
      };
    });
  debug('Fin insertion projet');
}

async function insertJob(name, command, idProject, req) {
  debug(`Insertion du job ${name}`);
  await req.client.query(
    'INSERT INTO jobs (name, command, id_project) VALUES ($1, $2, $3) RETURNING id', [name, command, idProject],
  )
    .then((results) => { req.idJobs.push(results.rows[0].id); })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertJob',
      };
    });
  debug('Fin insertion job');
}

async function insertJobDependency(upstream, downstream, req) {
  debug(`Insertion  de la dependance entre le job ${upstream} et ${downstream}`);
  await req.client.query(
    'INSERT INTO jobdependencies (upstream, downstream) VALUES ($1, $2)', [upstream, downstream],
  )
    .then()
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertJobDependency',
      };
    });
  debug('Fin insertion job dependence');
}

async function insertProjectDependency(upstream, downstream, req) {
  debug(`Insertion  de la dependance entre le projet ${upstream} et ${downstream}`);
  await req.client.query(
    'INSERT INTO projectdependencies (upstream, downstream) VALUES ($1, $2)', [upstream, downstream],
  )
    .then()
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertProjectDependency',
      };
    });
  debug('Fin insertion project dependence');
}

async function insertProjectFromJson(req, res, next) {
  const { projects } = req.body;

  req.idProjects = [];
  for (let i = 0; i < projects.length; i += 1) {
    const project = projects[i];

    /* eslint-disable no-await-in-loop */
    await insertProject(project.name, req);

    req.idJobs = [];

    for (let j = 0; j < project.jobs.length; j += 1) {
      const job = project.jobs[j];
      const idProject = req.idProjects[i];

      debug(`id_project = ${idProject}`);

      await insertJob(job.name, job.command, idProject, req);

      // Si il y a des dépendances entre les jobs
      if (job.deps) {
        for (let k = 0; k < job.deps.length; k += 1) {
          const dep = job.deps[k];

          const upstream = req.idJobs[dep.id];
          const downstream = req.idJobs[j];

          /* eslint-disable no-await-in-loop */
          await insertJobDependency(upstream, downstream, req);
        }
      }
    }
    if (project.deps) {
      for (let l = 0; l < project.deps.length; l += 1) {
        const dep = project.deps[l];

        const upstream = req.idProjects[dep.id];
        const downstream = req.idProjects[i];

        /* eslint-disable no-await-in-loop */
        await insertProjectDependency(upstream, downstream, req);
      }
    }
  }
  next();
}

async function getAllProjects(req, res, next) {
  await req.client.query('SELECT * FROM projects')
    .then((results) => { req.result = results.rows; })
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'getAllProjects',
      };
    });
  next();
}

module.exports = {
  insertProjectFromJson,
  getAllProjects,
};
