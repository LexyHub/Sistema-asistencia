import api from './api';

// Admin service - handles all administration-related API calls
const AdminService = {
  // Get pending correction requests
  getPendingCorrections: async () => {
    try {
      const response = await api.get('/admin-correcciones');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending corrections:', error);
      throw error;
    }
  },
  
  // Approve or reject a correction request
  processCorrectionRequest: async (formData) => {
    try {
      const response = await api.post('/admin-correcciones', formData);
      return response.data;
    } catch (error) {
      console.error('Error processing correction request:', error);
      throw error;
    }
  }
};

export default AdminService;
