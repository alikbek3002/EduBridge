import React, { useEffect, useMemo, useRef, useState } from 'react';
import './SectionShared.css';
import './UniversitiesSlider.css';
import { API_BASE_URL } from '../../../shared/services/api';

const getLogoSrc = (u) => {
  // Prefer serializer-provided absolute logo_url; fallback to logo string if absolute
  const url = u.logo_url || u.logo || '';
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  return '';
};

const truncate = (str = '', len = 120) => {
  const s = String(str || '');
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
};

const UniversitiesSlider = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/api/education/universities/?is_active=true&limit=1000`;
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) {
          // On 401/403 or any error, don't redirect — just render nothing
          setUniversities([]);
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || []);
        if (!ignore) setUniversities(list);
      } catch {
        if (!ignore) setUniversities([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  // Prepare a compact list and duplicate it for seamless loop
  const items = useMemo(() => {
    const base = (universities || []).slice(0, 12);
    return base.length > 0 ? [...base, ...base] : [];
  }, [universities]);

  return (
    <section id="universities" className="section section--alt universities-landing">
      <div className="section__container">
        <header className="section__header">
          <h2 className="section__title">Университеты</h2>
          <p className="section__subtitle">Актуальные вузы из нашей базы</p>
        </header>

        {loading && (
          <div className="uni-slider">
            <div className="uni-slider__viewport">
              <div className="uni-slider__track" style={{ animation: 'none' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <article key={i} className="uni-card">
                    <div className="uni-card__media">
                      <div className="uni-card__logo--placeholder" />
                    </div>
                    <div className="uni-card__body">
                      <div className="uni-card__title" style={{ background:'#f1f5f9', height:18, borderRadius:6, width:'80%' }} />
                      <div className="uni-card__meta" style={{ background:'#f1f5f9', height:12, borderRadius:6, width:'40%', marginTop:8 }} />
                      <div className="uni-card__desc" style={{ background:'#f1f5f9', height:36, borderRadius:6, width:'100%', marginTop:12 }} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="uni-slider">
            <div className="uni-slider__viewport">
              <div className="uni-slider__track" ref={sliderRef}>
                {items.map((u, idx) => {
                  const logo = getLogoSrc(u);
                  const cityCountry = [u.city, u.country].filter(Boolean).join(', ');
                  return (
                    <article key={`${u.id || idx}-${idx}`} className="uni-card">
                      <div className="uni-card__media">
                        {logo ? (
                          <img src={logo} alt={u.name} className="uni-card__logo" />
                        ) : (
                          <div className="uni-card__logo--placeholder" aria-hidden />
                        )}
                      </div>
                      <div className="uni-card__body">
                        <div className="uni-card__title">{u.name || 'University'}</div>
                        <div className="uni-card__meta">{cityCountry || '—'}</div>
                        {u.description && (
                          <div className="uni-card__desc">{truncate(u.description)}</div>
                        )}
                        <div className="uni-card__stats">
                          {typeof u.student_count === 'number' && (
                            <div className="uni-stat"><strong>{u.student_count.toLocaleString()}</strong><span>студентов</span></div>
                          )}
                          {u.deadline && (
                            <div className="uni-stat"><strong>{u.deadline}</strong><span>дедлайн</span></div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign:'center', color:'#64748b', marginTop: 12 }}>
            Университеты появятся здесь, как только будут добавлены в базу
          </div>
        )}
      </div>
    </section>
  );
};

export default UniversitiesSlider;
