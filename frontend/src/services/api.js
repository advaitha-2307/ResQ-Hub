import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling global errors and 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if stored
      localStorage.removeItem('resq_token');
      localStorage.removeItem('resq_user');
      // Trigger a custom event so UI can react if needed
      window.dispatchEvent(new Event('resq_unauthorized'));
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH APIS ================= */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

/* ================= INCIDENT APIS ================= */
export const incidentAPI = {
  getIncidents: (params) => api.get('/incidents', { params }),
  getIncident: (id) => api.get(`/incidents/${id}`),
  createIncident: (data) => api.post('/incidents', data),
  updateIncident: (id, data) => api.put(`/incidents/${id}`, data),
  assignAmbulance: (id, ambulanceId) =>
    api.post(`/incidents/${id}/assign-ambulance`, { ambulance_id: ambulanceId }),
  assignHospital: (id, hospitalId) =>
    api.post(`/incidents/${id}/assign-hospital`, { hospital_id: hospitalId }),
  getRecommendedAmbulances: (id) => api.get(`/incidents/${id}/recommended-ambulances`),
  getRecommendedHospitals: (id) => api.get(`/incidents/${id}/recommended-hospitals`),
  deleteIncident: (id) => api.delete(`/incidents/${id}`),
};

/* ================= AMBULANCE APIS ================= */
export const ambulanceAPI = {
  getAmbulances: (params) => api.get('/ambulances', { params }),
  getAvailable: () => api.get('/ambulances/available'),
  getAmbulance: (id) => api.get(`/ambulances/${id}`),
  createAmbulance: (data) => api.post('/ambulances', data),
  updateAmbulance: (id, data) => api.put(`/ambulances/${id}`, data),
  assign: (id, incidentId) => api.post(`/ambulances/${id}/assign`, { incident_id: incidentId }),
};

/* ================= HOSPITAL APIS ================= */
export const hospitalAPI = {
  getHospitals: (params) => api.get('/hospitals', { params }),
  getHospital: (id) => api.get(`/hospitals/${id}`),
  createHospital: (data) => api.post('/hospitals', data),
  updateHospital: (id, data) => api.put(`/hospitals/${id}`, data),
  updateCapacity: (id, capacityData) => api.put(`/hospitals/${id}/capacity`, capacityData),
};

/* ================= RESOURCE APIS ================= */
export const resourceAPI = {
  getResources: (params) => api.get('/resources', { params }),
  getResource: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
};

/* ================= NOTIFICATION APIS ================= */
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all/mark'),
};

/* ================= USER APIS ================= */
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}`, { role }),
};

/* ================= ANALYTICS APIS ================= */
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getEmergencyTypes: () => api.get('/analytics/emergency-types'),
  getPriority: () => api.get('/analytics/priority'),
  getStatus: () => api.get('/analytics/status'),
  getTrends: () => api.get('/analytics/trends'),
};

export default api;
