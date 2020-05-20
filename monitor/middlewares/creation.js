const ign_gpao =  require('ejs-electron-ign-gpao')
const checkIhmSchema =  require('../validator/checkIhmSchema')

const serveur = require('../serveur');


var ihm_data = {}
var js_folder = '.'

function getNewProject(req, res, next) {
    
    req.body = ihm_data;
    next();
}

function postNewProject(req, res, next) {
    
    var page = ""
    var body = ""
    req.on('data', function (chunk) {
           body += chunk
           })
    req.on('end', function () {

           ihm_data = JSON.parse(body)
           page = ign_gpao.view_folder() + '/pages/creation'
           ihm_data ['js_folder'] = js_folder;
           ihm_data ['page'] = page;
           req.body = ihm_data;
           next();
           })
    req.on('error', function(e) {
           console.log('problem with request: ' + e.message);
           })
}

function validate(req, res, next) {
    
    var result = checkIhmSchema.validate(req.body)

    if (!result.valid) {
        console.log(result['errors'])
        req.body['page'] = JSON.stringify(result['errors'], null, '\t')
        next()
    } else {
        next()
    }
}

function header() {
    return ign_gpao.view_folder() + "/partials/header";
}


module.exports = {
    getNewProject,
    postNewProject,
    validate,
    header
};
