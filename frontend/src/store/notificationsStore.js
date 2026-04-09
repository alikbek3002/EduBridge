import { create } from 'zustand';
import notificationsApi from '../shared/api/notificationsApi';

const useNotificationsStore = create((set) => ({
  // Состояние
  notifications: [],
  templates: [],
  unreadCount: 0,
  
  // Состояние загрузки
  loading: {
    notifications: false,
    templates: false,
    unreadCount: false,
  },
  
  // Ошибки
  errors: {
    notifications: null,
    templates: null,
    unreadCount: null,
  },

  // Действия для уведомлений
  fetchNotifications: async () => {
    set((state) => ({
      loading: { ...state.loading, notifications: true },
      errors: { ...state.errors, notifications: null },
    }));

    try {
      const data = await notificationsApi.getNotifications();
      set((state) => ({
        notifications: data.results || data,
        loading: { ...state.loading, notifications: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, notifications: false },
        errors: { ...state.errors, notifications: error.message },
      }));
    }
  },

  fetchNotification: async (id) => {
    return notificationsApi.getNotification(id);
  },

  updateNotification: async (id, data) => {
    const result = await notificationsApi.updateNotification(id, data);
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? result : notification
      ),
    }));
    return result;
  },

  createNotification: async (data) => {
    const result = await notificationsApi.createNotification(data);
    set((state) => ({
      notifications: [result, ...state.notifications],
    }));
    return result;
  },

  fetchUnreadCount: async () => {
    set((state) => ({
      loading: { ...state.loading, unreadCount: true },
      errors: { ...state.errors, unreadCount: null },
    }));

    try {
      const data = await notificationsApi.getUnreadCount();
      set((state) => ({
        unreadCount: data.unread_count || 0,
        loading: { ...state.loading, unreadCount: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, unreadCount: false },
        errors: { ...state.errors, unreadCount: error.message },
      }));
    }
  },

  markAllAsRead: async () => {
    await notificationsApi.markAllAsRead();
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        is_read: true,
      })),
      unreadCount: 0,
    }));
  },

  markAsRead: async (notificationId) => {
    await notificationsApi.markAsRead(notificationId);
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // Действия для шаблонов
  fetchTemplates: async () => {
    set((state) => ({
      loading: { ...state.loading, templates: true },
      errors: { ...state.errors, templates: null },
    }));

    try {
      const data = await notificationsApi.getNotificationTemplates();
      set((state) => ({
        templates: data.results || data,
        loading: { ...state.loading, templates: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, templates: false },
        errors: { ...state.errors, templates: error.message },
      }));
    }
  },

  // Очистка ошибок
  clearError: (key) => {
    set((state) => ({
      errors: { ...state.errors, [key]: null },
    }));
  },

  // Сброс состояния
  reset: () => {
    set({
      notifications: [],
      templates: [],
      unreadCount: 0,
      loading: {
        notifications: false,
        templates: false,
        unreadCount: false,
      },
      errors: {
        notifications: null,
        templates: null,
        unreadCount: null,
      },
    });
  },
}));

export default useNotificationsStore;
