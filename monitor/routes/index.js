const router = require('express').Router();
const jobs = require('../middlewares/job');
const projects = require('../middlewares/project');
const clusters = require('../middlewares/cluster');


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

// cluster page
router.get('/cluster', clusters.getClusters, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/cluster', { json: array });
});

module.exports = router;
