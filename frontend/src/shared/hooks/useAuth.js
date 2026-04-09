import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated, authResolved } = useSelector((state) => state.auth);
  const onboardingCompleted = user?.profile?.onboarding_completed === true;

  return {
    user,
    isAuthenticated,
    authResolved,
    onboardingCompleted,
  };
};
