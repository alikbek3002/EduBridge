import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const PrivateLayout = () => {
  const { isAuthenticated, authResolved, onboardingCompleted } = useAuth();
  const location = useLocation();

  if (!authResolved) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (onboardingCompleted && location.pathname === '/app/onboarding') {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (!onboardingCompleted && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default PrivateLayout;
