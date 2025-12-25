// config/bestieService.js
import axios from 'axios';

// Base URL for your API
// const API_BASE_URL =  'http://localhost:5000/api';
const API_BASE_URL ='https://create-bestie-backend.onrender.com/api';


const bestieService = {
  /**
   * Validate secret code before accessing bestie page
   * @param {string} secretCode - The secret code to validate
   * @returns {Promise<Object>} - Validation result
   */
// Add this to your existing bestieService.js
/**
 * Enhanced error handling with auto-retry
 */
fetchWithRetry : async (url, options = {}, retries = 2) => {
  try {
    const response = await axios({ url, ...options });
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
},
        
  
  validateSecretCode: async (secretCode) => {
    
    try {
      console.log('Validating code:', secretCode);
          const response = await bestieService.fetchWithRetry(`${API_BASE_URL}/besties/public/${secretCode}`, {
      timeout: 10000,
    });
    //   const response = await axios.get(`${API_BASE_URL}/besties/public/${secretCode}`, {
    //     timeout: 10000, // 10 second timeout
    //   });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.bestie,
          message: 'Valid secret code'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Invalid secret code',
          error: null
        };
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          return {
            success: false,
            message: 'Bestie not found or not published',
            error: error
          };
        } else if (error.response.status === 400) {
          return {
            success: false,
            message: 'Invalid request',
            error: error
          };
        }
      } else if (error.request) {
        // No response received
        return {
          success: false,
          message: 'Network error. Please check your connection.',
          error: error
        };
      }
      
      return {
        success: false,
        message: error.message || 'Failed to validate secret code',
        error: error
      };
    }
  },

  /**
   * Get bestie data (after validation)
   * @param {string} secretCode - The validated secret code
   * @returns {Promise<Object>} - Bestie data
   */
  getBestieByCode: async (secretCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/besties/public/${secretCode}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.bestie,
          message: 'Bestie data loaded successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to load bestie data',
          error: null
        };
      }
    } catch (error) {
      console.error('Get bestie error:', error);
      return {
        success: false,
        message: error.message || 'Failed to load bestie data',
        error: error
      };
    }
  },

  /**
   * Submit answer to a question
   * @param {string} secretCode - The secret code
   * @param {number} questionIndex - Index of the question
   * @param {string} answer - The answer text
   * @returns {Promise<Object>} - Submission result
   */
  submitAnswer: async (secretCode, questionIndex, answer) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/besties/public/${secretCode}/answer`, {
        questionIndex,
        answer
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Answer submitted successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to submit answer',
          error: null
        };
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit answer',
        error: error
      };
    }
  }

  
};

export default bestieService;