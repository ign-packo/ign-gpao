async function getTree (req, res, next){
	const axios = require('axios');
	const serveur = require('../serveur');
	resp= await axios.get('http://'+serveur.URL_API+':'+serveur.URL_API_PORT+'/api/chantiers');
	req.body = resp.data;
	next();
}

module.exports = {
	getTree
}
