
// services/api.js
import axios from 'axios';

// const API_BASE_URL ='http://localhost:5000/api';
const API_BASE_URL ='https://create-bestie-backend.onrender.com';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Automatically return data
  (error) => {
    const { response } = error;
    
    // Handle specific error codes
    if (response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      window.location.href = '/login';
    }
    
    // Return consistent error format
    return Promise.reject({
      success: false,
      message: response?.data?.message || error.message || 'Network error',
      status: response?.status,
      data: response?.data
    });
  }
);

export default api;