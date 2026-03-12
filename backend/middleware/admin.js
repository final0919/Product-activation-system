
// Checks if user role in JWT payload is 'admin'
module.exports = function (req, res, next) {
  // req.user is set by the auth middleware
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin role required.' });
  }
  next();
};
