import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useDispatch } from 'react-redux';
import { useAuth } from './shared/hooks/useAuth';
import { fetchProfile } from './store/authSlice';
import HomePage from './landing/pages/HomePage';
import LoginPage from './landing/pages/LoginPage';
import DashboardPage from './dashboard/pages/DashboardPage';
import UserProfileForm from './dashboard/components/Onboarding/UserProfileForm';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import api from './shared/services/api';
import './App.css';
import './landing/pages/landing-overrides.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, authResolved, onboardingCompleted } = useAuth();
  const authenticatedRoute = onboardingCompleted ? '/app/dashboard' : '/app/onboarding';

  React.useEffect(() => {
    // В самом начале загрузки приложения запрашиваем CSRF токен
    api.get('/api/auth/csrf/').catch(() => {});
  }, []);

  React.useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Notifications />
        <ModalsProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route
                path="/"
                element={<HomePage />}
              />
              <Route
                path="/login"
                element={authResolved ? (!isAuthenticated ? <LoginPage /> : <Navigate to={authenticatedRoute} replace />) : null}
              />
              <Route
                path="/register"
                element={<Navigate to="/login" replace />}
              />
            </Route>

            {/* Protected routes under /app prefix */}
            <Route path="/app" element={<PrivateLayout />}>
              <Route
                path="onboarding"
                element={<UserProfileForm />}
              />
              <Route
                path="dashboard"
                element={<DashboardPage />}
              />
              {/* Страница профиля удалена; используйте настройки в /app/dashboard */}
            </Route>

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ModalsProvider>
        <Analytics />
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;
