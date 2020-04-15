const Pool = require('pg').Pool
const pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT
});

const { matchedData } = require('express-validator/filter');

const tableName ="chantiers" ;
const sqlRequest={ "getAllChantiers" : "SELECT * FROM "+tableName ,
	           "insertChantiers" :"INSERT INTO "+tableName+" (nom, status, priorite) VALUES ($1, $2, $3)" ,
 		   "getColumnsName": "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=\'"+tableName+"\'",
};


function getAllChantiers(req, res) {
	pool.query(
		sqlRequest ["getAllChantiers"],
		(error, results) => {
			if (error) { throw error; console.log("passe ici"); }
			res.status(200).json(results.rows);
	});
};


function insertChantier(req, res) {
	var params = matchedData(req);
        const nom = req.params.nom;
	const status= req.params.status;
	const priorite= req.params.priorte;
	
	pool.query(
		sqlRequest ["insertChantiers"],
                [nom, status, priorite],
      		(error, results) => {
			if (error) { throw error; }
			res.status(200).send(tableName+" inserted");
      });
};

function getColumnsName(req, res) {
	pool.query(
		sqlRequest["getColumnsName"],
		(error, results ) => {
			if (error) { throw error; }
			res.status(200).json(results.rows);
	});
};



module.exports = {
	getAllChantiers,
	insertChantier,
	getColumnsName
};
