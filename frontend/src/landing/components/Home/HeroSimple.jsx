import React from 'react';
import './HeroSimple.css';

const HeroSimple = () => {
  return (
    <section className="hero-simple">
      <div className="hero-simple__container">
        <div className="hero-simple__content">
          <h1>
            Поступи в Италию с
            <br /> нашей пошаговой системой
          </h1>
          <p>
            Наша система поможет вам на каждом этапе подачи
            документов для поступления в итальянские вузы
          </p>
          <div className="hero-simple__cta">
            <button className="btn btn--green btn--lg">
              Запусти стресс‑free поступление
            </button>
          </div>
        </div>

        <div className="hero-simple__cards">
          <div className="card">
            <div className="icon">📋</div>
            <div className="title">Пошаговая методология</div>
            <div className="desc">Понятные инструкции для каждого шага поступления</div>
          </div>
          <div className="card">
            <div className="icon">💻</div>
            <div className="title">Онлайн‑платформа</div>
            <div className="desc">Все материалы и чек‑листы в одном месте</div>
          </div>
          <div className="card">
            <div className="icon">🛟</div>
            <div className="title">Поддержка экспертов</div>
            <div className="desc">Ответим на вопросы и поможем с документами</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSimple;
