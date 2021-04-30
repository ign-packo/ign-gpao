const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const git = require('git-last-commit');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const debug = require('debug');
const jobs = require('./routes/jobs');
const projects = require('./routes/projects');
const sessions = require('./routes/sessions');
const nodes = require('./routes/nodes');
const dependencies = require('./routes/dependencies');
const client = require('./routes/client');
const maintenance = require('./routes/maintenance');

const PORT = process.env.API_PORT || 8080;

function getLastCommit() {
  return new Promise((resolve) => {
    git.getLastCommit(
      (err, commit) => {
        resolve(commit);
      },
    );
  });
}

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  debug.log(req.method, ' ', req.path, ' ', req.body);
  debug.log(`received at ${Date.now()}`);
  next();
});

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
};

const swaggerDocument = YAML.load('./doc/swagger.yml');
const hostname = process.env.SERVER_HOSTNAME || os.hostname();
swaggerDocument.servers[0].url = `http://${hostname}:${PORT}/api`;

getLastCommit().then((commit) => {
  swaggerDocument.info.version = `0.1.${commit.shortHash.toUpperCase()}`;
});

app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.use('/api', jobs);
app.use('/api', projects);
app.use('/api', sessions);
app.use('/api', nodes);
app.use('/api', dependencies);
app.use('/api', client);
app.use('/api/', maintenance);

module.exports = app.listen(PORT, () => {
  debug.log(`URL de l'api : http://localhost:${PORT}/api \nURL de la documentation swagger : http://localhost:${PORT}/api/doc`);
});
