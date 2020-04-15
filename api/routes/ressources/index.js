const router = require('express').Router();
const { query, body, param, oneOf } = require('express-validator/check');

const ressources = require('./../../middlewares/ressources');

router.get('/ressources', ressources.getAllRessources);
//router.post('/ressource/:id/:status(DONE|FAILED)/:return_code', body('log').exists(), ressources.updateRessourceStatus);
//router.put('/ressource', body('command').exists(), ressources.addRessource);

module.exports = router
