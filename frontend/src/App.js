
import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Products from './components/Products';
import setAuthToken from './utils/setAuthToken';
import AdminRoute from './utils/AdminRoute';

// AppContent component remains the same
const AppContent = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
        setAuthToken(token);
      } catch (error) {
        setUser(null);
        setAuthToken(false);
      }
    }
  }, []);

  const links = useMemo(() => {
    const base = [{ to: '/', label: '首页' }, { to: '/products', label: '产品列表' }];
    if (user) {
      // 管理员不显示仪表板，普通用户显示仪表板
      if (user.role !== 'admin') {
        base.push({ to: '/dashboard', label: '仪表板' });
      }
      if (user.role === 'admin') base.push({ to: '/admin', label: '管理后台' });
    } else {
      base.push({ to: '/login', label: '登录' }, { to: '/register', label: '注册' });
    }
    return base;
  }, [user]);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded.user);
      setAuthToken(token);
      if (decoded.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthToken(false);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-container pt-6">
        <div className="nav">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-brand-500 shadow flex items-center justify-center text-white font-extrabold">
                A
              </div>
              <div className="leading-tight">
                <div className="font-extrabold tracking-tight text-slate-900">产品激活系统</div>
              </div>
            </div>

            <nav aria-label="Primary">
              <ul className="nav-list">
                {links.map((l) => {
                  const isActive = location.pathname === l.to;
                  return (
                    <li key={l.to}>
                      <Link to={l.to} className={`nav-link ${isActive ? 'nav-link-active' : ''}`}>
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
                {user ? (
                  <li className="sm:ml-2 flex items-center gap-3">
                    <span className="badge">{user.username}</span>
                    <button onClick={handleLogout} className="btn-danger">
                      退出登录
                    </button>
                  </li>
                ) : null}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-container py-8">
        <div className="card">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;