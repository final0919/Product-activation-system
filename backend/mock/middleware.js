const jwt = require('jsonwebtoken');
const { store } = require('./store');

// 内存模式下的认证中间件
function auth(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token') || req.header('authorization')?.replace('Bearer ', '');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 在内存中查找用户
    const user = store.users.find(u => u._id === decoded.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

// 内存模式下的管理员权限检查
function admin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin role required.' });
  }
}

module.exports = { auth, admin };