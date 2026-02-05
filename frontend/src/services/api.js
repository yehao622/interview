import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || window.location.origin,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.REACT_APP_API_KEY || ''
    },
    timeout: 30000 // 30 seconds for AI requests
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.data);
            throw new Error(error.response.data.message || error.response.data.error || 'API request failed');
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.request);
            throw new Error('Network error - please check if backend is running');
        } else {
            // Something else happened
            console.error('Error:', error.message);
            throw error;
        }
    }
);

export const reconcileMedication = async (data) => {
    const response = await api.post('/api/reconcile/medication', data);
    return response.data;
};

export const validateDataQuality = async (data) => {
    const response = await api.post('/api/validate/data-quality', data);
    return response.data;
};

export default api;
