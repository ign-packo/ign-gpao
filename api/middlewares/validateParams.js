const { validationResult } = require('express-validator/check')

module.exports = function (req, res, next) {
    result = validationResult(req);
	
    if (!result.isEmpty()) {
        return res.status(400).json({
            'status': result.array({ onlyFirstError: true })[0].msg,
            'errors': result.array({ onlyFirstError: true })
        })
    }
    next()
}