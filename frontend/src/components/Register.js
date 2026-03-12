
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { username, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setMessage('');
    try {
      await axios.post(API_ENDPOINTS.AUTH.REGISTER, { username, password });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response.data.msg || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="surface p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">用户注册</h1>
            <p className="muted text-sm">创建账户以开始激活产品。</p>
          </div>

          <div className="divider" />

          {error && <p className="alert-error mb-4">{error}</p>}
          {message && <p className="alert-success mb-4">{message}</p>}

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={username}
              onChange={onChange}
              required
              className="input"
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              name="password"
              value={password}
              onChange={onChange}
              minLength="6"
              required
              className="input"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              name="password2"
              value={password2}
              onChange={onChange}
              minLength="6"
              required
              className="input"
            />

            <button type="submit" className="btn-primary w-full">
              Register
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;