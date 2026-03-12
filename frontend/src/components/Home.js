
import React from 'react';

const Home = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <h1 className="section-title">欢迎使用产品激活系统</h1>
          <p className="muted max-w-2xl">
            快速激活您的产品。登录系统查看仪表板，兑换激活码，并访问您已激活的产品链接。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">快速</span>
          <span className="badge">安全</span>
          <span className="badge">专业</span>
        </div>
      </div>

      <div className="divider" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface p-5">
          <div className="font-semibold text-slate-900">浏览产品</div>
          <p className="muted mt-1 text-sm">查看所有可用产品，了解产品详情和功能。</p>
        </div>
        <div className="surface p-5">
          <div className="font-semibold text-slate-900">兑换激活码</div>
          <p className="muted mt-1 text-sm">输入激活码立即解锁产品访问权限。</p>
        </div>
        <div className="surface p-5">
          <div className="font-semibold text-slate-900">产品库</div>
          <p className="muted mt-1 text-sm">查看您已激活的所有产品，包含链接和描述。</p>
        </div>
      </div>

      <div className="surface p-6 text-center">
        <h3 className="font-semibold text-slate-900 mb-2">开始探索产品</h3>
        <p className="muted text-sm mb-4">浏览我们的产品目录，找到适合您的产品</p>
        <a href="/products" className="btn-primary">
          查看产品列表
        </a>
      </div>
    </div>
  );
};

export default Home;