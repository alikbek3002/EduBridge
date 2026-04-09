import api from '../services/api';

const educationApi = {
  async getUniversities(params = {}) {
    const response = await api.get('/api/education/universities/', {
      params: { ...params, limit: 1000 },
    });
    return response.data;
  },

  async getUniversity(id) {
    const response = await api.get(`/api/education/universities/${id}/`);
    return response.data;
  },

  async getMajors(params = {}) {
    const response = await api.get('/api/education/majors/', { params });
    return response.data;
  },

  async getCourses(params = {}) {
    const response = await api.get('/api/education/courses/', { params });
    return response.data;
  },

  async getCourse(id) {
    const response = await api.get(`/api/education/courses/${id}/`);
    return response.data;
  },

  async getEnrollments() {
    const response = await api.get('/api/education/enrollments/');
    return response.data;
  },

  async createEnrollment(data) {
    const response = await api.post('/api/education/enrollments/', data);
    return response.data;
  },

  async updateEnrollment(id, data) {
    const response = await api.put(`/api/education/enrollments/${id}/`, data);
    return response.data;
  },

  async deleteEnrollment(id) {
    const response = await api.delete(`/api/education/enrollments/${id}/`);
    return response.data;
  },

  async getApplications() {
    const response = await api.get('/api/education/applications/');
    return response.data;
  },

  async createApplication(data) {
    const response = await api.post('/api/education/applications/', data);
    return response.data;
  },

  async updateApplication(id, data) {
    const response = await api.put(`/api/education/applications/${id}/`, data);
    return response.data;
  },

  async deleteApplication(id) {
    const response = await api.delete(`/api/education/applications/${id}/`);
    return response.data;
  },

  async getAchievements() {
    const response = await api.get('/api/education/achievements/');
    return response.data;
  },

  async getUserAchievements() {
    const response = await api.get('/api/education/user-achievements/');
    return response.data;
  },

  async getAIRecommendations() {
    const response = await api.get('/api/education/ai-recommendations/');
    return response.data;
  },

  async generateAIRecommendations() {
    const response = await api.post('/api/education/generate-ai-recommendations/');
    return response.data;
  },

  async updateAIRecommendation(id, data) {
    const response = await api.put(`/api/education/ai-recommendations/${id}/`, data);
    return response.data;
  },

  async getStudyPlans() {
    const response = await api.get('/api/education/study-plans/');
    return response.data;
  },

  async createStudyPlan(data) {
    const response = await api.post('/api/education/study-plans/', data);
    return response.data;
  },

  async updateStudyPlan(id, data) {
    const response = await api.put(`/api/education/study-plans/${id}/`, data);
    return response.data;
  },

  async deleteStudyPlan(id) {
    const response = await api.delete(`/api/education/study-plans/${id}/`);
    return response.data;
  },

  async getDocuments() {
    const response = await api.get('/api/education/documents/');
    return response.data;
  },

  async createDocument(data) {
    const response = await api.post('/api/education/documents/upload/', data);
    return response.data;
  },

  async updateDocument(id, data) {
    const response = await api.put(`/api/education/documents/${id}/`, data);
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/api/education/documents/${id}/`);
    return response.data;
  },

  async getDocumentSignedUrl(id) {
    const response = await api.get(`/api/education/documents/${id}/signed-url/`);
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/api/education/dashboard/stats/');
    return response.data;
  },
};

export default educationApi;
