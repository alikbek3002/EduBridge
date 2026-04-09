# Настройка и запуск личного кабинета

## Установка зависимостей

```bash
# Установка Zustand для state management
npm install zustand

# Установка дополнительных иконок
npm install @tabler/icons-react

# Установка Mantine компонентов (если не установлены)
npm install @mantine/core @mantine/hooks @mantine/notifications
```

## Структура файлов

```
frontend/src/components/Dashboard/
├── DashboardLayout.jsx          # Основной компонент
├── LeftNavigation.jsx           # Левая панель навигации
├── CentralContent.jsx           # Центральная зона
├── RightPanel.jsx               # Правая панель AI
├── Dashboard.css                # Стили
├── README.md                    # Документация
├── ARCHITECTURE.md              # Архитектура
├── SETUP.md                     # Инструкции по настройке
└── sections/                    # Секции личного кабинета
    ├── MainPage.jsx
    ├── IELTSSection.jsx
    ├── TOLCSection.jsx
    ├── UniversitiesSection.jsx
    ├── UniversitalySection.jsx
    ├── CodiceSection.jsx
    ├── DOVSection.jsx
    ├── VisaSection.jsx
    └── SettingsSection.jsx

frontend/src/store/
└── dashboardStore.js            # Zustand store

frontend/src/pages/
└── DashboardPage.jsx            # Страница Dashboard
```

## Интеграция в App.jsx

```jsx
import DashboardPage from './pages/DashboardPage';

// Добавить маршрут в Routes
<Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
```

## Настройка Mantine

```jsx
// В main.jsx
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
```

## Использование компонентов

### Базовое использование

```jsx
import DashboardLayout from './components/Dashboard/DashboardLayout';

function App() {
  return <DashboardLayout />;
}
```

### С кастомными данными

```jsx
import { useDashboardStore } from './store/dashboardStore';

function CustomDashboard() {
  const { updateProgress, setActiveSection } = useDashboardStore();
  
  // Обновление прогресса
  updateProgress('ielts', 80);
  
  // Смена активной секции
  setActiveSection('universities');
  
  return <DashboardLayout />;
}
```

## Кастомизация

### Изменение цветовой схемы

```css
/* В Dashboard.css */
:root {
  --primary-color: #your-color;
  --success-color: #your-color;
  --warning-color: #your-color;
  --error-color: #your-color;
}
```

### Добавление новых секций

1. Создайте компонент в `sections/`
2. Добавьте в `CentralContent.jsx`
3. Обновите `LeftNavigation.jsx`
4. Добавьте в `dashboardStore.js`

### Настройка AI интеграции

```jsx
// В RightPanel.jsx
const handleSendMessage = async (message) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context: activeSection })
  });
  const data = await response.json();
  addAIResponse(data.response);
};
```

## Тестирование

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для продакшена

```bash
npm run build
```

### Линтинг

```bash
npm run lint
```

## Производительность

### Оптимизация изображений

- Используйте WebP формат
- Ленивая загрузка для больших изображений
- Оптимизация размеров

### Кэширование

```jsx
// Мемоизация компонентов
const MemoizedSection = React.memo(SectionComponent);

// Кэширование данных
const { data } = useQuery('universities', fetchUniversities, {
  staleTime: 5 * 60 * 1000, // 5 минут
});
```

## Безопасность

### Валидация данных

```jsx
// Валидация загружаемых файлов
const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Неподдерживаемый формат файла');
  }
  
  if (file.size > maxSize) {
    throw new Error('Файл слишком большой');
  }
};
```

### Санитизация ввода

```jsx
// Очистка пользовательского ввода
const sanitizeInput = (input) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

## Мониторинг

### Аналитика

```jsx
// Отслеживание действий пользователя
const trackUserAction = (action, section) => {
  analytics.track('user_action', {
    action,
    section,
    timestamp: new Date().toISOString()
  });
};
```

### Ошибки

```jsx
// Обработка ошибок
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Dashboard Error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return <ErrorFallback />;
  }
  
  return children;
};
```

## Развертывание

### Environment Variables

```env
REACT_APP_API_URL=https://api.yourapp.com
REACT_APP_GOOGLE_SHEETS_ID=your-sheets-id
REACT_APP_AI_API_KEY=your-ai-key
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Поддержка

### Логирование

```jsx
// Настройка логгера
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data)
};
```

### Отладка

```jsx
// Redux DevTools для Zustand
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      // store implementation
    }),
    { name: 'dashboard-store' }
  )
);
```

## Дополнительные ресурсы

- [Mantine Documentation](https://mantine.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
