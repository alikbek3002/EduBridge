import React, { useEffect, useRef } from "react";
import "./EducationVariants.css";

const EducationVariants = () => {
  const universities = [
    {
      id: 1,
      name: "Университет Болоньи",
      location: "Болонья, Италия",
      description: "Один из старейших университетов Европы, основанный в 1088 году.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "2,500+",
      founded: "1088"
    },
    {
      id: 2,
      name: "Университет Милана",
      location: "Милан, Италия",
      description: "Крупнейший университет Италии с современными исследовательскими центрами.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,800+",
      founded: "1924"
    },
    {
      id: 3,
      name: "Университет Флоренции",
      location: "Флоренция, Италия",
      description: "Престижный университет в сердце эпохи Возрождения.",
      image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,200+",
      founded: "1321"
    },
    {
      id: 4,
      name: "Университет Рима",
      location: "Рим, Италия",
      description: "Столичный университет с многовековой историей.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "3,200+",
      founded: "1303"
    },
    {
      id: 5,
      name: "Университет Турина",
      location: "Турин, Италия",
      description: "Ведущий университет в области инженерии и технологий.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,500+",
      founded: "1404"
    },
    {
      id: 6,
      name: "Университет Венеции",
      location: "Венеция, Италия",
      description: "Уникальный университет в историческом городе на воде.",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "900+",
      founded: "1868"
    },
    {
      id: 7,
      name: "Университет Неаполя",
      location: "Неаполь, Италия",
      description: "Один из крупнейших университетов Италии с богатой историей.",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "2,100+",
      founded: "1224"
    },
    {
      id: 8,
      name: "Университет Пизы",
      location: "Пиза, Италия",
      description: "Престижный университет с выдающимися научными традициями.",
      image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,400+",
      founded: "1343"
    },
    {
      id: 9,
      name: "Университет Падуи",
      location: "Падуя, Италия",
      description: "Один из старейших университетов мира с выдающимися достижениями.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,700+",
      founded: "1222"
    },
    {
      id: 10,
      name: "Университет Генуи",
      location: "Генуя, Италия",
      description: "Морской университет с сильными программами в области морских наук.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,300+",
      founded: "1471"
    },
    {
      id: 11,
      name: "Университет Пармы",
      location: "Парма, Италия",
      description: "Университет с сильными программами в области медицины и права.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,100+",
      founded: "1117"
    },
    {
      id: 12,
      name: "Университет Модены",
      location: "Модена, Италия",
      description: "Исторический университет с современными исследовательскими программами.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "950+",
      founded: "1175"
    },
    {
      id: 13,
      name: "Университет Феррары",
      location: "Феррара, Италия",
      description: "Университет эпохи Возрождения с богатыми культурными традициями.",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "800+",
      founded: "1391"
    },
    {
      id: 14,
      name: "Университет Сиены",
      location: "Сиена, Италия",
      description: "Один из старейших университетов Италии с уникальной архитектурой.",
      image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,000+",
      founded: "1240"
    },
    {
      id: 15,
      name: "Университет Перуджи",
      location: "Перуджа, Италия",
      description: "Университет с сильными программами в области иностранных языков.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "1,200+",
      founded: "1308"
    },
    {
      id: 16,
      name: "Университет Камерино",
      location: "Камерино, Италия",
      description: "Современный университет с инновационными образовательными программами.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "750+",
      founded: "1336"
    },
    {
      id: 17,
      name: "Университет Урбино",
      location: "Урбино, Италия",
      description: "Университет в историческом городе с программами в области искусства.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "650+",
      founded: "1506"
    },
    {
      id: 18,
      name: "Университет Мачераты",
      location: "Мачерата, Италия",
      description: "Университет с сильными программами в области гуманитарных наук.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "850+",
      founded: "1290"
    },
    {
      id: 19,
      name: "Университет Анконы",
      location: "Анкона, Италия",
      description: "Приморский университет с программами в области морских технологий.",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "700+",
      founded: "1959"
    },
    {
      id: 20,
      name: "Университет Терни",
      location: "Терни, Италия",
      description: "Современный университет с программами в области инженерии и технологий.",
      image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      graduates: "600+",
      founded: "1969"
    }
  ];

  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationId;
    let position = 0;
    const speed = 0.5; // пикселей в миллисекунду

    const animate = () => {
      position += speed;
      slider.style.transform = `translateX(-${position}px)`;
      
      // Сброс позиции когда все карточки прошли
      if (position >= slider.scrollWidth / 2) {
        position = 0;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <section id="education" className="parallax_edc_var">
      <div className="parallax_edc_var .mask"></div>
      <div className="education-variants-container">
        <div className="education-variants-header">
          <h2 className="education-variants-title">Our Universities</h2>
          <p className="education-variants-subtitle">
            We help you enroll in prestigious Italian universities
          </p>
        </div>
        
        <div className="universities-slider">
          <div className="slider-container">
            <div className="slider-track" ref={sliderRef}>
              {/* Дублируем карточки для бесшовного скролла */}
              {[...universities, ...universities].map((university, index) => (
                <div key={`${university.id}-${index}`} className="university-card">
                  <div className="university-image-container">
                    <img 
                      src={university.image} 
                      alt={university.name}
                      className="university-image"
                    />
                    <div className="university-overlay">
                      <div className="university-founded">
                        <span className="founded-year">{university.founded}</span>
                        <span className="founded-label">год</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="university-content">
                    <h3 className="university-name">{university.name}</h3>
                    <p className="university-location">📍 {university.location}</p>
                    <p className="university-description">{university.description}</p>
                    
                    <div className="university-stats">
                      <div className="stat-item">
                        <span className="stat-number">{university.graduates}</span>
                        <span className="stat-label">выпускников</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationVariants;
