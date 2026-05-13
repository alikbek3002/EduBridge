import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import educationApi from '../shared/api/educationApi';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'education/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getDashboardStats();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUniversities = createAsyncThunk(
  'education/fetchUniversities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await educationApi.getUniversities(params);
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourses = createAsyncThunk(
  'education/fetchCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await educationApi.getCourses(params);
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'education/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getAchievements();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserAchievements = createAsyncThunk(
  'education/fetchUserAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getUserAchievements();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAIRecommendations = createAsyncThunk(
  'education/fetchAIRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await educationApi.getAIRecommendations();
      return data.results || data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  universities: [],
  courses: [],
  achievements: [],
  userAchievements: [],
  aiRecommendations: [],
  dashboardStats: null,
  loading: {
    universities: false,
    courses: false,
    achievements: false,
    userAchievements: false,
    aiRecommendations: false,
    dashboardStats: false,
  },
  error: null,
};

// Slice
const educationSlice = createSlice({
  name: 'education',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: () => {
      // Add any success clearing logic here
    },
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.dashboardStats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.dashboardStats = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.dashboardStats = false;
        state.error = action.payload;
      });

    // Universities
    builder
      .addCase(fetchUniversities.pending, (state) => {
        state.loading.universities = true;
        state.error = null;
      })
      .addCase(fetchUniversities.fulfilled, (state, action) => {
        state.loading.universities = false;
        state.universities = action.payload;
      })
      .addCase(fetchUniversities.rejected, (state, action) => {
        state.loading.universities = false;
        state.error = action.payload;
      });

    // Courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading.courses = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading.courses = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading.courses = false;
        state.error = action.payload;
      });

    // Achievements (all available achievements)
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.loading.achievements = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.achievements = action.payload || [];
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading.achievements = false;
        state.error = action.payload;
      });

    // User Achievements (earned by the current user)
    builder
      .addCase(fetchUserAchievements.pending, (state) => {
        state.loading.userAchievements = true;
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.loading.userAchievements = false;
        state.userAchievements = action.payload || [];
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.loading.userAchievements = false;
        state.error = action.payload;
      });

    // AI Recommendations
    builder
      .addCase(fetchAIRecommendations.pending, (state) => {
        state.loading.aiRecommendations = true;
        state.error = null;
      })
      .addCase(fetchAIRecommendations.fulfilled, (state, action) => {
        state.loading.aiRecommendations = false;
        // If we got data from the API, use it; otherwise, use mock data
        if (action.payload && action.payload.length > 0) {
          state.aiRecommendations = action.payload;
        } else {
          // Mock data for AI recommendations if API returns empty
          state.aiRecommendations = [
            {
              id: 1,
              title: 'Улучшите свои навыки программирования',
              content: 'Основываясь на вашем прогрессе, рекомендуем пройти курс по алгоритмам и структурам данных.',
              category: 'Обучение',
              priority: 'Высокий'
            },
            {
              id: 2,
              title: 'Пройдите тест на уровень английского',
              content: 'Ваш прогресс по английскому языку показывает хорошие результаты. Пройдите тест, чтобы подтвердить уровень.',
              category: 'Тестирование',
              priority: 'Средний'
            },
            {
              id: 3,
              title: 'Завершите курсовую работу',
              content: 'До дедлайна по курсовой работе осталось 7 дней. Рекомендуем начать работу сейчас.',
              category: 'Дедлайны',
              priority: 'Срочно'
            }
          ];
        }
      })
      .addCase(fetchAIRecommendations.rejected, (state, action) => {
        state.loading.aiRecommendations = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = educationSlice.actions;
export default educationSlice.reducer;
