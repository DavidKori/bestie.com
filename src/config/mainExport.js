// services/index.js
import api from './api';
import authService from './authService';
import bestieService from './bestieService';

// Export all services
export {
  api,
  authService,
  bestieService,
};

// Optional: Export default object
export default {
  api,
  auth: authService,
  bestie: bestieService,
};