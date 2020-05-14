async function getClusters (req, res, next){

    const axios = require('axios');
    const serveur = require('../serveur');
    
    json = await axios.get('http://'+serveur.URL_API+':'+serveur.URL_API_PORT+'/api/clusters')
  
    req.body = json.data
    next()
  }

module.exports = {
    getClusters
}