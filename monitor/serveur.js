var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// home page
app.get('/', function(req, res) {
    res.render('pages/index');
});

var getJob = async function (req, res, next){

  const axios = require('axios');

  let json = await axios.get('http://api-gpao:3000/api/jobs')

  req.body = json.data
  next()
}

// job page
app.get('/job', getJob, function(req, res) {
  var array = []

  for(var i in req.body){
    console.log(i)
    array.push(req.body[i])
    console.log(req.body[i])
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

app.listen(80);
console.log('80 is the magic port')
