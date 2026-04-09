import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, apiHelpers } from '../shared/services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch {
      // Local auth state should still be cleared even if server-side logout fails.
    }
    return null;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(email);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const verifyReset = createAsyncThunk(
  'auth/verifyReset',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyReset(data);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({
        error: errorMessage,
        details: {
          ...(error.response?.data || {}),
          status: error.response?.status,
        },
      });
    }
  }
);

export const updateProfileComplete = createAsyncThunk(
  'auth/updateProfileComplete',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfileComplete(profileData);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch(fetchProfile());
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  'auth/requestEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestEmailVerify();
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return response.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage });
    }
  }
);

export const fetchDevices = createAsyncThunk(
  'auth/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.listDevices();
      return res.data?.devices || [];
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const revokeDevice = createAsyncThunk(
  'auth/revokeDevice',
  async (deviceId, { rejectWithValue }) => {
    try {
      await authAPI.revokeDevice(deviceId);
      return deviceId;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const revokeAllDevices = createAsyncThunk(
  'auth/revokeAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.revokeAllDevices();
      return true;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const twofaSetup = createAsyncThunk(
  'auth/twofaSetup',
  async (force = false, { rejectWithValue }) => {
    try {
      const res = await authAPI.twofaSetup(force);
      return res.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const twofaEnable = createAsyncThunk(
  'auth/twofaEnable',
  async (code, { rejectWithValue }) => {
    try {
      const res = await authAPI.twofaEnable(code);
      return res.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

export const twofaDisable = createAsyncThunk(
  'auth/twofaDisable',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.twofaDisable();
      return res.data;
    } catch (error) {
      const errorMessage = apiHelpers.handleError(error);
      return rejectWithValue({ error: errorMessage, details: error.response?.data });
    }
  }
);

const getInitialState = () => ({
  user: null,
  isAuthenticated: false,
  authResolved: false,
  loading: false,
  error: null,
  success: null,
  resetEmailSent: false,
  resetVerified: false,
  emailVerificationSent: false,
  profileUpdating: false,
  passwordChanging: false,
  devices: [],
  devicesLoading: false,
  twofa: { secret: null, otpauth_url: null, loading: false },
  loginAttempts: 0,
  lastLoginAttempt: null,
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearResetStatus: (state) => {
      state.resetEmailSent = false;
      state.resetVerified = false;
    },
    clearEmailVerificationStatus: (state) => {
      state.emailVerificationSent = false;
    },
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authResolved = true;
      state.error = '\u0421\u0435\u0441\u0441\u0438\u044f \u0438\u0441\u0442\u0435\u043a\u043b\u0430. \u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.';
    },
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    resetAuthState: () => getInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.authResolved = true;
        state.user = action.payload?.user || null;
        state.error = null;
        state.success = '\u0412\u0445\u043e\u0434 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e!';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.authResolved = true;
        state.user = null;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u0445\u043e\u0434\u0430';
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authResolved = true;
        state.loading = false;
        state.error = null;
        state.success = '\u0412\u044b\u0445\u043e\u0434 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e';
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetEmailSent = true;
        state.success = action.payload?.message || '\u041a\u043e\u0434 \u0434\u043b\u044f \u0441\u0431\u0440\u043e\u0441\u0430 \u043f\u0430\u0440\u043e\u043b\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d \u043d\u0430 email';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0435 \u043a\u043e\u0434\u0430';
      })
      .addCase(verifyReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyReset.fulfilled, (state, action) => {
        state.loading = false;
        state.resetVerified = true;
        state.resetEmailSent = false;
        state.success = action.payload?.message || '\u041f\u0430\u0440\u043e\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d';
      })
      .addCase(verifyReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0441\u0431\u0440\u043e\u0441\u0435 \u043f\u0430\u0440\u043e\u043b\u044f';
      })
      .addCase(fetchProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authResolved = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.authResolved = true;
        if (action.payload?.details?.status === 401) {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.profileUpdating = false;
        state.success = '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdating = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u044f';
      })
      .addCase(updateProfileComplete.pending, (state) => {
        state.profileUpdating = true;
        state.error = null;
      })
      .addCase(updateProfileComplete.fulfilled, (state, action) => {
        state.profileUpdating = false;
        state.success = action.payload?.message || '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d';
        const updatedUser = action.payload?.user;
        if (updatedUser) {
          state.user = updatedUser;
        }
      })
      .addCase(updateProfileComplete.rejected, (state, action) => {
        state.profileUpdating = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u044f';
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordChanging = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordChanging = false;
        state.success = action.payload?.message || '\u041f\u0430\u0440\u043e\u043b\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChanging = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0438 \u043f\u0430\u0440\u043e\u043b\u044f';
      })
      .addCase(requestEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.emailVerificationSent = true;
        state.success = action.payload?.message || '\u041f\u0438\u0441\u044c\u043c\u043e \u0434\u043b\u044f \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e';
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0435 \u043f\u0438\u0441\u044c\u043c\u0430';
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload?.message || 'Email \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d';
        if (state.user) {
          state.user = { ...state.user, is_email_verified: true };
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f email';
      })
      .addCase(fetchDevices.pending, (state) => {
        state.devicesLoading = true;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.devicesLoading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.devicesLoading = false;
        state.error = action.payload?.error || '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0441\u043f\u0438\u0441\u043e\u043a \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432';
      })
      .addCase(revokeDevice.fulfilled, (state, action) => {
        const id = action.payload;
        state.devices = state.devices.filter((d) => d.id !== id);
      })
      .addCase(revokeAllDevices.fulfilled, (state) => {
        state.devices = [];
      })
      .addCase(twofaSetup.pending, (state) => {
        state.twofa.loading = true;
      })
      .addCase(twofaSetup.fulfilled, (state, action) => {
        state.twofa.loading = false;
        state.twofa.secret = action.payload?.secret || null;
        state.twofa.otpauth_url = action.payload?.otpauth_url || null;
      })
      .addCase(twofaSetup.rejected, (state, action) => {
        state.twofa.loading = false;
        state.error = action.payload?.error || '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0441\u0435\u043a\u0440\u0435\u0442 2FA';
      })
      .addCase(twofaEnable.fulfilled, (state) => {
        if (state.user) {
          state.user.two_factor_enabled = true;
        }
        state.success = '2FA \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0430';
      })
      .addCase(twofaDisable.fulfilled, (state) => {
        if (state.user) {
          state.user.two_factor_enabled = false;
        }
        state.twofa.secret = null;
        state.twofa.otpauth_url = null;
        state.success = '2FA \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d\u0430';
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearMessages,
  clearResetStatus,
  clearEmailVerificationStatus,
  forceLogout,
  updateUserInfo,
  resetAuthState,
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthResolved = (state) => state.auth.authResolved;
export const selectIsLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectSuccess = (state) => state.auth.success;

export default authSlice.reducer;
