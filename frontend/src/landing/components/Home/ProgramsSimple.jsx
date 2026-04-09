import React from 'react';
import './SectionShared.css';

const items = [
  { title: 'Инженерия', desc: 'Политехнические программы: Милан, Турин, Падуя' },
  { title: 'Бизнес и менеджмент', desc: 'Экономика, финансы, международный бизнес' },
  { title: 'Искусство и дизайн', desc: 'Архитектура, графдизайн, мода, кино' },
  { title: 'IT и наука о данных', desc: 'Информатика, AI, Data Science' },
  { title: 'Гуманитарные науки', desc: 'Языки, история, философия' },
  { title: 'Медицина и биология', desc: 'Жизненные науки, биомедицина' },
];

const ProgramsSimple = () => (
  <section id="programs" className="section">
    <div className="section__container">
      <header className="section__header">
        <h2 className="section__title">Направления и программы</h2>
        <p className="section__subtitle">Популярные треки обучения в Италии</p>
      </header>

      <div className="grid grid--3">
        {items.map((i) => (
          <article key={i.title} className="card card--hover">
            <div className="card__title">{i.title}</div>
            <div className="card__desc">{i.desc}</div>
          </article>
        ))}
      </div>

      <div className="section__cta">
        <a className="btn btn--green" href="#contact">Получить подборку вузов</a>
      </div>
    </div>
  </section>
);

export default ProgramsSimple;
