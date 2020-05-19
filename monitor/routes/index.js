const router = require('express').Router();
const jobs = require('../middlewares/job');
const projects = require('../middlewares/project');
const clusters = require('../middlewares/cluster');
const ign_gpao =  require('ejs-electron-ign-gpao')

var ign_data = {}
var header = '../partials/header'
var js_folder = '.'

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
router.get('/creation', function(req, res) {
   res.render(ign_gpao.view_folder() + '/pages/creation',{ihm_data:ihm_data['ihm'], js_folder: js_folder})
})
           
// new project page
router.post('/creation', function(req, res) {
    var body = ""
    req.on('data', function (chunk) {
      body += chunk
    })
    req.on('end', function () {
       ihm_data = JSON.parse(body)
       header = ign_gpao.view_folder() + "/partials/header";
       res.render(ign_gpao.view_folder() + '/pages/creation',{ihm_data:ihm_data['ihm'], js_folder: js_folder})
    })
    req.on('error', function(e) {
         console.log('problem with request: ' + e.message);
    })
})

module.exports = router;
