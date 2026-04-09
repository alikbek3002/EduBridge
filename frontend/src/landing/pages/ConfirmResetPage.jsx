import { useState, useEffect } from 'react';
import './AuthShared.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyReset, clearError, clearSuccess } from '../../store/authSlice';

export function ConfirmResetPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetVerified } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    new_password2: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // При успешном сбросе перенаправляем на страницу входа
  useEffect(() => {
    if (resetVerified) {
      setTimeout(() => {
        navigate('/login?reset=success');
      }, 2000);
    }
  }, [resetVerified, navigate]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = 'Неверный формат email';
        } else {
          delete newErrors.email;
        }
        break;

      case 'code':
        if (!/^\d{6}$/.test(value)) {
          newErrors.code = 'Код должен содержать 6 цифр';
        } else {
          delete newErrors.code;
        }
        break;

      case 'new_password':
        if (value.length < 8) {
          newErrors.new_password = 'Минимум 8 символов';
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.new_password = 'Должна быть хотя бы одна строчная буква';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.new_password = 'Должна быть хотя бы одна заглавная буква';
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.new_password = 'Должна быть хотя бы одна цифра';
        } else {
          delete newErrors.new_password;
        }
        break;

      case 'new_password2':
        if (value !== formData.new_password) {
          newErrors.new_password2 = 'Пароли не совпадают';
        } else {
          delete newErrors.new_password2;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Валидация в реальном времени
    if (value) {
      validateField(name, value);
    }

    // Очищаем общую ошибку при изменении полей
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Финальная валидация
    const isEmailValid = validateField('email', formData.email);
    const isCodeValid = validateField('code', formData.code);
    const isPasswordValid = validateField('new_password', formData.new_password);
    const isPassword2Valid = validateField('new_password2', formData.new_password2);

    if (!isEmailValid || !isCodeValid || !isPasswordValid || !isPassword2Valid) {
      return;
    }

    try {
      await dispatch(verifyReset({
        email: formData.email,
        code: formData.code,
        new_password: formData.new_password
      }));
    } catch (error) {
      console.error('Reset verification error:', error);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { level: 'weak', text: 'Слабый', color: '#ef4444' };
      case 2:
        return { level: 'fair', text: 'Удовлетворительный', color: '#f59e0b' };
      case 3:
        return { level: 'good', text: 'Хороший', color: '#10b981' };
      case 4:
      case 5:
        return { level: 'strong', text: 'Сильный', color: '#059669' };
      default:
        return { level: 'weak', text: 'Слабый', color: '#ef4444' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.new_password);
  const canSubmit = formData.email && formData.code && formData.new_password && 
                   formData.new_password2 && Object.keys(errors).length === 0;

  if (resetVerified) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h1 className="auth-title">Пароль изменен!</h1>
            <p className="auth-subtitle">
              Ваш пароль успешно изменен. Теперь вы можете войти в систему.
            </p>
            <button 
              className="auth-button"
              onClick={() => navigate('/login')}
            >
              Войти в систему
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/reset-password')}
            type="button"
          >
            ← Назад
          </button>
        </div>
        
        <h1 className="auth-title">Введите код</h1>
        <p className="auth-subtitle">
          Введите код из письма и новый пароль
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email адрес
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="form-error">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="code">
              Код подтверждения
            </label>
            <input
              id="code"
              name="code"
              type="text"
              className={`form-input ${errors.code ? 'error' : ''}`}
              placeholder="123456"
              value={formData.code}
              onChange={handleChange}
              maxLength="6"
              required
            />
            {errors.code && (
              <div className="form-error">{errors.code}</div>
            )}
            <p className="form-hint">Введите 6-значный код из письма</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new_password">
              Новый пароль
            </label>
            <div className="password-input-container">
              <input
                id="new_password"
                name="new_password"
                type={showPasswords.new ? "text" : "password"}
                className={`form-input ${errors.new_password ? 'error' : ''}`}
                placeholder="Новый пароль"
                value={formData.new_password}
                onChange={handleChange}
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>
            
            {formData.new_password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.level === 'weak' ? 25 : 
                               passwordStrength.level === 'fair' ? 50 : 
                               passwordStrength.level === 'good' ? 75 : 100)}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
            
            {errors.new_password && (
              <div className="form-error">{errors.new_password}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new_password2">
              Подтвердите новый пароль
            </label>
            <div className="password-input-container">
              <input
                id="new_password2"
                name="new_password2"
                type={showPasswords.confirm ? "text" : "password"}
                className={`form-input ${errors.new_password2 ? 'error' : ''}`}
                placeholder="Подтвердите новый пароль"
                value={formData.new_password2}
                onChange={handleChange}
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.new_password2 && (
              <div className="form-error">{errors.new_password2}</div>
            )}
          </div>

          {error && (
            <div className="form-error">
              {typeof error === 'string' ? error : error.error || 'Ошибка сброса пароля'}
            </div>
          )}

          <button 
            className="auth-button" 
            type="submit" 
            disabled={!canSubmit || loading}
          >
            {loading ? 'Изменение...' : 'Изменить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
}
