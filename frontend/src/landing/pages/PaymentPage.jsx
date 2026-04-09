import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { fetchProfile } from "../../store/authSlice";
import './PaymentPage.css';
import { paymentAPI } from '../../shared/services/api';

export function PaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);

  const plans = {
    basic: {
      name: 'Basic',
      duration: '1 Month',
      oldPrice: 25,
      currentPrice: 10,
      discount: '60%',
      features: ['Basic access', 'Standard support', 'Cancel anytime']
    },
    popular: {
      name: 'Popular',
      duration: '3 Months',
      oldPrice: 30,
      currentPrice: 15,
      discount: '50%',
      features: ['Full access', 'Priority support', 'Save 50%']
    },
    premium: {
      name: 'Best Value',
      duration: '12 Months',
      oldPrice: 100,
      currentPrice: 40,
      discount: '60%',
      features: ['Premium access', '24/7 VIP', 'Save 60%']
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Маска и валидация
  function formatCardNumber(value) {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  }
  function validateCardNumber(value) {
    const num = value.replace(/\s/g, '');
    if (num.length < 13 || num.length > 19) return false;
    let sum = 0, dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = parseInt(num[i], 10);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  }
  function formatExpiry(value) {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2').slice(0, 5);
  }
  function validateExpiry(value) {
    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(value)) return false;
    const [mm, yy] = value.split('/').map(Number);
    const now = new Date();
    const cy = now.getFullYear() % 100;
    const cm = now.getMonth() + 1;
    return yy > cy || (yy === cy && mm >= cm);
  }
  function validateCvv(value) { return /^\d{3,4}$/.test(value); }
  function validateHolder(value) { return /^[A-Z ]{2,}$/.test(value.trim()); }

  const [cardNumberError, setCardNumberError] = useState('');
  const [cardExpiryError, setCardExpiryError] = useState('');
  const [cardCvvError, setCardCvvError] = useState('');
  const [cardHolderError, setCardHolderError] = useState('');

  const handleCardNumberChange = (e) => {
    const val = formatCardNumber(e.target.value);
    setCardNumber(val);
    if (cardNumberError) setCardNumberError('');
  };
  const handleCardExpiryChange = (e) => {
    const val = formatExpiry(e.target.value);
    setCardExpiry(val);
    if (cardExpiryError) setCardExpiryError('');
  };
  const handleCardCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
    if (cardCvvError) setCardCvvError('');
  };
  const handleCardHolderChange = (e) => {
    const val = e.target.value.toUpperCase();
    setCardHolder(val);
    if (cardHolderError) setCardHolderError('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    // Валидация перед запросом
    let ok = true;
    if (!validateCardNumber(cardNumber)) { setCardNumberError('Некорректный номер карты'); ok = false; }
    if (!validateExpiry(cardExpiry)) { setCardExpiryError('Некорректный срок'); ok = false; }
    if (!validateCvv(cardCvv)) { setCardCvvError('Некорректный CVV'); ok = false; }
    if (!validateHolder(cardHolder)) { setCardHolderError('Только латиница, минимум 2 буквы'); ok = false; }
    if (!ok) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
  const planMap = { basic: 1, popular: 2, premium: 3 };
  const backendPlanId = planMap[selectedPlan] || 1;
  await paymentAPI.create({ plan_id: backendPlanId, payment_method: 'card' });
        await dispatch(fetchProfile());
      setSuccess(true);
    } catch {
      setError('Ошибка оплаты. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="payment-page">
      {/* header убран; кнопка Назад перенесена в форму */}

      <div className="payment-form-container">
        <div className="back-button-container" style={{ marginBottom: 8 }}>
          <button className="payment-back-button" onClick={() => navigate('/')} type="button" aria-label="Назад на главную">
            <span className="icon" aria-hidden="true">➜</span>
            <span className="label">Назад</span>
          </button>
        </div>
        {user?.subscription?.is_active && (
          <div className="active-subscription" style={{
            background: 'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#065f46',
            padding: '12px 14px',
            borderRadius: 10,
            marginBottom: 16
          }}>
            <strong>Активная подписка</strong>: {user.subscription.plan}
            {user.subscription.starts_at ? ` • с ${new Date(user.subscription.starts_at).toLocaleDateString()}` : ''}
            {user.subscription.expires_at ? ` • до ${new Date(user.subscription.expires_at).toLocaleDateString()}` : ''}
          </div>
        )}
        {user && user.email_verified === false && (
          <div style={{
            background: 'linear-gradient(180deg, rgba(253,230,138,0.2), rgba(254,215,170,0.2))',
            border: '1px solid rgba(251,191,36,0.6)',
            color: '#92400e',
            padding: '12px 14px', borderRadius: 10, marginBottom: 12
          }}>
            Чек не будет отправлен на почту, потому что email не подтверждён.
            <button
              type="button"
              onClick={async () => { try { await import('../services/api').then(m => m.authAPI.requestEmailVerify()); alert('Письмо отправлено'); } catch { alert('Не удалось отправить письмо'); } }}
              style={{ marginLeft: 8, background:'#fff7ed', border:'1px solid #f59e0b', color:'#92400e', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}
            >
              Отправить письмо для подтверждения
        </button>
          </div>
        )}
        <h2>Оформление подписки</h2>
        <div className="compact-plans">
        {Object.entries(plans).map(([key, plan]) => (
            <button
              type="button"
            key={key}
            onClick={() => handlePlanSelect(key)}
              className={`compact-plan ${selectedPlan === key ? 'selected' : ''}`}
          >
              <div className="plan-head">
                <span className="plan-name">{plan.name}</span>
                <div className="price-container">
              <span className="old-price">${plan.oldPrice}</span>
              <span className="current-price">${plan.currentPrice}</span>
                  <span className="discount-badge">-{plan.discount}</span>
            </div>
          </div>
              <div className="duration">{plan.duration}</div>
              {key === 'popular' && <span className="badge">Популярный</span>}
            </button>
          ))}
        </div>
        <form className="payment-form" onSubmit={handlePayment}>
          {/* Оставляем только форму для карты */}
              <div className="form-group">
                <label>Номер карты</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
                {cardNumberError && <span className="error-text">{cardNumberError}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Срок действия</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                  />
                  {cardExpiryError && <span className="error-text">{cardExpiryError}</span>}
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength="4"
                    required
                    value={cardCvv}
                    onChange={handleCardCvvChange}
                  />
                  {cardCvvError && <span className="error-text">{cardCvvError}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Имя владельца карты</label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  required
                  value={cardHolder}
                  onChange={handleCardHolderChange}
                />
                {cardHolderError && <span className="error-text">{cardHolderError}</span>}
              </div>
          <button type="submit" className="pay-button">
            Оплатить
          </button>
        </form>
        {loading && <p>Платеж обрабатывается...</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Платеж успешно выполнен!</p>}

        {pendingPaymentId && (
          <div className="pending-block" style={{ marginTop: 16 }}>
            <p>Ожидаем подтверждение оплаты...</p>
            <button
              type="button"
              className="pay-button"
              onClick={async () => {
                try {
                  // В текущей реализации платеж создается синхронно и помечается completed
                  await dispatch(fetchProfile());
                  setSuccess(true);
                  setPendingPaymentId(null);
                } catch {
                  setError('Не удалось обновить профиль');
                }
              }}
            >
              Проверить статус
            </button>
            {/* Синхронная оплата без статуса ожидания в текущей реализации */}
          </div>
        )}
      </div>
    </div>
  );
}
