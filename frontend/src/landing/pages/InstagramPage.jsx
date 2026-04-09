import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export function InstagramPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateUsername = (value) => {
    // Instagram username rules:
    // 1. Can contain letters, numbers, periods and underscores
    // 2. Cannot start with a period
    // 3. Cannot contain spaces
    // 4. Length between 1 and 30 characters
    const usernameRegex = /^[a-zA-Z0-9_][a-zA-Z0-9_.]{0,29}$/;

    if (!value) {
      setError("Введите никнейм");
      setIsValid(false);
      return;
    }

    if (value.length > 30) {
      setError("Никнейм не может быть длиннее 30 символов");
      setIsValid(false);
      return;
    }

    if (!usernameRegex.test(value)) {
      setError("Неверный формат никнейма. Используйте только буквы, цифры, точки и подчеркивания");
      setIsValid(false);
      return;
    }

    setError("");
    setIsValid(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    validateUsername(value);
  };

  return (
    <div className="legal-page">
      <div className="legal-content">
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto', 
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f7fafc',
              border: '2px solid #e2e8f0',
              color: '#4a5568',
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '8px 16px',
              marginBottom: '2rem',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              ':hover': {
                background: '#edf2f7',
                borderColor: '#cbd5e0',
                transform: 'translateX(-2px)'
              }
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                marginRight: '4px',
                position: 'relative',
                top: '1px'
              }}
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Назад
          </button>

          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: '1.8rem',
            color: '#2d3748'
          }}>
            Instagram Поиск
          </h1>
          
          <div style={{ 
            backgroundColor: '#f7fafc',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ 
              margin: '0',
              color: '#4a5568',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              📸 Введите никнейм Instagram для поиска информации.
              Никнейм должен быть без символа @ в начале.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#4a5568',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                Никнейм
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#718096',
                  fontSize: '0.95rem',
                  pointerEvents: 'none'
                }}>
                  @
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="username"
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingLeft: '28px',
                    borderRadius: '6px',
                    border: `2px solid ${isFocused ? '#4299e1' : '#e2e8f0'}`,
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                />
              </div>
              {error && (
                <p style={{ 
                  color: '#e53e3e', 
                  marginTop: '0.5rem', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '1.1em' }}>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isValid ? '#4299e1' : '#cbd5e0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                ':hover': {
                  backgroundColor: isValid ? '#3182ce' : '#cbd5e0'
                }
              }}
            >
              {isValid ? '🔍' : '⏳'} Найти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}