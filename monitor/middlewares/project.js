const axios = require('axios');

async function getProjects(req, res, next) {
  const json = await axios.get(`${req.app.get('apiUrl')}/api/projects`);

  const projects = json.data;

  req.projects = projects;
  next();
}

async function getProject(req, res, next) {
  const json = await axios.get(`${req.app.get('apiUrl')}/api/project/${req.params.id}`);

  const project = json.data[0];

  req.project = project;

  next();
}

async function getProjectStatus(req, res, next) {
  const json = await axios.get(`${req.app.get('apiUrl')}/api/projects/statusByJobs`);

  const projects = json.data;

  req.projectStatus = projects;
  next();
}

module.exports = {
  getProject,
  getProjects,
  getProjectStatus,
};
