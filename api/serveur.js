const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const chantiers = require("./routes/chantiers")
const ressources = require("./routes/ressources")
const jobs = require("./routes/jobs")

const PORT = 8080

const app = express()

app.use(cors());
app.use(bodyParser.json());

app.use(function (req, res, next) {
	console.log(req.method, ' ', req.path, ' ', req.body)
	console.log("received at " + Date.now())
	next()
})

// Swagger set up
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API GPAO",
      version: "1.0.0",
      description: "Documentation de l'API mise en place dans le cadre de la refonte de la GPAO.",
    },

    servers: [
      {
        url: "http://koolyce.ddns.net:8080/api",
        description: "Serveur d'Arnaud"
      },
      {
        url: "http://localhost:8080/api",
        description: "Serveur de dev"
      },
      {
        url: "http://api-gpao:8080/api",
        description: "Serveur de test"
      }
    ]
  },
  apis: ["model/job.js", "routes/job"]
};


const specs = swaggerJsdoc(options);
app.use("/api/doc", swaggerUi.serve);
app.get(
  "/api/doc",
  swaggerUi.setup(specs, {
    explorer: false
  })
);

app.use('/api', chantiers);
app.use('/api', ressources);
app.use('/api', jobs);

module.exports = app

app.listen(PORT, function () {
  console.log("URL de l'api : http://localhost:"+PORT+"/api \nURL de la documentation swagger : http://localhost:"+PORT+"/api/doc")
})
