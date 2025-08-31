import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 60000, // 60 second timeout for file uploads and analysis
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check if the server is running.';
    } else if (error.response?.status === 413) {
      error.message = 'File too large. Please use a smaller file.';
    } else if (error.response?.status === 429) {
      error.message = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Upload a document for analysis
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} Upload response with document ID
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });

  return response.data;
};

/**
 * Start GDPR compliance analysis
 * @param {string} documentId - The document ID to analyze
 * @returns {Promise<Object>} Analysis response with report ID
 */
export const startAnalysis = async (documentId) => {
  const response = await api.post('/analyze', { documentId });
  return response.data;
};

/**
 * Get analysis report
 * @param {string} reportId - The report ID to retrieve
 * @returns {Promise<Object>} Report data
 */
export const getReport = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

/**
 * Get available AI models
 * @returns {Promise<Object>} Available models list
 */
export const getAvailableModels = async () => {
  const response = await api.get('/models');
  return response.data;
};

/**
 * Check server health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Poll for analysis completion
 * @param {string} reportId - The report ID to poll
 * @param {number} maxAttempts - Maximum polling attempts (default: 30)
 * @param {number} interval - Polling interval in ms (default: 2000)
 * @returns {Promise<Object>} Final report data
 */
export const pollForAnalysis = async (reportId, maxAttempts = 30, interval = 2000) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await getReport(reportId);
        
        if (response.success) {
          const report = response.report;
          
          if (report.status === 'completed') {
            resolve(report);
            return;
          } else if (report.status === 'failed') {
            reject(new Error(report.error || 'Analysis failed'));
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          reject(new Error('Analysis timed out'));
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          reject(error);
        }
      }
    };

    poll();
  });
};

export default api;
