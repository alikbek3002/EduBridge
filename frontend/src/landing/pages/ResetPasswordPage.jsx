import { useState, useEffect } from 'react';
import './AuthShared.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError, clearSuccess, clearResetStatus } from '../../store/authSlice';

export function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetEmailSent } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Неверный формат email');
    } else {
      setEmailError('');
    }
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('Введите email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Неверный формат email');
      return;
    }

    try {
      await dispatch(resetPassword(email));
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  const canSubmit = email && !emailError && !loading;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/login')}
            type="button"
          >
            ← Назад к входу
          </button>
        </div>
        
        <h1 className="auth-title">Сброс пароля</h1>
        <p className="auth-subtitle">
          Введите ваш email для получения кода восстановления
        </p>

        {resetEmailSent ? (
          <div className="success-container">
            <div className="success-icon">📧</div>
            <h2>Письмо отправлено!</h2>
            <p>Мы отправили код для сброса пароля на адрес <strong>{email}</strong></p>
            <p>Проверьте почту и введите код на следующей странице.</p>
            
            <div className="success-actions">
              <button 
                className="auth-button"
                onClick={() => navigate('/confirm-reset')}
              >
                Ввести код
              </button>
              <button 
                className="auth-button outline"
                onClick={() => {
                  setEmail('');
                  dispatch(clearResetStatus());
                }}
              >
                Отправить повторно
              </button>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${emailError ? 'error' : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
              />
              {emailError && (
                <div className="form-error">{emailError}</div>
              )}
            </div>

            {error && (
              <div className="form-error">
                {typeof error === 'string' ? error : error.error || 'Ошибка отправки'}
              </div>
            )}

            <button 
              className="auth-button" 
              type="submit" 
              disabled={!canSubmit}
            >
              {loading ? 'Отправка...' : 'Отправить код'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Вспомнили пароль?{" "}
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
