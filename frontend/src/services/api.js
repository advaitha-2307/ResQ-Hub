import axios from 'axios';

// Base URL pointing to Python FastAPI REST API Backend
const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiService = {
  // Check Backend & Database Health Status
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('API Health Check Error:', error);
      throw error;
    }
  },

  // 1. GET /incidents - Fetch list of incidents (supports filtering)
  getIncidents: async (filters = {}) => {
    try {
      const params = {};
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.priority && filters.priority !== 'All') params.priority = filters.priority;
      
      const response = await apiClient.get('/incidents', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  },

  // 2. GET /incidents/:id - Fetch single incident details
  getIncidentById: async (id) => {
    try {
      const response = await apiClient.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching incident ${id}:`, error);
      throw error;
    }
  },

  // 3. POST /incidents - Register a new emergency incident
  createIncident: async (incidentData) => {
    try {
      const response = await apiClient.post('/incidents', incidentData);
      return response.data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  },

  // 4. PUT /incidents/:id - Update incident status or details
  updateIncident: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/incidents/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating incident ${id}:`, error);
      throw error;
    }
  },

  // 5. DELETE /incidents/:id - Remove incident record from DB
  deleteIncident: async (id) => {
    try {
      const response = await apiClient.delete(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting incident ${id}:`, error);
      throw error;
    }
  }
};

export default apiService;
