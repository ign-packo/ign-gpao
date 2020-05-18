const { validationResult } = require('express-validator/check');

module.exports = function validateParams(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      status: result.array({ onlyFirstError: true })[0].msg,
      errors: result.array({ onlyFirstError: true }),
    });
  }
  next();
};
