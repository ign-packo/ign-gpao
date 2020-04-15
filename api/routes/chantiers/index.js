const router = require('express').Router();
const { query, body, param, oneOf } = require('express-validator/check');

const chantiers= require('./../../middlewares/chantiers');

router.get('/chantiers', chantiers.getAllChantiers);
router.get('/chantiers/getColumnsName', chantiers.getColumnsName);

module.exports = router;
