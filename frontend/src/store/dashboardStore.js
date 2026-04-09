import { create } from 'zustand';
import { authAPI, educationAPI } from '../shared/services/api';

export const useDashboardStore = create((set) => ({
  // Общий прогресс (инициал по умолчанию)
  overallProgress: 0,
  
  // Прогресс по секциям
  currentProgress: {
    ielts: 0,
    tolc: 0,
    universities: 0,
    universitaly: 0,
    codice: 0,
    dov: 0,
    visa: 0
  },

  // Активная секция
  activeSection: 'main',

  // Данные пользователя
  userData: {
    name: '',
    level: '',
    ieltsCurrent: 0,
    ieltsTarget: 0,
    tolcCurrent: 0,
    tolcTarget: 0
  },

  // Выбранные университеты
  selectedUniversities: new Set(),
  favoriteUniversities: new Set([1, 3]),

  // AI сообщения
  aiMessages: [
    {
      id: 1,
      type: 'ai',
      message: 'Привет! Я помогу тебе с подготовкой к поступлению. Что тебя интересует?',
      timestamp: new Date()
    }
  ],

  // Дедлайны
  deadlines: [],

  // Действия
  setActiveSection: (section) => set({ activeSection: section }),
  
  updateProgress: (section, progress) => set((state) => ({
    currentProgress: {
      ...state.currentProgress,
      [section]: progress
    }
  })),

  updateOverallProgress: (progress) => set({ overallProgress: progress }),

  addAIMessage: (message) => set((state) => ({
    aiMessages: [...state.aiMessages, {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date()
    }]
  })),

  addAIResponse: (response) => set((state) => ({
    aiMessages: [...state.aiMessages, {
      id: Date.now() + 1,
      type: 'ai',
      message: response,
      timestamp: new Date()
    }]
  })),

  toggleFavoriteUniversity: (id) => set((state) => {
    const newFavorites = new Set(state.favoriteUniversities);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    return { favoriteUniversities: newFavorites };
  }),

  toggleSelectedUniversity: (id) => set((state) => {
    const newSelected = new Set(state.selectedUniversities);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedUniversities: newSelected };
  }),

  updateUserData: (data) => set((state) => ({
    userData: { ...state.userData, ...data }
  })),

  // Инициализация стора реальными данными
  initFromBackend: async () => {
    try {
      const [profileRes, statsRes, deadlinesRes] = await Promise.all([
        authAPI.getProfile(),
        educationAPI.getDashboardStats(),
        educationAPI.getDeadlines(),
      ]);
      const profile = profileRes?.data || {};
      const stats = statsRes?.data || {};
      const deadlines = Array.isArray(deadlinesRes?.data) ? deadlinesRes.data : [];

      // Обновляем имя/уровни при наличии
      set((state) => ({
        userData: {
          ...state.userData,
          name: profile?.first_name || profile?.email || state.userData.name,
          level: state.userData.level,
          ieltsCurrent: profile?.profile?.ielts_current_score ?? state.userData.ieltsCurrent,
          ieltsTarget: profile?.profile?.ielts_target_score ?? state.userData.ieltsTarget,
        },
        overallProgress: stats?.overall_progress ?? state.overallProgress,
        currentProgress: {
          ...state.currentProgress,
          ielts: stats?.ielts_completed ? 100 : state.currentProgress.ielts,
          dov: stats?.dov_completed ? 100 : state.currentProgress.dov,
          universities: stats?.universities_selected ? 100 : state.currentProgress.universities,
          universitaly: stats?.universitaly_registration ? 100 : state.currentProgress.universitaly,
          visa: stats?.visa_obtained ? 100 : state.currentProgress.visa,
        },
  deadlines,
      }));
    } catch (e) {
      console.error('Failed to init dashboard store', e);
    }
  },
}));
