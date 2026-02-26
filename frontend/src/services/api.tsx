import axios from 'axios';

// define the base URL from Vercel Environment Variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// add an interceptor to automatically attach the JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;