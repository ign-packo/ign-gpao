const Pool = require('pg').Pool
const pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT
});

const { matchedData } = require('express-validator/filter');

const tableName ="ressources" ;
const sqlRequest={ "getAllRessources" : "SELECT * FROM "+tableName ,
	           "insertRessource": "INSERT INTO "+tableName+"( nom, status, version, command, espace, id_chantier) VALUES ($1, $2, $3, $4, $5, $6)"
		};

function getAllRessources(req, res) {
	pool.query(sqlRequest["getAllRessources"], (error, results) => {
		if (error) { throw error; }
		res.status(200).json(results.rows);
	});
}


function insertRessource(req, res) {	
	var params = matchedData(req);

	const nom = req.params.nom ;
	const status = req.params.status ;
	const version = req.params.version ;
	const command = req.params.command ;
	const espace = req.params.espace ;
	const id_chantier = req.params.id_chantier ;

	pool.query(
		sqlrequest["insertRessource"],
	        [ nom, status, version, command, espace, id_chantier],
		(error, results) => {
			if (error) { throw error; }
			res.status(200).send(`Ressource added`);
      	});
}


module.exports = {
	getAllRessources,
	insertRessource
};
