const chantiers = require('./../middlewares/chantier')
const ressources = require('./../middlewares/ressource')
const jobs = require('./../middlewares/job')
const tree = require('./../middlewares/tree')
const router = require('express').Router()


// home page
router.get('/', function(req, res) {
    res.render('pages/index');
});

// page chantiers
router.get('/chantier', chantiers.getChantiers, (req, res) => {
    var array = [] ;
    for(var i in req.body) { array.push(req.body[i]); }
    res.render('pages/chantier', {json:array})
})

// page ressources
router.get('/ressource', ressources.getRessources, function(req, res) {
    var array = [] ;
    for(var i in req.body) { array.push(req.body[i]); }
    res.render('pages/ressource', {json:array})
})

// page jobs
router.get('/job', jobs.getJobs, function(req, res) {
    var array = [] ;
    for(var i in req.body) { array.push(req.body[i]); }
    res.render('pages/job', {json:array})
  })
  
  
// page tree --- test for fast display
router.get('/tree', tree.getTree ,function(req, res) {
	var array = [] ;
   	for(var i in req.body) { array.push(req.body[i]); }
   	res.render('pages/tree', {json:array} ) ;
})
  

module.exports = router
