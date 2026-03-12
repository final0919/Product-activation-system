const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { auth, admin } = require('./middleware');
const { store, makeId } = require('./store');

function sanitizeUser(user) {
  // mimic mongoose select('-password')
  const { password, ...rest } = user;
  return rest;
}

function populateProducts(productIds) {
  const byId = new Map(store.products.map((p) => [p._id, p]));
  return (productIds || []).map((id) => byId.get(id)).filter(Boolean);
}

const router = express.Router();

// --- AUTH ---
router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ msg: 'username and password are required' });

  const existing = store.users.find((u) => u.username === username);
  if (existing) return res.status(400).json({ msg: 'User already exists' });

  const role = 'user'; // 所有新注册用户都是普通用户
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  store.users.push({
    _id: makeId('u_'),
    username,
    password: hashed,
    originalPassword: password, // 存储原始密码供管理员查看
    role,
    activatedProducts: [],
    createdAt: new Date().toISOString()
  });
  return res.json({ msg: 'User registered successfully' });
});

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ msg: 'Invalid credentials' });

  const user = store.users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const payload = { user: { id: user._id, role: user.role } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
    if (err) return res.status(500).json({ msg: 'Server Error' });
    return res.json({ token });
  });
});

// --- USERS ---
router.get('/users/me', auth, async (req, res) => {
  const user = store.users.find((u) => u._id === req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  const sanitized = sanitizeUser(user);
  return res.json({ ...sanitized, activatedProducts: populateProducts(user.activatedProducts) });
});

router.post('/users/activate-product', auth, async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ msg: 'Please enter a code.' });

  const activationCode = store.activationCodes.find((c) => c.code === code);
  if (!activationCode) return res.status(404).json({ msg: 'Activation code not found' });
  if (activationCode.isUsed) return res.status(400).json({ msg: 'Activation code has already been used' });

  const user = store.users.find((u) => u._id === req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  for (const productId of activationCode.products) {
    if (!user.activatedProducts.includes(productId)) user.activatedProducts.push(productId);
  }
  activationCode.isUsed = true;

  const sanitized = sanitizeUser(user);
  return res.json({ ...sanitized, activatedProducts: populateProducts(user.activatedProducts) });
});

// --- PRODUCTS ---
router.get('/products', auth, async (req, res) => {
  return res.json(store.products);
});

router.post('/products', [auth, admin], async (req, res) => {
  const { name, url, image, description } = req.body || {};
  if (!name || !url) return res.status(400).json({ msg: 'name and url are required' });
  const product = { _id: makeId('p_'), name, url, image: image || '', description: description || '' };
  store.products.push(product);
  return res.json(product);
});

router.put('/products/:id', [auth, admin], async (req, res) => {
  const product = store.products.find((p) => p._id === req.params.id);
  if (!product) return res.status(404).json({ msg: 'Product not found' });
  const { name, url, image, description } = req.body || {};
  if (name) product.name = name;
  if (url) product.url = url;
  if (image !== undefined) product.image = image;
  if (description !== undefined) product.description = description;
  return res.json(product);
});

router.delete('/products/:id', [auth, admin], async (req, res) => {
  const idx = store.products.findIndex((p) => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ msg: 'Product not found' });
  store.products.splice(idx, 1);
  return res.json({ msg: 'Product removed' });
});

// --- ACTIVATION CODES ---
router.get('/activation-codes', [auth, admin], async (req, res) => {
  const byId = new Map(store.products.map((p) => [p._id, p]));
  const populated = store.activationCodes.map((c) => ({
    ...c,
    products: (c.products || []).map((id) => byId.get(id)).filter(Boolean).map((p) => ({ _id: p._id, name: p.name })),
  }));
  return res.json(populated);
});

router.post('/activation-codes', [auth, admin], async (req, res) => {
  const { code, products } = req.body || {};
  if (!code || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ msg: 'code and products are required' });
  }
  const existing = store.activationCodes.find((c) => c.code === code);
  if (existing) return res.status(400).json({ msg: 'Activation code already exists' });
  const newCode = { _id: makeId('c_'), code, products, isUsed: false };
  store.activationCodes.push(newCode);
  return res.json(newCode);
});

router.put('/activation-codes/:id', [auth, admin], async (req, res) => {
  const code = store.activationCodes.find((c) => c._id === req.params.id);
  if (!code) return res.status(404).json({ msg: 'Activation code not found' });
  const { code: newCode, products, isUsed } = req.body || {};
  if (newCode) code.code = newCode;
  if (Array.isArray(products)) code.products = products;
  if (isUsed !== undefined) code.isUsed = Boolean(isUsed);
  return res.json(code);
});

router.delete('/activation-codes/:id', [auth, admin], async (req, res) => {
  const idx = store.activationCodes.findIndex((c) => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ msg: 'Activation code not found' });
  store.activationCodes.splice(idx, 1);
  return res.json({ msg: 'Activation code removed' });
});

// --- USERS MANAGEMENT (Admin only) ---
router.get('/users', [auth, admin], async (req, res) => {
  const users = store.users.map(user => ({
    ...user,
    activatedProducts: populateProducts(user.activatedProducts)
  }));
  return res.json(users);
});

router.get('/users/:id', [auth, admin], async (req, res) => {
  const user = store.users.find((u) => u._id === req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  const userWithProducts = {
    ...user,
    activatedProducts: populateProducts(user.activatedProducts)
  };
  return res.json(userWithProducts);
});

router.put('/users/:id', [auth, admin], async (req, res) => {
  const user = store.users.find((u) => u._id === req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  
  const { username, password, role, activatedProducts } = req.body || {};
  
  if (username && username !== user.username) {
    const existing = store.users.find((u) => u.username === username && u._id !== user._id);
    if (existing) return res.status(400).json({ msg: 'Username already exists' });
    user.username = username;
  }
  
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }
  
  if (role) user.role = role;
  if (Array.isArray(activatedProducts)) user.activatedProducts = activatedProducts;
  
  const sanitized = sanitizeUser(user);
  return res.json({ ...sanitized, activatedProducts: populateProducts(user.activatedProducts) });
});

router.delete('/users/:id', [auth, admin], async (req, res) => {
  const idx = store.users.findIndex((u) => u._id === req.params.id);
  if (idx === -1) return res.status(404).json({ msg: 'User not found' });
  
  // 不能删除当前登录的用户
  if (store.users[idx]._id === req.user.id) {
    return res.status(400).json({ msg: 'Cannot delete your own account' });
  }
  
  store.users.splice(idx, 1);
  return res.json({ msg: 'User deleted successfully' });
});

module.exports = router;