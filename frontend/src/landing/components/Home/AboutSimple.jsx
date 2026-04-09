import React from 'react';
import './SectionShared.css';

const AboutSimple = () => {
  return (
    <section id="about" className="section">
      <div className="section__container">
        <header className="section__header">
          <h2 className="section__title">О сервисе</h2>
          <p className="section__subtitle">Мы ведём вас за руку от выбора программы до подачи документов — просто и без стресса.</p>
        </header>

        <div className="grid grid--3">
          <div className="card">
            <div className="card__icon">🧭</div>
            <div className="card__title">Маршрут поступления</div>
            <div className="card__desc">Пошаговый план с дедлайнами и чек‑листами для каждого этапа.</div>
          </div>
          <div className="card">
            <div className="card__icon">📄</div>
            <div className="card__title">Шаблоны и образцы</div>
            <div className="card__desc">Готовые шаблоны заявлений и примеры заполнения.</div>
          </div>
          <div className="card">
            <div className="card__icon">🤝</div>
            <div className="card__title">Поддержка консультанта</div>
            <div className="card__desc">Ответы на вопросы и проверка документов по ходу процесса.</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSimple;
