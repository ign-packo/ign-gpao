const gpaoInterface = require('ejs-electron-ign-gpao');
const checkIhmSchema = require('../validator/checkIhmSchema');


let gpaoInterfaceData = {};
const jsFolder = '.';

function getNewProject(req, res, next) {
  req.body = gpaoInterfaceData;
  next();
}

function postNewProject(req, res, next) {
  let page = '';
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    gpaoInterfaceData = JSON.parse(body);
    page = `${gpaoInterface.view_folder()}/pages/creation`;
    gpaoInterfaceData.jsFolder = jsFolder;
    gpaoInterfaceData.page = page;
    req.body = gpaoInterfaceData;
    next();
  });
  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });
}

function validate(req, res, next) {
  const result = checkIhmSchema.validate(req.body);

  if (!result.valid) {
    console.log(result.errors);
    req.body.page = JSON.stringify(result.errors, null, '\t');
    next();
  } else {
    next();
  }
}

function header() {
  return `${gpaoInterface.view_folder()}/partials/header`;
}


module.exports = {
  getNewProject,
  postNewProject,
  validate,
  header,
};
