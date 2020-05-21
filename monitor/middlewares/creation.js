const debug = require('debug')('creation');
const gpaoInterface = require('ejs-electron-ign-gpao');

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
    debug(`problem with request: ${e.message}`);
  });
}

function validate(req, res, next) {
  const result = gpaoInterface.validate(req.body);

  if (!result.valid) {
    debug(result.errors);
    req.body.page = JSON.stringify(result.errors, null, '\t');
    next();
  } else {
    next();
  }
}

function header(req) {
  // code propre quand express-useragent sera debogge
  // const useragent = require('express-useragent');
  /* ua = useragent.parse(req.headers['user-agent']);
    if (!ua['isElectron']) { */
  if (!req.headers['user-agent'].includes('Electron')) {
    return '../partials/header';
  }
  return `${gpaoInterface.view_folder()}/partials/header`;
}


module.exports = {
  getNewProject,
  postNewProject,
  validate,
  header,
};
