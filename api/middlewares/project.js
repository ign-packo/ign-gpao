const debug = require('debug')('project');

async function insertProject(name, req) {
  debug(`Insertion du projet ${name}`);
  const results = await req.client.query(
    'INSERT INTO projects (name) VALUES ($1) RETURNING id', [name],
  )
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertProject',
      };
      debug('Erreur dans insertProject');
    });
  const idProject = results.rows[0].id;
  req.idProjects.push(idProject);
  debug('Fin insertion projet');
  return idProject;
}

async function insertJob(name, command, idProject, req) {
  debug(`Insertion du job ${name}`);
  const results = await req.client.query(
    'INSERT INTO jobs (name, command, id_project) VALUES ($1, $2, $3) RETURNING id', [name, command, idProject],
  )
    .catch((error) => {
      req.error = {
        msg: error.toString(),
        code: 500,
        function: 'insertJob',
      };
      debug('Erreur dans insertJob');
    });
  const idJob = results.rows[0].id;
  req.idJobs.push(idJob);
  debug('Fin insertion job');
  return idJob;
}

async function insertJobDependency(upstream, downstream, req) {
  debug(`Insertion  de la dependance entre le job ${upstream} et ${downstream}`);
  await req.client.query(
    'INSERT INTO jobdependencies (upstream, downstream) VALUES ($1, $2)', [upstream, downstream],
  )
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
  req.idJobs = [];

  /* eslint-disable no-restricted-syntax */
  for (const project of projects) {
    /* eslint-disable no-await-in-loop */
    const idProject = await insertProject(project.name, req);
    debug(`id_project = ${idProject}`);
    /* eslint-disable no-restricted-syntax */
    for (const job of project.jobs) {
      /* eslint-disable no-await-in-loop */
      const idJob = await insertJob(job.name, job.command, idProject, req);
      debug(`id_job = ${idJob}`);
      // Si il y a des dépendances entre les jobs
      if (job.deps) {
        /* eslint-disable no-restricted-syntax */
        for (const dep of job.deps) {
          const upstream = req.idJobs[dep.id];
          const downstream = idJob;
          /* eslint-disable no-await-in-loop */
          await insertJobDependency(upstream, downstream, req);
        }
      }
    }
    if (project.deps) {
      /* eslint-disable no-restricted-syntax */
      for (const dep of project.deps) {
        const upstream = req.idProjects[dep.id];
        const downstream = idProject;
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
