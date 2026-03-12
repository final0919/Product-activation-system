const bcrypt = require('bcryptjs');

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = '') {
  return `${prefix}${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

const store = {
  startedAt: nowIso(),
  users: [],
  products: [],
  activationCodes: [],
};

// Seed a couple of products + a code for demo usability
const seedProduct1 = {
  _id: makeId('p_'),
  name: '入门指南',
  url: 'https://example.com/starter',
  image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=入门指南',
  description: '快速入门资源，确认激活流程正常工作。',
  requiresActivation: true, // 需要激活
};
const seedProduct2 = {
  _id: makeId('p_'),
  name: '高级下载',
  url: 'https://example.com/premium',
  image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=高级下载',
  description: '高级资源下载链接。',
  requiresActivation: true, // 需要激活
};
const seedProduct3 = {
  _id: makeId('p_'),
  name: '免费资源',
  url: 'https://example.com/free',
  image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=免费资源',
  description: '免费开放资源，无需激活即可使用。',
  requiresActivation: false, // 无需激活
};
store.products.push(seedProduct1, seedProduct2, seedProduct3);

store.activationCodes.push({
  _id: makeId('c_'),
  code: 'DEMO-CODE-2026',
  products: [seedProduct1._id, seedProduct2._id],
  isUsed: false,
});

async function ensureUser(username, password, role = 'user') {
  const existing = store.users.find((u) => u.username === username);
  if (existing) return existing;
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const user = {
    _id: makeId('u_'),
    username,
    password: hashed,
    originalPassword: password, // 存储原始密码供管理员查看
    role,
    activatedProducts: [],
    createdAt: nowIso(),
  };
  store.users.push(user);
  return user;
}

// 创建预置管理员账号
async function initializeAdmin() {
  await ensureUser('admin', 'admin123', 'admin');
}

module.exports = {
  store,
  makeId,
  ensureUser,
  initializeAdmin,
};