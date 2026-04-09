import React from "react";
import "./FacultyList.css";

const faculties = [
  { number: "01", title: "IT-ТЕХНОЛОГИИ", desc: "Примерное описание" },
  { number: "02", title: "ПСИХОЛОГИЯ", desc: "Примерное описание" },
  { number: "03", title: "ПЕДАГОГИКА", desc: "Примерное описание" },
  { number: "04", title: "ЭКОНОМИКА", desc: "Примерное описание" },
  { number: "05", title: "ЖУРНАЛИСТИКА", desc: "Примерное описание" },
  { number: "06", title: "МЕДИЦИНА", desc: "Примерное описание" },
];

const FacultyList = () => (
  <section id="faculty" className="faculty-list-section">
    <h2 className="faculty-list-title">ВЫБЕРИТЕ ПОДХОДЯЩИЙ ФАКУЛЬТЕТ</h2>
    <div className="faculty-list-cards">
      {faculties.map((f, i) => (
        <div className="faculty-card" key={i}>
          <div className="faculty-card-number">{f.number}</div>
          <div className="faculty-card-title">{f.title}</div>
          <div className="faculty-card-desc">{f.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default FacultyList;
