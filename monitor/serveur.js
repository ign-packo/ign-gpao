var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// home page
app.get('/', function(req, res) {
    res.render('pages/index');
});

//ToDo à définir en tant que middleware
var getJob = async function (req, res, next){

  const axios = require('axios');

  let json = await axios.get('http://api-gpao:8080/api/jobs')

  req.body = json.data
  next()
}

// job page
app.get('/job', getJob, function(req, res) {
  var array = []

  for(var i in req.body){
    array.push(req.body[i])
  }

  res.render('pages/job', {json:array})
})

// chantier page 
app.get('/chantier', function(req, res) {
    res.render('pages/chantier')
})

// ressource page 
app.get('/ressource', function(req, res) {
    res.render('pages/ressource')
})

app.listen(8000);
console.log('8000 is the magic port')
