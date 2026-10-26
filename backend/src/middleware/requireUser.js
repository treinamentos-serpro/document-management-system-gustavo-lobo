const HttpError = require('../errors/HttpError');

function requireUser(req, res, next) {
  const owner = req.get('X-User-Id');
  const normalizedOwner = typeof owner === 'string' ? owner.trim() : '';

  if (!normalizedOwner || normalizedOwner.length > 100) {
    return next(
      new HttpError(400, 'INVALID_USER_ID', 'Informe um identificador de usuário válido.')
    );
  }

  req.userId = normalizedOwner;
  return next();
}

module.exports = requireUser;