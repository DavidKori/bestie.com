// services/authService.js
import api from './api';

const authService = {
  /**
   * Admin login
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password });
      
      // Store token and admin data
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('adminData', JSON.stringify(response.admin));
      }
      
      return {
        success: response.success,
        data: response,
        message: response.message || 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
        error: error
      };
    }
  },

  /**
   * Admin logout
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Get current admin profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/admin/profile');
      return {
        success: response.success,
        data: response.data,
        message: 'Profile loaded'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to load profile',
        error: error
      };
    }
  },

  /**
   * Update password
   */
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/admin/password', {
        currentPassword,
        newPassword
      });
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Password updated'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update password',
        error: error
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default authService;