const { authenticate, authorize } = require('../middleware/auth');

// Add optionalAuth middleware if not already present
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  // Reuse authenticate but swallow errors
  authenticate(req, res, next);
};

module.exports = { authenticate, authorize, optionalAuth };
