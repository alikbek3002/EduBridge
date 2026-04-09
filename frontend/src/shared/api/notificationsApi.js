import api from '../services/api';

const notificationsApi = {
  async getNotifications() {
    const response = await api.get('/api/notifications/');
    return response.data;
  },

  async getNotification(id) {
    const response = await api.get(`/api/notifications/${id}/`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.post(`/api/notifications/${id}/mark-read/`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/api/notifications/mark-all-read/');
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/api/notifications/unread-count/');
    return response.data;
  },

  async createNotification(data) {
    const response = await api.post('/api/notifications/create/', data);
    return response.data;
  },

  async updateNotification(id, data) {
    const response = await api.put(`/api/notifications/${id}/`, data);
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/api/notifications/${id}/`);
    return response.data;
  },

  async getNotificationTemplates() {
    const response = await api.get('/api/notifications/templates/');
    return response.data;
  },

  async createNotificationTemplate(data) {
    const response = await api.post('/api/notifications/templates/', data);
    return response.data;
  },

  async updateNotificationTemplate(id, data) {
    const response = await api.put(`/api/notifications/templates/${id}/`, data);
    return response.data;
  },

  async deleteNotificationTemplate(id) {
    const response = await api.delete(`/api/notifications/templates/${id}/`);
    return response.data;
  },
};

export default notificationsApi;
