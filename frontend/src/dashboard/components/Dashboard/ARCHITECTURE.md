# Архитектура личного кабинета студента

## Общая структура

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD LAYOUT                        │
├─────────────────┬─────────────────────────┬─────────────────────┤
│  LEFT PANEL     │    CENTRAL CONTENT      │    RIGHT PANEL      │
│  (Navigation)   │    (Dynamic Content)    │  (AI & Deadlines)   │
├─────────────────┼─────────────────────────┼─────────────────────┤
│ • Главная       │ ┌─────────────────────┐ │ • AI-чат            │
│ • IELTS         │ │   MAIN PAGE         │ │ • Дедлайны          │
│ • TOLC          │ │   - Круглый прогресс│ │ • Рекомендации      │
│ • Университеты  │ │   - Карточки статуса│ │ • Общий прогресс    │
│ • Universitaly  │ │   - Активность      │ │                     │
│ • Codice        │ └─────────────────────┘ │                     │
│ • DOV           │                         │                     │
│ • Виза          │ ┌─────────────────────┐ │                     │
│ • Настройки     │ │   IELTS SECTION     │ │                     │
│                 │ │   - Прогресс-бар    │ │                     │
│                 │ │   - Mock-тесты      │ │                     │
│                 │ │   - Видео-уроки     │ │                     │
│                 │ │   - Практика        │ │                     │
│                 │ └─────────────────────┘ │                     │
│                 │                         │                     │
│                 │ ┌─────────────────────┐ │                     │
│                 │ │  UNIVERSITIES       │ │                     │
│                 │ │  - Поиск/фильтры    │ │                     │
│                 │ │  - Карточки вузов   │ │                     │
│                 │ │  - Цветовая         │ │                     │
│                 │ │    индикация        │ │                     │
│                 │ └─────────────────────┘ │                     │
│                 │                         │                     │
│                 │ ┌─────────────────────┐ │                     │
│                 │ │   DOCUMENTS         │ │                     │
│                 │ │   - Пошаговые планы │ │                     │
│                 │ │   - Загрузка файлов │ │                     │
│                 │ │   - Видео-инструкции│ │                     │
│                 │ └─────────────────────┘ │                     │
└─────────────────┴─────────────────────────┴─────────────────────┘
```

## Компонентная структура

```
DashboardLayout
├── LeftNavigation
│   ├── Navigation Items
│   ├── User Profile
│   └── Progress Indicators
├── CentralContent
│   ├── MainPage
│   │   ├── Overall Progress Ring
│   │   ├── Status Cards
│   │   ├── Recent Activity
│   │   └── Quick Actions
│   ├── IELTSSection
│   │   ├── Progress Bar
│   │   ├── Skills Breakdown
│   │   ├── Mock Tests
│   │   ├── Video Lessons
│   │   └── Practice
│   ├── TOLCSection
│   │   ├── Progress Bar
│   │   ├── Skills Breakdown
│   │   ├── Mock Tests
│   │   ├── Video Lessons
│   │   └── Practice
│   ├── UniversitiesSection
│   │   ├── Search & Filters
│   │   ├── University Cards
│   │   ├── Sorting Options
│   │   └── Selection Summary
│   ├── DocumentSections
│   │   ├── UniversitalySection
│   │   ├── CodiceSection
│   │   ├── DOVSection
│   │   └── VisaSection
│   └── SettingsSection
│       ├── Personal Info
│       ├── Academic Goals
│       ├── Notifications
│       └── Language
└── RightPanel
    ├── AI Chat
    │   ├── Message History
    │   ├── Input Field
    │   └── Quick Responses
    ├── Deadlines
    │   ├── Deadline Cards
    │   ├── Progress Bars
    │   └── Priority Indicators
    ├── Recommendations
    │   ├── Context Tips
    │   ├── Action Items
    │   └── Progress Tips
    └── Overall Progress
        ├── Section Progress
        ├── Completion Status
        └── Next Steps
```

## Поток данных

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  Dashboard  │    │   AI API    │
│  Actions    │───▶│   Store     │◀───│             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Components  │            │
       │            │             │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │   Google    │            │
       │            │   Sheets    │            │
       │            │   Drive     │            │
       │            └─────────────┘            │
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                   ┌─────────────┐
                   │  External   │
                   │  Services   │
                   └─────────────┘
```

## State Management

```
Zustand Store
├── User Data
│   ├── Personal Information
│   ├── Academic Goals
│   └── Preferences
├── Progress Tracking
│   ├── Overall Progress
│   ├── Section Progress
│   └── Task Completion
├── University Data
│   ├── Selected Universities
│   ├── Favorite Universities
│   └── Search Filters
├── AI Interaction
│   ├── Message History
│   ├── Context Data
│   └── Recommendations
└── Document Management
    ├── Uploaded Files
    ├── Document Status
    └── Processing Queue
```

## Интерактивные элементы

### Прогресс-бары
```
┌─────────────────────────────────────┐
│ IELTS Progress: 5.5 → 7.0          │
│ ████████████████░░░░ 75%            │
│ Reading: ████████████░░░░ 80%       │
│ Writing: ██████████░░░░░░ 60%       │
│ Listening: ████████████░░░░ 80%     │
│ Speaking: ████████░░░░░░░░ 50%      │
└─────────────────────────────────────┘
```

### AI-чат
```
┌─────────────────────────────────────┐
│ AI Помощник                         │
├─────────────────────────────────────┤
│ 🤖 Привет! Я помогу с подготовкой   │
│ 👤 Как улучшить Writing?            │
│ 🤖 Рекомендую практиковать...      │
│ 👤 [Введите сообщение...]          │
│ [Отправить]                         │
└─────────────────────────────────────┘
```

### Карточка университета
```
┌─────────────────────────────────────┐
│ University of Bologna        ❤️     │
│ Bologna, Italy                      │
│ ⭐ 4.8/5.0  🟢 Отлично подходит     │
│                                     │
│ Направление: Computer Science       │
│ Стоимость: €2000/год               │
│ IELTS: 6.5  Дедлайн: 15.03.2024    │
│                                     │
│ [Подробнее] [Выбрать]              │
└─────────────────────────────────────┘
```

## Цветовая схема

### Статусы
- 🟢 **Зеленый**: Выполнено, успех, подходит
- 🟡 **Желтый**: В процессе, внимание, частично
- 🔴 **Красный**: Просрочено, ошибка, не подходит
- ⚪ **Серый**: Неактивно, не требуется

### Функциональные цвета
- 🔵 **Синий**: Основной бренд, активные элементы
- 🟣 **Фиолетовый**: Специальные функции
- 🟠 **Оранжевый**: Предупреждения, важное

## Адаптивность

### Desktop (1200px+)
```
┌─────┬─────────────┬─────┐
│ Nav │   Content   │ AI  │
│     │             │     │
│     │             │     │
└─────┴─────────────┴─────┘
```

### Tablet (768px - 1199px)
```
┌─────────────┬─────┐
│   Content   │ AI  │
│             │     │
├─────────────┴─────┤
│       Nav         │
└───────────────────┘
```

### Mobile (< 768px)
```
┌─────────────┐
│   Content   │
├─────────────┤
│     AI      │
├─────────────┤
│     Nav     │
└─────────────┘
```

## Интеграции

### Google Sheets
- База университетов
- AI рекомендации
- Прогресс-трекинг

### Google Drive
- Хранение документов
- Синхронизация файлов
- Версионность

### AI API
- Персональные рекомендации
- Анализ прогресса
- Планирование обучения

### Внешние сервисы
- Консульства
- Образовательные платформы
- Платежные системы
