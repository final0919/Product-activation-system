import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AdminDashboard = () => {
  // Product Management States
  const [products, setProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', url: '', image: '', description: '', requiresActivation: true });
  const [editingProduct, setEditingProduct] = useState(null);

  // Activation Code States
  const [codes, setCodes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [codeError, setCodeError] = useState('');
  const [newCode, setNewCode] = useState({ code: '', products: [] });

  // User Management States
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Collapse States
  const [isProductsCollapsed, setIsProductsCollapsed] = useState(false);
  const [isCodesCollapsed, setIsCodesCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);

  // General Message State
  const [message, setMessage] = useState('');

  // Data Fetching
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.PRODUCTS);
      if (res.data && Array.isArray(res.data)) {
        setProducts(res.data);
        setProductError('');
      } else {
        setProductError('产品数据格式错误');
      }
    } catch (err) {
      console.error('加载产品失败:', err);
      setProductError('加载产品失败，请检查网络连接或刷新页面重试');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ACTIVATION_CODES);
      if (res.data && Array.isArray(res.data)) {
        setCodes(res.data);
        setCodeError('');
      } else {
        setCodeError('激活码数据格式错误');
      }
    } catch (err) {
      console.error('加载激活码失败:', err);
      setCodeError('加载激活码失败，请检查网络连接或刷新页面重试');
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.USERS.ALL);
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data);
        setUserError('');
      } else {
        setUserError('用户数据格式错误');
      }
    } catch (err) {
      console.error('加载用户失败:', err);
      setUserError('加载用户失败，请检查网络连接或刷新页面重试');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadAllData = async () => {
      try {
        // 并行加载所有数据
        await Promise.allSettled([
          fetchProducts(),
          fetchCodes(),
          fetchUsers()
        ]);
      } catch (err) {
        console.error('加载管理数据失败:', err);
      }
    };

    if (isMounted) {
      loadAllData();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchProducts, fetchCodes, fetchUsers]);

  // --- Product Handlers ---
  const handleNewProductChange = (e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value });

  // 处理图片上传
  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setMessage('请选择图片文件');
        return;
      }
      
      // 检查文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        setMessage('图片大小不能超过2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        // 检查base64数据大小（限制为500KB）
        const base64Data = event.target.result;
        if (base64Data.length > 500 * 1024) {
          setMessage('图片数据过大，请选择较小的图片或使用URL');
          return;
        }
        
        if (isEditing) {
          setEditingProduct({ ...editingProduct, image: base64Data });
        } else {
          setNewProduct({ ...newProduct, image: base64Data });
        }
        setMessage('图片上传成功');
      };
      reader.onerror = () => {
        setMessage('图片上传失败，请重试');
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理图片URL输入
  const handleImageUrlChange = (e, isEditing = false) => {
    const url = e.target.value;
    if (isEditing) {
      setEditingProduct({ ...editingProduct, image: url });
    } else {
      setNewProduct({ ...newProduct, image: url });
    }
  };

  // 清除图片
  const handleClearImage = (isEditing = false) => {
    if (isEditing) {
      setEditingProduct({ ...editingProduct, image: '' });
    } else {
      setNewProduct({ ...newProduct, image: '' });
    }
  };

  const handleNewProductSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(API_ENDPOINTS.PRODUCTS, newProduct);
      setMessage('产品创建成功！');
      setNewProduct({ name: '', url: '', image: '', description: '', requiresActivation: true });
      await fetchProducts();
    } catch (err) {
      setMessage('Failed to create product.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
        setMessage('Product deleted successfully!');
        await fetchProducts();
      } catch (err) {
        setMessage('Failed to delete product.');
      }
    }
  };

  const handleEditChange = (e) => setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      // 确保包含所有字段
      const updateData = {
        name: editingProduct.name,
        url: editingProduct.url,
        image: editingProduct.image || '',
        description: editingProduct.description,
        requiresActivation: editingProduct.requiresActivation
      };
      
      await axios.put(`${API_ENDPOINTS.PRODUCTS}/${editingProduct._id}`, updateData);
      setMessage('产品更新成功！');
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error('更新产品失败:', err);
      setMessage('更新产品失败，请重试。');
    }
  };

  // --- Activation Code Handlers ---
  const handleNewCodeChange = (e) => {
    const { name, value } = e.target;
    if (name === 'products') {
      const selected = Array.from(e.target.selectedOptions, option => option.value);
      setNewCode({ ...newCode, products: selected });
    } else {
      setNewCode({ ...newCode, [name]: value });
    }
  };

  const handleNewCodeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(API_ENDPOINTS.ACTIVATION_CODES, newCode);
      setMessage('Activation code created successfully!');
      setNewCode({ code: '', products: [] });
      await fetchCodes();
    } catch (err) {
      setMessage('Failed to create activation code.');
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.ACTIVATION_CODES}/${codeId}`);
        setMessage('Activation code deleted successfully!');
        await fetchCodes();
      } catch (err) {
        setMessage('Failed to delete activation code.');
      }
    }
  };

  // --- User Management Handlers ---
  const handleEditUserChange = (e) => setEditingUser({ ...editingUser, [e.target.name]: e.target.value });

  // 设置编辑用户
  const handleSetEditingUser = (user) => {
    setEditingUser({
      ...user,
      activatedProducts: user.activatedProducts?.map(p => p._id) || []
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // 构建更新数据，过滤掉空密码字段
      const updateData = {
        username: editingUser.username,
        role: editingUser.role,
        activatedProducts: editingUser.activatedProducts || []
      };
      
      // 只有在输入了新密码时才更新密码
      if (editingUser.password && editingUser.password.trim()) {
        updateData.password = editingUser.password;
      }
      
      await axios.put(`${API_ENDPOINTS.USERS.ALL}/${editingUser._id}`, updateData);
      setMessage('用户更新成功！');
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('更新用户失败:', err);
      setMessage('更新用户失败，请重试。');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.USERS.ALL}/${userId}`);
        setMessage('User deleted successfully!');
        await fetchUsers();
      } catch (err) {
        setMessage('Failed to delete user.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="section-title">管理后台</h1>
      
      {message ? <p className="alert bg-brand-50 border-brand-200 text-brand-900">{message}</p> : null}

      {/* 产品管理面板 */}
      <section className="surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setIsProductsCollapsed(!isProductsCollapsed)}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">产品管理</h2>
            <p className="muted text-sm">创建、编辑和删除产品。</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge">{products.length} 个产品</span>
            <span className="text-slate-500">{isProductsCollapsed ? '▶' : '▼'}</span>
          </div>
        </div>

        {productError ? (
          <div className="mt-4">
            <p className="alert-error">{productError}</p>
          </div>
        ) : null}

        {!isProductsCollapsed && (
          <>
            <div className="divider" />

            <form onSubmit={handleNewProductSubmit} className="space-y-3">
              <div className="font-semibold text-slate-900">创建新产品</div>
              <input
                type="text"
                name="name"
                placeholder="产品名称"
                value={newProduct.name}
                onChange={handleNewProductChange}
                required
                className="input"
              />
              <input
                type="text"
                name="url"
                placeholder="产品链接"
                value={newProduct.url}
                onChange={handleNewProductChange}
                required
                className="input"
              />
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">产品图片</div>
                
                {/* 图片上传选项 */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="btn-secondary cursor-pointer">
                      上传本地图片
                    </label>
                    {newProduct.image && (
                      <button 
                        type="button" 
                        onClick={() => handleClearImage(false)}
                        className="btn-danger"
                      >
                        清除图片
                      </button>
                    )}
                  </div>
                  
                  {/* 图片URL输入 */}
                  <div className="text-xs text-slate-600">或输入图片URL：</div>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={newProduct.image && newProduct.image.startsWith('http') ? newProduct.image : ''}
                    onChange={(e) => handleImageUrlChange(e, false)}
                    className="input text-sm"
                  />
                </div>
                
                {newProduct.image && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-600 mb-1">图片预览：</div>
                    <img 
                      src={newProduct.image} 
                      alt="预览" 
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
                className="textarea"
                placeholder="产品描述"
              />
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiresActivation"
                    checked={newProduct.requiresActivation}
                    onChange={(e) => setNewProduct({ ...newProduct, requiresActivation: e.target.checked })}
                    className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-slate-700">需要激活码激活</span>
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <span className={`badge ${newProduct.requiresActivation ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {newProduct.requiresActivation ? '需激活' : '开放产品'}
                  </span>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                创建产品
              </button>
            </form>

            <div className="divider" />

            <div className="space-y-3">
              <div className="font-semibold text-slate-900">所有产品</div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div key={product._id} className="bg-white/70 border border-brand-100 rounded-2xl p-4 space-y-3 min-h-[120px]">
                    {editingProduct && editingProduct._id === product._id ? (
                      <form onSubmit={handleUpdateProduct} className="space-y-3">
                        <input
                          type="text"
                          name="name"
                          value={editingProduct.name}
                          onChange={handleEditChange}
                          required
                          className="input"
                        />
                        <input
                          type="text"
                          name="url"
                          value={editingProduct.url}
                          onChange={handleEditChange}
                          required
                          className="input"
                        />
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-slate-900">产品图片</div>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                              id="image-upload-edit"
                            />
                            <label htmlFor="image-upload-edit" className="btn-secondary cursor-pointer">
                              上传本地图片
                            </label>
                            {editingProduct.image && (
                              <button 
                                type="button" 
                                onClick={() => handleClearImage(true)}
                                className="btn-danger"
                              >
                                清除图片
                              </button>
                            )}
                          </div>
                          
                          {/* 图片URL输入 */}
                          <div className="text-xs text-slate-600">或输入图片URL：</div>
                          <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            value={editingProduct.image && editingProduct.image.startsWith('http') ? editingProduct.image : ''}
                            onChange={(e) => handleImageUrlChange(e, true)}
                            className="input text-sm"
                          />
                        </div>
                        {editingProduct.image && (
                          <div className="mt-2">
                            <div className="text-xs text-slate-600 mb-1">图片预览：</div>
                            <img 
                              src={editingProduct.image} 
                              alt="预览" 
                              className="w-32 h-20 object-cover rounded border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <textarea
                name="description"
                value={editingProduct.description}
                onChange={handleEditChange}
                className="textarea"
                placeholder="产品描述"
              />
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiresActivation"
                    checked={Boolean(editingProduct.requiresActivation)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, requiresActivation: e.target.checked })}
                    className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-slate-700">需要激活码激活</span>
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <span className={`badge ${editingProduct.requiresActivation ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {editingProduct.requiresActivation ? '需激活' : '开放产品'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn-primary">
                  保存
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                  取消
                </button>
              </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 flex-wrap">
                          {product.image && product.image.trim() !== '' ? (
                            <div className="relative">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.nextSibling;
                                  if (placeholder && placeholder.classList.contains('image-placeholder')) {
                                    placeholder.style.display = 'flex';
                                  }
                                }}
                                onLoad={(e) => {
                                  e.target.style.display = 'block';
                                  const placeholder = e.target.nextSibling;
                                  if (placeholder && placeholder.classList.contains('image-placeholder')) {
                                    placeholder.style.display = 'none';
                                  }
                                }}
                              />
                              <div className="image-placeholder hidden w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-xs">
                                无图片
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-xs">
                              无图片
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-900 break-words">{product.name}</div>
                                {product.description ? <p className="muted text-sm mt-1">{product.description}</p> : null}
                                {product.url ? (
                                  <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold break-words text-blue-600 hover:text-blue-800"
                                  >
                                    {product.url}
                                  </a>
                                ) : null}
                              </div>
                              <div className="flex flex-row sm:flex-col gap-2 sm:items-end items-center justify-end flex-shrink-0">
                                <span className={`badge ${product.requiresActivation ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} shrink-0 text-xs sm:text-sm`}>
                                  {product.requiresActivation ? '需激活' : '开放产品'}
                                </span>
                                <span className="badge shrink-0 text-xs sm:text-sm">产品</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setEditingProduct(product)} className="btn-secondary" type="button">
                            编辑
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="btn-danger" type="button">
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {products.length === 0 ? <p className="muted text-sm">暂无产品。</p> : null}
              </div>
            </div>
          </>
        )}
      </section>

      {/* 激活码管理面板 */}
      <section className="surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setIsCodesCollapsed(!isCodesCollapsed)}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">激活码管理</h2>
            <p className="muted text-sm">生成激活码并分配产品。</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge">{codes.length} 个激活码</span>
            <span className="text-slate-500">{isCodesCollapsed ? '▶' : '▼'}</span>
          </div>
        </div>

        {codeError ? (
          <div className="mt-4">
            <p className="alert-error">{codeError}</p>
          </div>
        ) : null}

        {!isCodesCollapsed && (
          <>
            <div className="divider" />

            <form onSubmit={handleNewCodeSubmit} className="space-y-3">
              <div className="font-semibold text-slate-900">创建新激活码</div>
              <input
                type="text"
                name="code"
                placeholder="新激活码"
                value={newCode.code}
                onChange={handleNewCodeChange}
                required
                className="input"
              />
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">关联产品（多选）</div>
                <select
                  multiple
                  name="products"
                  value={newCode.products}
                  onChange={handleNewCodeChange}
                  required
                  className="input h-36"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="muted text-xs">提示：按住 Cmd (macOS) / Ctrl (Windows) 可多选。</p>
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={!products.length}>
                创建激活码
              </button>
            </form>

            <div className="divider" />

            <div className="space-y-3">
              <div className="font-semibold text-slate-900">所有激活码</div>
              <div className="space-y-3">
                {codes.map((code) => (
                  <div key={code._id} className="bg-white/70 border border-brand-100 rounded-2xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900 break-words">激活码: {code.code}</div>
                      <span className={`badge ${code.isUsed ? 'bg-slate-100 text-slate-800 border-slate-200' : ''}`}>
                        {code.isUsed ? '已使用' : '未使用'}
                      </span>
                    </div>
                    <div className="muted text-sm">
                      关联产品: {code.products?.length ? '' : '无'}
                    </div>
                    {code.products?.length ? (
                      <ul className="list-disc pl-5 text-sm text-slate-700">
                        {code.products.map((p) => (
                          <li key={p._id} className="break-words">
                            {p.name}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => handleDeleteCode(code._id)} className="btn-danger" type="button">
                        删除
                      </button>
                    </div>
                  </div>
                ))}
                {codes.length === 0 ? <p className="muted text-sm">暂无激活码。</p> : null}
              </div>
            </div>
          </>
        )}
      </section>

      {/* 用户管理部分 */}
      <section className="surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">用户管理</h2>
            <p className="muted text-sm">查看和管理所有用户信息。</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge">{users.length} 个用户</span>
            <span className="text-slate-500">{isUsersCollapsed ? '▶' : '▼'}</span>
          </div>
        </div>

        {userError ? (
          <div className="mt-4">
            <p className="alert-error">{userError}</p>
          </div>
        ) : null}

        {!isUsersCollapsed && (
          <>
            <div className="divider" />

            <div className="space-y-3">
              <div className="font-semibold text-slate-900">所有用户</div>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user._id} className="bg-white/70 border border-brand-100 rounded-2xl p-4 space-y-3">
                    {editingUser && editingUser._id === user._id ? (
                      <form onSubmit={handleUpdateUser} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            name="username"
                            value={editingUser.username}
                            onChange={handleEditUserChange}
                            required
                            className="input"
                            placeholder="用户名"
                          />
                          <input
                            type="text"
                            name="password"
                            value={editingUser.password || ''}
                            onChange={handleEditUserChange}
                            className="input"
                            placeholder="新密码（留空不修改）"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            name="role"
                            value={editingUser.role}
                            onChange={handleEditUserChange}
                            className="input"
                          >
                            <option value="user">普通用户</option>
                            <option value="admin">管理员</option>
                          </select>
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-slate-900">激活产品</div>
                            <select
                              multiple
                              name="activatedProducts"
                              value={editingUser.activatedProducts || []}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setEditingUser({ ...editingUser, activatedProducts: selected });
                              }}
                              className="input h-24"
                            >
                              {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <p className="muted text-xs">按住 Ctrl/Cmd 可选择多个产品</p>
                            <div className="text-xs text-slate-500">
                              已选择: {editingUser.activatedProducts?.length || 0} 个产品
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" className="btn-primary">
                            保存
                          </button>
                          <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">
                            取消
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">用户名: {user.username}</div>
                            <div className="text-sm text-slate-600">密码: {user.originalPassword || user.password}</div>
                            <div className="text-sm text-slate-600">角色: {user.role === 'admin' ? '管理员' : '普通用户'}</div>
                            <div className="text-sm text-slate-600">注册时间: {new Date(user.createdAt).toLocaleString('zh-CN')}</div>
                          </div>
                          <span className={`badge ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : ''}`}>
                            {user.role === 'admin' ? '管理员' : '用户'}
                          </span>
                        </div>
                        
                        <div className="muted text-sm">
                          已激活产品: {user.activatedProducts?.length || 0} 个
                        </div>
                        
                        {user.activatedProducts?.length ? (
                          <ul className="list-disc pl-5 text-sm text-slate-700">
                            {user.activatedProducts.map((p) => (
                              <li key={p._id} className="break-words">
                                {p.name}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button onClick={() => handleSetEditingUser(user)} className="btn-secondary" type="button">
                            编辑
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="btn-danger" type="button">
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {users.length === 0 ? <p className="muted text-sm">暂无用户。</p> : null}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
