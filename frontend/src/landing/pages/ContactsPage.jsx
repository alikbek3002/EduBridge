import { useEffect } from "react";
import { Link } from 'react-router-dom';

export function ContactsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-header">
        <Link to="/" className="back-link">← Назад на главную</Link>
        <h1>Контактная информация</h1>
      </div>
      
      <div className="legal-content">
        <p className="legal-intro">
          Свяжитесь с нами любым удобным способом. Мы всегда готовы помочь и ответить 
          на ваши вопросы.
        </p>

        <div className="contacts-grid">
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <h3>Электронная почта</h3>
            <p className="contact-value">
              <a href="mailto:tapzar.app@gmail.com" className="contact-link">
                tapzar.app@gmail.com
              </a>
            </p>
            <p className="contact-description">
              Основной канал связи для технической поддержки, 
              вопросов по подпискам и общих обращений
            </p>
            <p className="contact-response-time">
              <strong>Время ответа:</strong> в течение 24 часов
            </p>
          </div>

          <div className="contact-item">
            <div className="contact-icon">💬</div>
            <h3>Telegram</h3>
            <p className="contact-value">
              <a href="https://t.me/tapzarapp" target="_blank" rel="noopener noreferrer" className="contact-link">
                @tapzarapp
              </a>
            </p>
            <p className="contact-description">
              Быстрая связь для срочных вопросов и 
              оперативной технической поддержки
            </p>
            <p className="contact-response-time">
              <strong>Время ответа:</strong> в течение 2-4 часов
            </p>
          </div>
        </div>

        <div className="contact-info">
          
          <h2>Что мы можем помочь</h2>
          <ul>
            <li>Техническая поддержка и решение проблем</li>
            <li>Вопросы по подпискам и платежам</li>
            <li>Обновление личных данных</li>
            <li>Восстановление доступа к аккаунту</li>
            <li>Предложения по улучшению сервиса</li>
          </ul>

          <h2>Перед обращением</h2>
          <p>
            Для более быстрого решения проблемы, пожалуйста, подготовьте следующую информацию:
          </p>
          <ul>
            <li>Ваш логин или email</li>
            <li>Описание проблемы или вопроса</li>
            <li>Скриншот ошибки (если есть)</li>
            <li>Версия браузера и операционной системы</li>
          </ul>
        </div>

        <div className="legal-footer">
          <p><strong>Дата последнего обновления:</strong> 01.09.2025</p>
        </div>
      </div>
    </div>
  );
}
