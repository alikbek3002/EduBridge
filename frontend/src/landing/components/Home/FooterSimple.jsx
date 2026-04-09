import React from 'react';
import './SectionShared.css';

const FooterSimple = () => (
  <footer className="section section--alt" style={{padding:'32px 0'}}>
    <div className="section__container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <div style={{fontWeight:800}}>Лого тип</div>
      <div style={{color:'#64748b'}}>© {new Date().getFullYear()} EduBridge. Все права защищены.</div>
      <div style={{display:'flex',gap:12}}>
        <a className="btn btn--ghost" href="#about">О нас</a>
        <a className="btn btn--ghost" href="#contact">Контакты</a>
      </div>
    </div>
  </footer>
);

export default FooterSimple;
