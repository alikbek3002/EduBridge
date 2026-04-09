import React from 'react';
import './SectionShared.css';

const ContactSimple = () => (
  <section id="contact" className="section">
    <div className="section__container">
      <div className="cta">
        <h3>Готовы начать поступление?</h3>
        <p>Оставьте заявку — мы подберём программы и составим план действий.</p>
        <div className="cta__controls">
          <a className="btn btn--green btn--lg" href="/login">Войти в кабинет</a>
          <a className="btn btn--ghost" href="#faq">Задать вопрос</a>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSimple;
