const router = require('express').Router();
const jobs = require('../middlewares/job');
const projects = require('../middlewares/project');
const clusters = require('../middlewares/cluster');
const creation = require('../middlewares/creation');

var header = '../partials/header'

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

  res.render('pages/job', { json: array, header: header});
});

// project page
router.get('/project', projects.getProjects, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/project', { json: array, header: header });
});

// cluster page
router.get('/cluster', clusters.getClusters, (req, res) => {
  const array = [];

  req.body.forEach((element) => {
    array.push(element);
  });
  res.render('pages/cluster', { json: array, header: header });
});

// new project page
router.get('/creation', creation.getNewProject, (req, res) => {
           res.render(req.body['page'],{ihm_data:req.body['ihm'], js_folder: req.body['js_folder']})
})
           
// new project page
router.post('/creation', creation.postNewProject, (req, res) =>  {
    header = creation.header();
    res.render(req.body['page'],{ihm_data:req.body['ihm'], js_folder: req.body['js_folder']})
})

module.exports = router;
