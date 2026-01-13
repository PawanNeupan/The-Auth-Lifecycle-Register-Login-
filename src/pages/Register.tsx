import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register', formData);
      alert("Account created! Please login.");
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required 
          onChange={e => setFormData({...formData, email: e.target.value})} /><br/>
        <input type="text" placeholder="Username" required 
          onChange={e => setFormData({...formData, username: e.target.value})} /><br/>
        <input type="password" placeholder="Password" required 
          onChange={e => setFormData({...formData, password: e.target.value})} /><br/>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Register;