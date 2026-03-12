
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const { username, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      onLogin(res.data.token);
    } catch (err) {
      setError('Invalid Credentials');
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="surface p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">用户登录</h1>
            <p className="muted text-sm">登录系统以激活产品和查看您的产品库。</p>
          </div>

          <div className="divider" />

          {error && <p className="alert-error mb-4">{error}</p>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={username}
                onChange={onChange}
                required
                className="input"
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;