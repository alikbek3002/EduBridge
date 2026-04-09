import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../store/authSlice';
import { useAuth } from '../../../shared/hooks/useAuth';

const HeaderComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, authResolved, onboardingCompleted } = useAuth();

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate(onboardingCompleted ? '/app/dashboard' : '/app/onboarding');
      return;
    }
    navigate('/login');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/', { replace: true });
  };

  return (
    <header className="main-header">
      <div className="main-header__container">
        {/* Logo */}
        <div className="main-header__logo">
          <img 
            src="/images/edubridge.png" 
            alt="EduBridge" 
            className="logo_img"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Navigation */}
        <nav className="main-header__nav">
          <ul>
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#education"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Education
              </a>
            </li>
            <li>
              <a 
                href="#faculty"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('faculty')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('faculty')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Faculty
              </a>
            </li>
            {/* Reviews link removed */}
            <li>
              <a 
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Contact
              </a>
            </li>
            
            {authResolved && isAuthenticated && (
              <>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/app/dashboard');
                    }}
                    className={location.pathname === '/app/dashboard' ? 'active' : ''}
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/app/profile');
                    }}
                    className={location.pathname === '/app/profile' ? 'active' : ''}
                  >
                    Profile
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Authentication buttons: show only Login for guests; remove extra dashboard CTA */}
          {authResolved ? (isAuthenticated ? (
            <div className="auth-buttons">
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                <span>Выйти</span>
              </button>
            </div>
          ) : (
            <button 
              className="login-button"
              onClick={handleLoginClick}
            >
              <span>Войти</span>
            </button>
          )) : null}
        </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;
