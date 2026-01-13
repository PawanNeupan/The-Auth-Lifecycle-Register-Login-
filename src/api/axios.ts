import axios from 'axios';

const api = axios.create({
  baseURL: 'http://88.222.242.12:1738',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

