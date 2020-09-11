const router = require('express').Router();
const jobs = require('../middlewares/job');
const projects = require('../middlewares/project');
const sessions = require('../middlewares/session');

// home page
router.get('/', (req, res) => {
  res.render('pages/index');
});

// job page
router.get('/job', jobs.getJobs, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });

  res.render('pages/job', { json: array });
});

// project page
router.get('/project', projects.getProjects, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/project', { json: array });
});

// session page
router.get('/session', sessions.getSessions, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/session', { json: array });
});

module.exports = router;
