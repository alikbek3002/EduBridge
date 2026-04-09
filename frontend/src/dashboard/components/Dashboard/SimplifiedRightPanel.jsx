import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAIRecommendations,
} from '../../../store/educationSlice';
import { fetchNotifications } from '../../../store/notificationsSlice';
import { useAuth } from '../../../shared/hooks/useAuth';
// Force style reload
import './RightPanelFix.css';
import './ForcedPanel.css';

const RightPanel = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { aiRecommendations } = useSelector((state) => state.education);
  const { notifications } = useSelector((state) => state.notifications);
  
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAIRecommendations());
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);


  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '15px',
      border: '4px solid red',
      minHeight: '100px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 10000,
      overflow: 'auto'
    }}>
      <h2 style={{ color: 'blue', marginBottom: '15px' }}>AI Панель</h2>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        marginBottom: '15px', 
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}>
        <h3>AI Рекомендации</h3>
        {aiRecommendations && aiRecommendations.length > 0 ? (
          <div>
            {aiRecommendations.map((rec, index) => (
              <div key={index} style={{ 
                backgroundColor: 'white', 
                padding: '10px', 
                margin: '5px 0', 
                borderLeft: '3px solid blue' 
              }}>
                <h4>{rec.title}</h4>
                <p>{rec.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Загрузка рекомендаций...</p>
        )}
      </div>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        marginBottom: '15px', 
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}>
        <h3>Уведомления</h3>
        {notifications && notifications.length > 0 ? (
          <div>
            {notifications.map((notification, index) => (
              <div key={index} style={{ 
                backgroundColor: 'white', 
                padding: '10px', 
                margin: '5px 0', 
                borderLeft: notification.is_read ? '3px solid gray' : '3px solid red' 
              }}>
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Нет уведомлений</p>
        )}
      </div>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        marginBottom: '15px', 
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}>
        <h3>AI Помощник</h3>
        <textarea 
          value={aiMessage}
          onChange={(e) => setAiMessage(e.target.value)}
          style={{ 
            width: '100%', 
            minHeight: '80px', 
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
          placeholder="Задайте вопрос AI-помощнику..."
        />
        <button 
          style={{ 
            backgroundColor: 'blue', 
            color: 'white', 
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={!aiMessage.trim()}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
