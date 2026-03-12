
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [activationMessage, setActivationMessage] = useState('');

  const loadUserData = useCallback(async () => {
    try {
      // 同时加载用户信息和产品列表
      const [userRes, productsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.AUTH.ME),
        axios.get(API_ENDPOINTS.PRODUCTS)
      ]);
      setUser(userRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Could not load user data. Please try logging in again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const onActivateSubmit = async (e) => {
    e.preventDefault();
    setActivationMessage('');
    setError('');

    if (!code) {
      setActivationMessage('Please enter a code.');
      return;
    }

    try {
      await axios.post(API_ENDPOINTS.USERS.ACTIVATE_PRODUCT, { code });
      setActivationMessage('Product activated successfully!');
      setCode('');
      // Reload user data to show the new product
      await loadUserData();
    } catch (err) {
      const msg = err.response?.data?.msg || '激活失败。请检查激活码并重试。';
      setActivationMessage(msg);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="section-title">仪表板</div>
        <p className="muted">正在加载您的账户…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="section-title">仪表板</div>
        <p className="alert-error">{error}</p>
      </div>
    );
  }

  // 过滤出需要激活的产品（不包括开放产品）
  const activatedProducts = user?.activatedProducts?.filter(product => 
    products.some(p => p._id === product._id && p.requiresActivation)
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title">仪表板</h1>
          <p className="muted">欢迎回来{user?.username ? `，${user.username}` : ''}。</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">账户</span>
          <span className="badge">激活</span>
        </div>
      </div>

      <div className="surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">激活新产品</div>
            <div className="muted text-sm">输入激活码以解锁产品访问权限。</div>
          </div>
        </div>

        <div className="divider" />

        <form onSubmit={onActivateSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="输入激活码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn-primary sm:w-40">
            激活
          </button>
        </form>

        {activationMessage ? (
          <div className="mt-4">
            <p className={`${activationMessage.toLowerCase().includes('success') ? 'alert-success' : 'alert'}`}>
              {activationMessage}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">已激活的产品</h2>
          <span className="badge">{activatedProducts.length}</span>
        </div>

        {activatedProducts.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activatedProducts.map((product) => (
              <div key={product._id} className="surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-4">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-900 hover:underline break-words"
                        >
                          {product.name}
                        </a>
                        {product.description ? <p className="muted mt-1 text-sm">{product.description}</p> : null}
                      </div>
                    </div>
                  </div>
                  <span className="badge shrink-0">已激活</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface p-5">
            <p className="muted">您还没有激活任何需要激活码的产品。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;