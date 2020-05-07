const router = require('express').Router();
const jobs = require('../middlewares/job');
const projects = require('../middlewares/project');
const clusters = require('../middlewares/cluster');

var ihm_data = {}
var electron = 'off';

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

// new project page
router.get('/creation', function(req, res) {
   // new project page
   console.log("index.js: creation page (get)")
   res.render('./pages/creation',{ihm_data:ihm_data['ihm'], electron:electron})
})
           
// new project page
router.post('/creation', function(req, res) {
    console.log("index.js: creation page")
    var body = ""
    req.on('data', function (chunk) {
      body += chunk
    })
    req.on('end', function () {
       ihm_data = JSON.parse(body)
       electron = 'on'
       res.render('./pages/creation',{ihm_data:ihm_data['ihm'], electron:electron})
    })
    req.on('error', function(e) {
         console.log('problem with request: ' + e.message);
    })
})

module.exports = router;
