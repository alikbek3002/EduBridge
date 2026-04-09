import { create } from 'zustand';
import educationApi from '../shared/api/educationApi';

const useEducationStore = create((set, get) => ({
  // Состояние
  universities: [],
  majors: [],
  courses: [],
  enrollments: [],
  applications: [],
  achievements: [],
  userAchievements: [],
  aiRecommendations: [],
  notifications: [],
  studyPlans: [],
  documents: [],
  dashboardStats: null,
  
  // Состояние загрузки
  loading: {
    universities: false,
    majors: false,
    courses: false,
    enrollments: false,
    applications: false,
    achievements: false,
    userAchievements: false,
    aiRecommendations: false,
    notifications: false,
    studyPlans: false,
    documents: false,
    dashboardStats: false,
  },
  
  // Ошибки
  errors: {
    universities: null,
    majors: null,
    courses: null,
    enrollments: null,
    applications: null,
    achievements: null,
    userAchievements: null,
    aiRecommendations: null,
    notifications: null,
    studyPlans: null,
    documents: null,
    dashboardStats: null,
  },

  // Действия для университетов
  fetchUniversities: async (params = {}) => {
    set((state) => ({
      loading: { ...state.loading, universities: true },
      errors: { ...state.errors, universities: null },
    }));

    try {
      const data = await educationApi.getUniversities(params);
      set((state) => ({
        universities: data.results || data,
        loading: { ...state.loading, universities: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, universities: false },
        errors: { ...state.errors, universities: error.message },
      }));
    }
  },

  // Действия для специальностей
  fetchMajors: async (params = {}) => {
    set((state) => ({
      loading: { ...state.loading, majors: true },
      errors: { ...state.errors, majors: null },
    }));

    try {
      const data = await educationApi.getMajors(params);
      set((state) => ({
        majors: data.results || data,
        loading: { ...state.loading, majors: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, majors: false },
        errors: { ...state.errors, majors: error.message },
      }));
    }
  },

  // Действия для курсов
  fetchCourses: async (params = {}) => {
    set((state) => ({
      loading: { ...state.loading, courses: true },
      errors: { ...state.errors, courses: null },
    }));

    try {
      const data = await educationApi.getCourses(params);
      set((state) => ({
        courses: data.results || data,
        loading: { ...state.loading, courses: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, courses: false },
        errors: { ...state.errors, courses: error.message },
      }));
    }
  },

  // Действия для записей на курсы
  fetchEnrollments: async () => {
    set((state) => ({
      loading: { ...state.loading, enrollments: true },
      errors: { ...state.errors, enrollments: null },
    }));

    try {
      const data = await educationApi.getEnrollments();
      set((state) => ({
        enrollments: data.results || data,
        loading: { ...state.loading, enrollments: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, enrollments: false },
        errors: { ...state.errors, enrollments: error.message },
      }));
    }
  },

  createEnrollment: async (data) => {
    const result = await educationApi.createEnrollment(data);
    set((state) => ({
      enrollments: [...state.enrollments, result],
    }));
    return result;
  },

  updateEnrollment: async (id, data) => {
    const result = await educationApi.updateEnrollment(id, data);
    set((state) => ({
      enrollments: state.enrollments.map((enrollment) =>
        enrollment.id === id ? result : enrollment
      ),
    }));
    return result;
  },

  deleteEnrollment: async (id) => {
    await educationApi.deleteEnrollment(id);
    set((state) => ({
      enrollments: state.enrollments.filter((enrollment) => enrollment.id !== id),
    }));
  },

  // Действия для заявок
  fetchApplications: async () => {
    set((state) => ({
      loading: { ...state.loading, applications: true },
      errors: { ...state.errors, applications: null },
    }));

    try {
      const data = await educationApi.getApplications();
      set((state) => ({
        applications: data.results || data,
        loading: { ...state.loading, applications: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, applications: false },
        errors: { ...state.errors, applications: error.message },
      }));
    }
  },

  createApplication: async (data) => {
    const result = await educationApi.createApplication(data);
    set((state) => ({
      applications: [...state.applications, result],
    }));
    return result;
  },

  updateApplication: async (id, data) => {
    const result = await educationApi.updateApplication(id, data);
    set((state) => ({
      applications: state.applications.map((application) =>
        application.id === id ? result : application
      ),
    }));
    return result;
  },

  deleteApplication: async (id) => {
    await educationApi.deleteApplication(id);
    set((state) => ({
      applications: state.applications.filter((application) => application.id !== id),
    }));
  },

  // Действия для достижений
  fetchAchievements: async () => {
    set((state) => ({
      loading: { ...state.loading, achievements: true },
      errors: { ...state.errors, achievements: null },
    }));

    try {
      const data = await educationApi.getAchievements();
      set((state) => ({
        achievements: data.results || data,
        loading: { ...state.loading, achievements: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, achievements: false },
        errors: { ...state.errors, achievements: error.message },
      }));
    }
  },

  fetchUserAchievements: async () => {
    set((state) => ({
      loading: { ...state.loading, userAchievements: true },
      errors: { ...state.errors, userAchievements: null },
    }));

    try {
      const data = await educationApi.getUserAchievements();
      set((state) => ({
        userAchievements: data.results || data,
        loading: { ...state.loading, userAchievements: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, userAchievements: false },
        errors: { ...state.errors, userAchievements: error.message },
      }));
    }
  },

  // Действия для AI рекомендаций
  fetchAIRecommendations: async () => {
    set((state) => ({
      loading: { ...state.loading, aiRecommendations: true },
      errors: { ...state.errors, aiRecommendations: null },
    }));

    try {
      const data = await educationApi.getAIRecommendations();
      set((state) => ({
        aiRecommendations: data.results || data,
        loading: { ...state.loading, aiRecommendations: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, aiRecommendations: false },
        errors: { ...state.errors, aiRecommendations: error.message },
      }));
    }
  },

  generateAIRecommendations: async () => {
    await educationApi.generateAIRecommendations();
    // Обновляем список рекомендаций после генерации
    get().fetchAIRecommendations();
  },

  updateAIRecommendation: async (id, data) => {
    const result = await educationApi.updateAIRecommendation(id, data);
    set((state) => ({
      aiRecommendations: state.aiRecommendations.map((recommendation) =>
        recommendation.id === id ? result : recommendation
      ),
    }));
    return result;
  },

  // Уведомления: используйте notificationsStore/notificationsSlice

  // Действия для планов обучения
  fetchStudyPlans: async () => {
    set((state) => ({
      loading: { ...state.loading, studyPlans: true },
      errors: { ...state.errors, studyPlans: null },
    }));

    try {
      const data = await educationApi.getStudyPlans();
      set((state) => ({
        studyPlans: data.results || data,
        loading: { ...state.loading, studyPlans: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, studyPlans: false },
        errors: { ...state.errors, studyPlans: error.message },
      }));
    }
  },

  createStudyPlan: async (data) => {
    const result = await educationApi.createStudyPlan(data);
    set((state) => ({
      studyPlans: [...state.studyPlans, result],
    }));
    return result;
  },

  updateStudyPlan: async (id, data) => {
    const result = await educationApi.updateStudyPlan(id, data);
    set((state) => ({
      studyPlans: state.studyPlans.map((plan) =>
        plan.id === id ? result : plan
      ),
    }));
    return result;
  },

  deleteStudyPlan: async (id) => {
    await educationApi.deleteStudyPlan(id);
    set((state) => ({
      studyPlans: state.studyPlans.filter((plan) => plan.id !== id),
    }));
  },

  // Действия для документов
  fetchDocuments: async () => {
    set((state) => ({
      loading: { ...state.loading, documents: true },
      errors: { ...state.errors, documents: null },
    }));

    try {
      const data = await educationApi.getDocuments();
      set((state) => ({
        documents: data.results || data,
        loading: { ...state.loading, documents: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, documents: false },
        errors: { ...state.errors, documents: error.message },
      }));
    }
  },

  createDocument: async (data) => {
    const result = await educationApi.createDocument(data);
    set((state) => ({
      documents: [...state.documents, result],
    }));
    return result;
  },

  updateDocument: async (id, data) => {
    const result = await educationApi.updateDocument(id, data);
    set((state) => ({
      documents: state.documents.map((document) =>
        document.id === id ? result : document
      ),
    }));
    return result;
  },

  deleteDocument: async (id) => {
    await educationApi.deleteDocument(id);
    set((state) => ({
      documents: state.documents.filter((document) => document.id !== id),
    }));
  },

  // Действия для статистики дашборда
  fetchDashboardStats: async () => {
    set((state) => ({
      loading: { ...state.loading, dashboardStats: true },
      errors: { ...state.errors, dashboardStats: null },
    }));

    try {
      const data = await educationApi.getDashboardStats();
      set((state) => ({
        dashboardStats: data,
        loading: { ...state.loading, dashboardStats: false },
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, dashboardStats: false },
        errors: { ...state.errors, dashboardStats: error.message },
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
      universities: [],
      majors: [],
      courses: [],
      enrollments: [],
      applications: [],
      achievements: [],
      userAchievements: [],
      aiRecommendations: [],
      notifications: [],
      studyPlans: [],
      documents: [],
      dashboardStats: null,
      loading: {
        universities: false,
        majors: false,
        courses: false,
        enrollments: false,
        applications: false,
        achievements: false,
        userAchievements: false,
        aiRecommendations: false,
        notifications: false,
        studyPlans: false,
        documents: false,
        dashboardStats: false,
      },
      errors: {
        universities: null,
        majors: null,
        courses: null,
        enrollments: null,
        applications: null,
        achievements: null,
        userAchievements: null,
        aiRecommendations: null,
        notifications: null,
        studyPlans: null,
        documents: null,
        dashboardStats: null,
      },
    });
  },
}));

export default useEducationStore;
