import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [user, setUser] = useState<{username: string, email: string} | null>(null);

  useEffect(() => {
    api.get('/api/auth/profile')
      .then(res => setUser(res.data))
      .catch(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      {user ? <p>Welcome back, {user.username}! ({user.email})</p> : <p>Loading...</p>}
      <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}>Logout</button>
    </div>
  );
};

export default Dashboard;