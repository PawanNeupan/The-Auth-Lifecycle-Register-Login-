import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', formData);
      // Save token exactly as returned by backend
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" required 
          onChange={e => setFormData({...formData, username: e.target.value})} /><br/>
        <input type="password" placeholder="Password" required 
          onChange={e => setFormData({...formData, password: e.target.value})} /><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;