const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const jobs = require("./routes/jobs")
const projects = require("./routes/projects")
const clusters = require("./routes/cluster")

const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

const PORT = 8080

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use(function (req, res, next) {
	console.log(req.method, ' ', req.path, ' ', req.body)
	console.log("received at " + Date.now())
	next()
})

var options = {
	customCss: '.swagger-ui .topbar { display: none }'
}

const swaggerDocument = YAML.load('./doc/swagger.yml')

app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options))

app.use('/api', jobs)
app.use('/api', projects)
app.use('/api', clusters)

module.exports = app

app.listen(PORT, function () {
  console.log("URL de l'api : http://localhost:"+PORT+"/api \nURL de la documentation swagger : http://localhost:"+PORT+"/api/doc")
})
