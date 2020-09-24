const router = require('express').Router();
const jobs = require('../middlewares/job');
const projects = require('../middlewares/project');
const sessions = require('../middlewares/session');
const hosts = require('../middlewares/host');

// home page
router.get('/', (req, res) => {
  res.render('pages/index', { api: req.app.api_url });
});

// job page
router.get('/job', jobs.getJobs, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });

  res.render('pages/job', { json: array, api: req.app.api_url });
});

// project page
router.get('/project', projects.getProjects, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/project', { json: array, api: req.app.api_url });
});

// session page
router.get('/session', sessions.getSessions, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/session', { json: array, api: req.app.api_url });
});

// host page
router.get('/host', hosts.getHosts, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/host', { json: array, api: req.app.api_url });
});

module.exports = router;
