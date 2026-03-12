import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // 重置状态
        if (isMounted) {
          setLoading(true);
          setError('');
        }

        // 先加载产品列表，无论用户是否登录
        const productsRes = await axios.get(API_ENDPOINTS.PRODUCTS);
        
        if (isMounted) {
          // 处理产品数据
          if (productsRes.data && Array.isArray(productsRes.data)) {
            setProducts(productsRes.data);
          } else {
            console.error('产品数据格式错误');
            setError('产品数据格式错误');
          }

          // 尝试加载用户信息
          try {
            const userRes = await axios.get(API_ENDPOINTS.AUTH.ME);
            if (isMounted) {
              setUser(userRes.data);
            }
          } catch (err) {
            // 用户未登录，继续显示产品列表
            if (isMounted) {
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('加载数据失败:', err);
        if (isMounted) {
          setError('加载数据失败，请刷新页面重试');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const isProductActivated = (productId) => {
    return user?.activatedProducts?.some(p => p._id === productId) || false;
  };

  // 检查产品是否可以直接访问（无需激活）
  const canAccessProduct = (product) => {
    // 如果产品不需要激活，则可以直接访问
    if (!product.requiresActivation) return true;
    // 如果需要激活，则检查用户是否已激活
    return isProductActivated(product._id);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="section-title">产品列表</div>
        <p className="muted">正在加载产品列表…</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-4">
        <div className="section-title">产品列表</div>
        <div className="surface p-6 text-center">
          <p className="text-slate-700 mb-4">请登录后查看完整产品信息</p>
          <a href="/login" className="btn-primary">立即登录</a>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-4">
        <div className="section-title">产品列表</div>
        <div className="surface p-6 text-center">
          <p className="text-slate-700 mb-4">请登录后查看完整产品信息</p>
          <a href="/login" className="btn-primary">立即登录</a>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-4">
        <div className="section-title">产品列表</div>
        <div className="surface p-6 text-center">
          <p className="text-slate-700 mb-4">请登录后查看完整产品信息</p>
          <a href="/login" className="btn-primary">立即登录</a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="section-title">产品列表</div>
        <p className="alert-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title">产品列表</h1>
          <p className="muted">浏览所有可用产品{user ? '，激活后即可访问' : '，请登录后查看详情'}。</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">{products.length} 个产品</span>
          {user && <span className="badge">{user.activatedProducts?.length || 0} 个已激活</span>}
        </div>
      </div>

      {!user ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="surface p-5 flex flex-col h-full">
              <div className="flex-1 space-y-4">
                {/* 产品图片 */}
                {product.image && product.image.trim() !== '' ? (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 text-sm">图片加载失败</span></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">暂无图片</span>
                  </div>
                )}
                
                {/* 产品信息 */}
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="muted text-sm line-clamp-3">{product.description}</p>
                  )}
                </div>
              </div>

              {/* 状态和操作 - 固定在底部 */}
              <div className="mt-auto pt-4">
                <div className="text-center">
                  <span className="text-sm text-gray-500">请登录后查看激活状态</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isActivated = isProductActivated(product._id);
            const canAccess = canAccessProduct(product);
            
            return (
              <div key={product._id} className="surface p-5 flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  {/* 产品图片 */}
                  {product.image && product.image.trim() !== '' ? (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 图片加载失败时显示占位符
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 text-sm">图片加载失败</span></div>';
                        }}
                        onLoad={(e) => {
                          // 图片加载成功时显示
                          e.target.style.display = 'block';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">暂无图片</span>
                    </div>
                  )}
                  
                  {/* 产品信息 */}
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{product.name}</h3>
                    {product.description && (
                      <p className="muted text-sm line-clamp-3">{product.description}</p>
                    )}
                  </div>
                </div>

                {/* 状态和操作 - 固定在底部 */}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between">
                    <span className={`badge ${canAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} ${!product.requiresActivation ? 'bg-purple-100 text-purple-800' : ''}`}>
                      {!product.requiresActivation ? '开放产品' : (canAccess ? '已激活' : '未激活')}
                    </span>
                    
                    {canAccess ? (
                      <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary text-sm px-3 py-1"
                      >
                        访问产品
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">{product.requiresActivation ? '需要激活' : '可直接访问'}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {products.length === 0 && (
        <div className="surface p-8 text-center">
          <p className="muted">暂无产品</p>
        </div>
      )}
    </div>
  );
};

export default Products;