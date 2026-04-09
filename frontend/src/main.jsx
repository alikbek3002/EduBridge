import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import App from './App.jsx'
import './index.css'
import ThemeProvider from './shared/components/Theme/ThemeProvider.jsx'

// Очистка всех кэшей и service workers
const clearAllCaches = async () => {
  // Удаление service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }

  // Очистка Cache Storage API
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }

  // Очистка кэшированных API запросов из localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('api_cache_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Запускаем очистку кэшей при загрузке
clearAllCaches().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider>
        <DatesProvider settings={{ firstDayOfWeek: 1 }}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </DatesProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
)
