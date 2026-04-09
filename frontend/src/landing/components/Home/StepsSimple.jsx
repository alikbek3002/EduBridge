import React from 'react';
import './SectionShared.css';

const steps = [
  { n: 1, t: 'Выбор направления', d: 'Подбираем вузы и программы под ваши цели и бюджет.' },
  { n: 2, t: 'Подготовка документов', d: 'Формируем пакет, даём шаблоны и инструкции.' },
  { n: 3, t: 'Подача и отслеживание', d: 'Отправляем заявки и следим за статусами.' },
  { n: 4, t: 'Виза и переезд', d: 'Помогаем с визой, жильём и адаптацией в Италии.' },
];

const StepsSimple = () => (
  <section id="process" className="section section--alt">
    <div className="section__container">
      <header className="section__header">
        <h2 className="section__title">Как это работает</h2>
        <p className="section__subtitle">Четыре простых шага до поступления</p>
      </header>

      <div className="steps">
        {steps.map(s => (
          <div key={s.n} className="step">
            <div className="step__num">{s.n}</div>
            <div className="step__content">
              <div className="step__title">{s.t}</div>
              <div className="step__desc">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StepsSimple;
