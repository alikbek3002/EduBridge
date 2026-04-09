import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { IconRobot } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { updateProfileComplete, updateProfile, fetchProfile } from '../../../store/authSlice';
import { educationAPI } from '../../../shared/services/api';
import {
  Box,
  Container,
  Paper,
  Button,
  Group,
  Text,
  Title,
  Stack,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  FileInput,
  Progress,
  Alert,
  Grid,
  Card,
  Badge,
  Divider,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Radio,
  SimpleGrid,
  ThemeIcon,
  Avatar,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import styles from './UserProfileForm.module.css';
import GeographyStep from './GeographyStep';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconCamera,
  IconBook,
  IconBriefcase,
  IconTarget,
  IconLanguage,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconX,
  IconPlus,
  IconCertificate,
  IconSchool,
  IconMap,
  IconAlertCircle,
  IconUpload,
  IconFile,
} from '@tabler/icons-react';

const PHONE_RULES = {
  '+996': { country: 'РљС‹СЂРіС‹Р·СЃС‚Р°РЅ', flag: 'рџ‡°рџ‡¬', length: 9, example: '555123456' },
  '+7': { country: 'РљР°Р·Р°С…СЃС‚Р°РЅ', flag: ' рџ‡°рџ‡ї', length: 10, example: '7012345678' },
  '+998': { country: 'РЈР·Р±РµРєРёСЃС‚Р°РЅ', flag: ' рџ‡єрџ‡ї', length: 9, example: '901234567' },
  '+992': { country: 'РўР°РґР¶РёРєРёСЃС‚Р°РЅ', flag: ' рџ‡№рџ‡Ї', length: 9, example: '921234567' },
};

const UserProfileForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Normalize helpers to keep UI components stable
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val == null) return [];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return val ? [val] : [];
      } catch {
        return val ? [val] : [];
      }
    }
    return [];
  };

  const toObject = (val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }
    return {};
  };
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Личные данные
  first_name: '',
  last_name: '',
    phone_code: '+7',
    phone_local: '',
    date_of_birth: null,
    country: '',
    city: '',
    avatar: null,
    
    // Образование и опыт
  education_level: '',
    bio: '',
    education_background: '',
    work_experience: '',
    
    // Интересы и цели
    interests: '',
    goals: [],
    
    // Языковые навыки
    language_levels: {},
    
	// География обучения
	preferred_countries: [],
    
    // Внутренние поля для сертификатов
    exams: {
      ielts: { status: 'no', date: '', score: '', target: '', file: null },
      toefl: { status: 'no', date: '', score: '', file: null },
      tolc: { status: 'no', date: '', score: '', target: '', file: null },
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для добавления языков
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageLevel, setNewLanguageLevel] = useState('');

  // Превью аватара
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Refs для фокуса/скролла к полям
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const dateOfBirthRef = useRef(null);
  const phoneLocalRef = useRef(null);
  const countryRef = useRef(null);
  const cityRef = useRef(null);
  const educationLevelRef = useRef(null);
  const interestsRef = useRef(null);
  const goalsRef = useRef(null);
  const preferredCountriesRef = useRef(null);
  const examsRef = useRef(null);
  const refs = useMemo(() => ({
    first_name: firstNameRef,
    last_name: lastNameRef,
    date_of_birth: dateOfBirthRef,
    phone_local: phoneLocalRef,
    country: countryRef,
    city: cityRef,
    education_level: educationLevelRef,
    interests: interestsRef,
    goals: goalsRef,
    preferred_countries: preferredCountriesRef,
    exams: examsRef,
  }), []);

  useEffect(() => {
    // Ревок URL при смене аватара
    return () => {
      try {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      } catch {
        /* ignore revoke error */
      }
    };
  }, [avatarPreview]);

  // Черновик анкеты (autosave)
  const draftKey = useMemo(() => (user?.id ? `onboarding_draft_${user.id}` : 'onboarding_draft_guest'), [user?.id]);

  useEffect(() => {
    // Загрузка черновика, если есть
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && typeof draft === 'object') {
          if (draft.formData && typeof draft.formData === 'object') {
            setFormData((prev) => ({ ...prev, ...draft.formData }));
          }
          if (typeof draft.activeStep === 'number') {
            setActiveStep(draft.activeStep);
          }
        }
      }
    } catch {
      /* ignore draft load error */
    }
  }, [draftKey]);

  useEffect(() => {
    // Автосохранение с легкой задержкой
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ formData, activeStep, savedAt: new Date().toISOString() }));
      } catch {
        /* ignore draft autosave error */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [formData, activeStep, draftKey]);

  // Проверяем, заполнен ли профиль
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Загружаем актуальные данные пользователя
        await dispatch(fetchProfile());
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.profile?.onboarding_completed) {
        navigate('/app/dashboard', { replace: true });
        return;
      }
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_code: '+7',
        phone_local: '',
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : null,
        country: user.country || '',
        city: user.city || '',
        bio: user.profile?.bio || '',
        education_background: user.profile?.education_background || '',
        work_experience: user.profile?.work_experience || '',
        interests: Array.isArray(user.profile?.interests) ? user.profile.interests[0] || '' : user.profile?.interests || '',
        goals: toArray(user.profile?.goals),
        language_levels: toObject(user.profile?.language_levels),
        preferred_countries: toArray(user.profile?.preferred_countries),
        exams: {
          ...prev.exams,
          ielts: {
            ...prev.exams.ielts,
            score: user.profile?.ielts_current_score != null ? String(user.profile.ielts_current_score) : prev.exams.ielts.score,
            target: user.profile?.ielts_target_score != null ? String(user.profile.ielts_target_score) : prev.exams.ielts.target,
            date: user.profile?.ielts_exam_date || prev.exams.ielts.date,
          },
          tolc: {
            ...prev.exams.tolc,
            score: user.profile?.tolc_current_score != null ? String(user.profile.tolc_current_score) : prev.exams.tolc.score,
            target: user.profile?.tolc_target_score != null ? String(user.profile.tolc_target_score) : prev.exams.tolc.target,
            date: user.profile?.tolc_exam_date || prev.exams.tolc.date,
          },
        },
      }));
    }
  }, [user, navigate]);

  const steps = [
    { title: 'Личные данные', icon: IconUser },
    { title: 'Образование', icon: IconBook },
    { title: 'Сертификаты', icon: IconCertificate },
    { title: 'География', icon: IconMap },
    { title: 'Желаемая специальность', icon: IconTarget },
    { title: 'Завершение', icon: IconCheck },
  ];

  // Список телефонных кодов с флагами (только нужные страны)
  const phoneCodes = Object.entries(PHONE_RULES).map(([code, info]) => ({
    value: code,
    label: `${info.flag} ${code}`,
  }));

  const getPhoneMaxLen = useCallback((code) => PHONE_RULES[code]?.length ?? 12, []);
  const getPhoneExample = useCallback((code) => PHONE_RULES[code]?.example ?? '', []);

  const scrollToFirstError = useCallback((errs) => {
    const firstKey = Object.keys(errs || {}).find((key) => errs[key]);
    if (!firstKey) return;

    const el = refs[firstKey]?.current || (firstKey === 'exams' ? refs.exams.current : null);
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el?.focus) el.focus();
  }, [refs]);

  const interests = [
    'Программирование', 'Дизайн', 'Бизнес', 'Медицина', 'Инженерия', 'Архитектура',
    'Психология', 'Лингвистика', 'История', 'Философия', 'Математика', 'Физика',
    'Химия', 'Биология', 'Экономика', 'Право', 'Журналистика', 'Искусство',
    'Музыка', 'Спорт', 'Кулинария', 'Мода', 'Путешествия', 'Фотография'
  ];

  const goals = [
    'Получить степень бакалавра', 'Получить степень магистра', 'Получить PhD',
    'Изучить новый язык', 'Сменить профессию', 'Повысить квалификацию',
    'Найти работу за рубежом', 'Иммигрировать', 'Расширить кругозор',
    'Познакомиться с новой культурой', 'Развить лидерские качества'
  ];

  const languages = [
    'Английский', 'Итальянский', 'Немецкий', 'Французский', 'Испанский',
    'Португальский', 'Голландский', 'Шведский', 'Норвежский', 'Датский',
    'Финский', 'Польский', 'Чешский', 'Венгерский', 'Японский', 'Корейский',
    'Китайский', 'Арабский', 'Русский', 'Украинский'
  ];

  const languageLevels = [
    { value: 'A1', label: 'A1 - Начальный' },
    { value: 'A2', label: 'A2 - Элементарный' },
    { value: 'B1', label: 'B1 - Средний' },
    { value: 'B2', label: 'B2 - Выше среднего' },
    { value: 'C1', label: 'C1 - Продвинутый' },
    { value: 'C2', label: 'C2 - Владение' },
    { value: 'native', label: 'Родной язык' }
  ];

  // География — справочники
  const residenceCountries = [
    'Казахстан','Кыргызстан','Узбекистан','Таджикистан','Россия','Украина','Беларусь','Армения','Азербайджан','Грузия',
    'Италия','Германия','Франция','Испания','Польша','Чехия','Нидерланды','Швеция','Норвегия','Дания','Финляндия','Австрия','Швейцария',
    'Великобритания','Ирландия','США','Канада','Турция','ОАЭ'
  ];

  // Валидация по шагу без побочных эффектов
  const getStepErrors = useCallback((step) => {
    const newErrors = {};
    switch (step) {
      case 0: {
        if (!formData.first_name?.trim()) newErrors.first_name = 'Имя обязательно';
        if (!formData.last_name?.trim()) newErrors.last_name = 'Фамилия обязательна';
        // Улучшенная валидация номера
        const code = formData.phone_code;
        const phone = String(formData.phone_local || '').replace(/\D/g, '');
        const allowedCodes = Object.keys(PHONE_RULES);
        if (!allowedCodes.includes(code)) {
          newErrors.phone_local = 'Выберите корректный код страны';
        } else if (!phone) {
          newErrors.phone_local = 'Телефон обязателен';
        } else {
          const required = getPhoneMaxLen(code);
          if (phone.length !== required) {
            newErrors.phone_local = `Номер должен содержать ${required} цифр`;
          }
        }
        if (!formData.country || !String(formData.country).trim()) newErrors.country = 'Страна проживания обязательна';
        if (!formData.city || !String(formData.city).trim()) newErrors.city = 'Город обязателен';
        break;
      }
      case 1:
        if (!formData.education_level) newErrors.education_level = 'Выберите уровень образования';
        break;
      case 2:
        if (!formData.exams?.ielts?.status || !formData.exams?.toefl?.status || !formData.exams?.tolc?.status) {
          newErrors.exams = 'Выберите статус по каждому экзамену (IELTS, TOEFL, TOLC)';
        }
        break;
      case 3:
        if (!formData.city || !String(formData.city).trim()) newErrors.city = 'Выберите город обучения';
        if (!formData.university || !String(formData.university).trim()) newErrors.university = 'Выберите университет';
        break;
      case 4:
        if (!formData.interests || !String(formData.interests).trim()) newErrors.interests = 'Выберите специальность';
        if ((formData.goals || []).length === 0) newErrors.goals = 'Выберите хотя бы одну цель';
        break;
    }
    return newErrors;
  }, [formData, getPhoneMaxLen]);

  // Клавиатурная навигация: Alt+←/→ для переключения шагов
  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeStep < steps.length - 1) {
          const errs = getStepErrors(activeStep);
          if (Object.keys(errs).length === 0) {
            setActiveStep((step) => step + 1);
          } else {
            setErrors(errs);
            scrollToFirstError(errs);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeStep > 0) {
          setActiveStep((step) => step - 1);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeStep, getStepErrors, scrollToFirstError, steps.length]);

  const onAvatarChange = (file) => {
    if (!file) {
      handleInputChange('avatar', null);
      setAvatarPreview(null);
      return;
    }
    const MAX_MB = 4;
    if (!file.type.startsWith('image/')) {
      setErrors((prev)=>({ ...prev, avatar: 'Только изображения (JPEG/PNG)' }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((prev)=>({ ...prev, avatar: `Размер файла не более ${MAX_MB} МБ` }));
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      handleInputChange('avatar', file);
      if (errors.avatar) setErrors((prev)=>({ ...prev, avatar: null }));
    } catch {
      /* ignore avatar preview error */
    }
  };

  const onExamFileChange = (examKey, file) => {
    const fieldKey = `${examKey}_file`;
    if (!file) {
      setFormData(prev=>({...prev, exams:{...prev.exams,[examKey]:{...prev.exams[examKey], file: null}}}));
      setErrors((prev)=>({ ...prev, [fieldKey]: null }));
      return;
    }
    const MAX_MB = 10;
    if (file.type !== 'application/pdf') {
      setErrors((prev)=>({ ...prev, [fieldKey]: 'Только PDF' }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((prev)=>({ ...prev, [fieldKey]: `Размер файла не более ${MAX_MB} МБ` }));
      return;
    }
    setFormData(prev=>({...prev, exams:{...prev.exams,[examKey]:{...prev.exams[examKey], file}}}));
    setErrors((prev)=>({ ...prev, [fieldKey]: null }));
  };

  const handlePrev = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Проверяем ошибки на всех шагах
      let firstErrorStep = null;
      let stepErrors = {};
      for (let i = 0; i < steps.length; i++) {
        const errs = getStepErrors(i);
        if (Object.keys(errs).length > 0 && firstErrorStep === null) {
          firstErrorStep = i;
          stepErrors = errs;
        }
      }
      if (firstErrorStep !== null) {
        setActiveStep(firstErrorStep);
        setErrors(stepErrors);
        setIsSubmitting(false);
        scrollToFirstError(stepErrors);
        return;
      }
      // Сначала обновим имя/фамилию при необходимости
      const baseUpdate = {};
      if (formData.first_name && formData.first_name !== (user?.first_name || '')) baseUpdate.first_name = formData.first_name;
      if (formData.last_name && formData.last_name !== (user?.last_name || '')) baseUpdate.last_name = formData.last_name;
      if (Object.keys(baseUpdate).length > 0) {
        await dispatch(updateProfile(baseUpdate));
      }

      // Маппинг полей в формат backend
      const payload = {
        phone: `${formData.phone_code} ${formData.phone_local}`.trim(),
        date_of_birth: formData.date_of_birth instanceof Date ? formData.date_of_birth.toISOString().slice(0,10) : formData.date_of_birth,
        country: formData.country,
        city: formData.city,
        avatar: formData.avatar,
        bio: formData.bio,
        education_background: formData.education_level || formData.education_background,
        work_experience: formData.work_experience,
        interests: formData.interests,
        goals: formData.goals,
        language_levels: formData.language_levels,
        preferred_countries: formData.preferred_countries,
  onboarding_completed: true,
  // Передаем результаты экзаменов, если есть
  exams: {
    ielts: {
      status: formData.exams.ielts.status,
      date: formData.exams.ielts.date,
      score: formData.exams.ielts.score,
      target: formData.exams.ielts.target,
    },
    toefl: formData.exams.toefl,
    tolc: {
      status: formData.exams.tolc.status,
      date: formData.exams.tolc.date,
      score: formData.exams.tolc.score,
      target: formData.exams.tolc.target,
    },
  }
      };

      const result = await dispatch(updateProfileComplete(payload)).unwrap();

      // Upload attached exam certificates (IELTS/TOLC) to Documents so they show up in sections
      const uploads = [];
      const ieltsFile = formData?.exams?.ielts?.file;
      if (ieltsFile) {
        uploads.push(
          educationAPI.uploadDocument({
            file: ieltsFile,
            name: 'IELTS Certificate',
            description: 'Uploaded during onboarding',
          })
        );
      }
      const tolcFile = formData?.exams?.tolc?.file;
      if (tolcFile) {
        uploads.push(
          educationAPI.uploadDocument({
            file: tolcFile,
            name: 'TOLC Certificate',
            description: 'Uploaded during onboarding',
          })
        );
      }
      if (uploads.length) {
        try {
          await Promise.allSettled(uploads);
        } catch (e) {
          // Swallow errors to not block onboarding; they can re-upload in sections
          console.error('Certificate upload during onboarding failed', e);
        }
      }
      
      // Show success notification
      showNotification({
        title: 'Успешно',
        message: 'Профиль успешно обновлен',
        color: 'green',
      });

	  // Удаляем черновик и переходим в кабинет, затем обновляем профиль в фоне
	  try { localStorage.removeItem(draftKey); } catch {
		/* ignore draft remove error */
	  }
  
      const refreshedUser = await dispatch(fetchProfile()).unwrap().catch(() => null);
      const nextUser = refreshedUser || result?.user || null;

      if (nextUser?.profile?.onboarding_completed === true) {
        navigate('/app/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Если сервер вернул ошибки по полям — отобразим их
      const details = error?.details || error;
      if (details && typeof details === 'object' && !Array.isArray(details)) {
        const serverErrors = {};
        const mapKey = (k) => ({
          ielts_exam_date: 'exams',
          ielts_current_score: 'exams',
          ielts_target_score: 'exams',
          tolc_current_score: 'exams',
          tolc_target_score: 'exams',
          tolc_exam_date: 'exams',
        }[k] || k);
        Object.entries(details).forEach(([key, val]) => {
          const uiKey = mapKey(key);
          if (typeof val === 'string') serverErrors[uiKey] = val;
          else if (Array.isArray(val)) serverErrors[uiKey] = val.join(', ');
          else if (typeof val === 'object') serverErrors[uiKey] = Object.values(val).flat().join(', ');
        });
        setErrors((prev)=>({ ...prev, ...serverErrors }));
      }
      // Show error notification
      showNotification({
        title: 'Ошибка',
        message: 'Ошибка при обновлении профиля. Пожалуйста, проверьте введенные данные.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addLanguage = () => {
    if (newLanguage && newLanguageLevel) {
      setFormData(prev => ({
        ...prev,
        language_levels: {
          ...prev.language_levels,
          [newLanguage]: newLanguageLevel
        }
      }));
      setNewLanguage('');
      setNewLanguageLevel('');
    }
  };

  const removeLanguage = (language) => {
    const newLanguageLevels = { ...formData.language_levels };
    delete newLanguageLevels[language];
    setFormData(prev => ({
      ...prev,
      language_levels: newLanguageLevels
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
  case 0: // Личные данные
        return (
          <Stack spacing="md">
            <DateInput
              label="Дата рождения"
              placeholder="Выберите дату"
              value={formData.date_of_birth}
              onChange={(value) => handleInputChange('date_of_birth', value)}
              icon={<IconCalendar size={16} />}
            />
            <TextInput
              label="Город"
              placeholder="Введите город"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              error={errors.city}
            />
            <FileInput
              label="Фото профиля"
              placeholder="Выберите фото"
              accept="image/*"
              value={formData.avatar}
              onChange={onAvatarChange}
              icon={<IconCamera size={16} />}
              error={errors.avatar}
            />
            {avatarPreview && (
              <Avatar src={avatarPreview} alt="Avatar Preview" size={100} radius="md" mt="md" />
            )}
          </Stack>
        );

      case 1: // Образование
        return (
          <Stack spacing="md" className={styles.slideIn}>
            <Title order={3}>Образование</Title>
            <Select
              label="Уровень образования"
              placeholder="Выберите уровень"
              data={["9 класс", "10 класс", "11 класс", "12 класс", "Колледж", "1 курс университета", "2 курс университета", "3 курс университета", "4 курс университета", "5 курс университета", "Магистратура", "Аспирантура", "Докторантура"]}
              value={formData.education_level}
              onChange={(v)=>handleInputChange('education_level', v)}
              error={errors.education_level}
              searchable
              clearable
              description="Укажите ваш текущий или последний завершённый уровень образования"
            />
            <TextInput
              label="Учебное заведение"
              placeholder="Название школы, колледжа или университета"
              value={formData.education_background}
              onChange={(e)=>handleInputChange('education_background', e.target.value)}
              description="Например: КГТУ им. И. Раззакова, Лицей №61, Nazarbayev University"
            />
            {formData.education_level && formData.education_level.toLowerCase().includes('университет') && (
              <TextInput
                label="Факультет / специальность"
                placeholder="Например: Computer Science, Экономика, Медицина"
                value={formData.specialty || ''}
                onChange={(e)=>handleInputChange('specialty', e.target.value)}
                description="Укажите вашу специальность или факультет"
              />
            )}
            <Divider label="Дополнительно (необязательно)" />
            <Textarea label="О себе" placeholder="Расскажите немного о себе..." value={formData.bio} onChange={(e)=>handleInputChange('bio', e.target.value)} minRows={3} />
            <Textarea label="Опыт работы" placeholder="Опишите ваш профессиональный опыт..." value={formData.work_experience} onChange={(e)=>handleInputChange('work_experience', e.target.value)} minRows={3} />
          </Stack>
        );

      case 2: // Сертификаты + языки
        return (
          <Stack spacing="xl" className={styles.slideIn}>
            <Box ref={refs.exams}>
              <Title order={2} mb="md">Языковые сертификаты</Title>
              <Text c="dimmed" size="sm" mb="xl">
                Укажите информацию о ваших языковых сертификатах. Загрузите PDF-файлы для подтверждения.
              </Text>
            </Box>

            <div className={styles.certificatesGrid}>
              {[
                {
                  key: 'ielts',
                  name: 'IELTS',
                  fullName: 'International English Language Testing System',
                  description: 'Международная система оценки знания английского языка',
                  maxScore: '9.0',
                  hasTarget: true
                },
                {
                  key: 'toefl',
                  name: 'TOEFL',
                  fullName: 'Test of English as a Foreign Language',
                  description: 'Тест английского языка как иностранного',
                  maxScore: '120',
                  hasTarget: false
                },
                {
                  key: 'tolc',
                  name: 'TOLC',
                  fullName: 'Test OnLine CISIA',
                  description: 'Онлайн-тест для поступления в итальянские вузы',
                  maxScore: '50',
                  hasTarget: true
                }
              ].map((exam) => {
                const examData = formData.exams[exam.key];
                const hasFile = examData?.file;
                const hasError = errors[`${exam.key}_file`];
                const isCompleted = examData?.status === 'have' && examData?.score && hasFile;
                
                return (
                  <div 
                    key={exam.key}
                    className={`${styles.examCard} ${isCompleted ? styles.completed : ''} ${hasError ? styles.hasError : ''}`}
                  >
                    <div className={styles.examHeader}>
                      <div className={styles.examTitle}>
                        <div className={styles.examIcon}>
                          {exam.name}
                        </div>
                        <div>
                          <h3 className={styles.examName}>{exam.fullName}</h3>
                          <p className={styles.examDescription}>{exam.description}</p>
                        </div>
                      </div>
                      <div className={`${styles.examStatus} ${
                        isCompleted ? styles.completed : 
                        hasError ? styles.error : 
                        styles.pending
                      }`}>
                        {isCompleted ? (
                          <>
                            <IconCheck size={12} />
                            Завершено
                          </>
                        ) : hasError ? (
                          <>
                            <IconAlertCircle size={12} />
                            Ошибка
                          </>
                        ) : (
                          <>
                            <IconAlertCircle size={12} />
                            В процессе
                          </>
                        )}
                      </div>
                    </div>

                    <div className={styles.examFields}>
                      <div className={styles.examField}>
                        <label>Статус</label>
                        <select
                          value={examData?.status || 'no'}
                          onChange={(e) => {
                            setFormData(prev => {
                              const next = { ...prev, exams: { ...prev.exams, [exam.key]: { ...prev.exams[exam.key], status: e.target.value } } };
                              const hasAll = ['ielts','toefl','tolc'].every(k => next.exams?.[k]?.status);
                              if (hasAll && errors.exams) setErrors((p) => ({ ...p, exams: null }));
                              return next;
                            });
                          }}
                        >
                          <option value="passed">Сдавал экзамен</option>
                          <option value="no">Не сдавал</option>
                        </select>
                      </div>

                      <div className={styles.examField}>
                        {examData?.status === 'passed' && (
                          <>
                            <label>Дата сдачи</label>
                            <input
                              type="text"
                              placeholder="YYYY-MM"
                              value={examData?.date || ''}
                              onChange={(e) => {
                                const val = (e.target.value || '').toUpperCase();
                                const cleaned = val.replace(/[^0-9-]/g,'').slice(0,7);
                                const normalized = cleaned.length > 4 && cleaned[4] !== '-' ? cleaned.slice(0,4) + '-' + cleaned.slice(4,6) : cleaned;
                                setFormData(prev => ({...prev, exams: {...prev.exams, [exam.key]: {...prev.exams[exam.key], date: normalized}}}));
                              }}
                            />
                          </>
                        )}
                      </div>

                      <div className={styles.examField}>
                        {examData?.status === 'passed' && (
                          <>
                            <label>Текущий балл</label>
                            <input
                              type="text"
                              placeholder={`Макс. ${exam.maxScore}`}
                              value={examData?.score || ''}
                              onChange={(e) => {
                                const raw = e.target.value || '';
                                const cleaned = raw.replace(/[^0-9.,]/g,'').replace(',','.');
                                const parts = cleaned.split('.');
                                const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                                setFormData(prev => ({...prev, exams: {...prev.exams, [exam.key]: {...prev.exams[exam.key], score: normalized}}}));
                              }}
                            />
                          </>
                        )}
                      </div>

                      {exam.hasTarget && (
                        <div className={styles.examField}>
                          <label>Целевой балл</label>
                          <input
                            type="text"
                            placeholder={exam.key === 'ielts' ? 'Напр. 7.0' : 'Напр. 40'}
                            value={examData?.target || ''}
                            onChange={(e) => {
                        const raw = e.target.value || '';
                        const cleaned = raw.replace(/[^0-9.,]/g,'').replace(',','.');
                        const parts = cleaned.split('.');
                        const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                              setFormData(prev => ({...prev, exams: {...prev.exams, [exam.key]: {...prev.exams[exam.key], target: normalized}}}));
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {examData?.score && exam.hasTarget && examData?.target && (
                      <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>
                          <span>Прогресс к цели</span>
                          <span>{examData.score} / {examData.target}</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ 
                              width: `${Math.min(100, (parseFloat(examData.score) / parseFloat(examData.target)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div 
                      className={`${styles.fileUploadZone} ${hasFile ? styles.hasFile : ''} ${hasError ? styles.hasError : ''}`}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/pdf';
                        input.onchange = (e) => onExamFileChange(exam.key, e.target.files[0]);
                        input.click();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add(styles.dragOver);
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove(styles.dragOver);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(styles.dragOver);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === 'application/pdf') {
                          onExamFileChange(exam.key, file);
                        }
                      }}
                    >
                      <div className={styles.uploadIcon}>
                        {hasFile ? <IconCheck size={20} /> : <IconUpload size={20} />}
                      </div>
                      <div className={styles.uploadText}>
                        {hasFile ? 'Файл загружен' : 'Нажмите или перетащите PDF'}
                      </div>
                      <div className={styles.uploadHint}>
                        Поддерживается только PDF, до 10 МБ
                      </div>

                      {hasFile && (
                        <div className={styles.filePreview} onClick={(e) => e.stopPropagation()}>
                          <div className={styles.fileIcon}>
                            <IconFile size={16} />
                          </div>
                          <div className={styles.fileInfo}>
                            <div className={styles.fileName}>{hasFile.name}</div>
                            <div className={styles.fileSize}>
                              {(hasFile.size / 1024 / 1024).toFixed(1)} МБ
                            </div>
                          </div>
                          <button 
                            className={styles.removeFileBtn}
                            onClick={() => onExamFileChange(exam.key, null)}
                            type="button"
                          >
                      <IconX size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {hasError && (
                      <Alert color="red" size="sm" mt="sm">
                        {errors[`${exam.key}_file`]}
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.languageSection}>
              <Title order={3} mb="md">Уровень владения языками</Title>
              <Text c="dimmed" size="sm" mb="lg">
                Укажите ваш уровень владения различными языками
              </Text>

              <div className={styles.languageGrid}>
                {Object.entries(formData.language_levels).map(([language, level]) => (
                  <div key={language} className={styles.languageCard}>
                    <div className={styles.languageHeader}>
                      <span className={styles.languageName}>{language}</span>
                      <span className={styles.languageLevel}>{level}</span>
                    </div>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      leftSection={<IconX size={12} />}
                      onClick={() => removeLanguage(language)}
                      fullWidth
                      mt="sm"
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>

              <div className={styles.addLanguageForm}>
                <Select 
                  label="Язык" 
                  placeholder="Выберите язык" 
                  data={languages.filter(lang => !formData.language_levels[lang])} 
                  value={newLanguage} 
                  onChange={setNewLanguage} 
                  searchable 
                />
                <Select 
                  label="Уровень" 
                  placeholder="Выберите уровень" 
                  data={languageLevels} 
                  value={newLanguageLevel} 
                  onChange={setNewLanguageLevel} 
                />
                <Button 
                  onClick={addLanguage} 
                  disabled={!newLanguage || !newLanguageLevel}
                  leftSection={<IconPlus size={16} />}
                >
                  Добавить
                </Button>
              </div>

              {errors.language_levels && (
                <Alert color="red" mt="md">
                  {errors.language_levels}
                </Alert>
              )}
            </div>
          </Stack>
        );

      case 3: {
        // Используем отдельный компонент GeographyStep
        // Передаем значения и обработчик для обновления formData
        const handleGeographyChange = ({ city, university }) => {
          handleInputChange('city', city);
          handleInputChange('university', university);
        };
        return (
          <div className={styles.slideIn}>
            <GeographyStep
              value={{ city: formData.city, university: formData.university }}
              onChange={handleGeographyChange}
              error={errors.city || errors.university}
            />
          </div>
        );
      }

      case 4: // Желаемая специальность
        return (
          <Stack spacing="md" className={styles.slideIn}>
            <Select
              label="Желаемая специальность"
              placeholder="Выберите специальность"
              data={interests}
              value={formData.interests}
              onChange={(value) => handleInputChange('interests', value)}
              error={errors.interests}
              searchable
              ref={refs.interests}
            />
            
            <MultiSelect
              label="Цели"
              placeholder="Выберите ваши цели"
              data={goals}
              value={Array.isArray(formData.goals) ? formData.goals : toArray(formData.goals)}
              onChange={(value) => handleInputChange('goals', Array.isArray(value) ? value : toArray(value))}
              searchable
              error={errors.goals}
              ref={refs.goals}
            />
          </Stack>
        );

      case 5: // Завершение
        return (
          <Stack spacing="md" className={styles.slideIn}>
            <Alert color="green" icon={<IconCheck size={16} />}>
              Проверьте введенные данные и нажмите "Завершить" для сохранения профиля.
            </Alert>
            
            <Card withBorder p="md">
              <Text weight={500} mb="md">Сводка профиля</Text>
              <Stack spacing="xs">
                <Text size="sm"><strong>Телефон:</strong> {`${formData.phone_code} ${formData.phone_local}`.trim() || 'Не указан'}</Text>
                <Text size="sm"><strong>Страна/город:</strong> {formData.country || '—'}{formData.city ? `, ${formData.city}` : ''}</Text>
                <Text size="sm"><strong>Университет:</strong> {formData.university || 'Не выбран'}</Text>
                <Text size="sm"><strong>Желаемая специальность:</strong> {formData.interests || 'Не указана'}</Text>
                <Text size="sm"><strong>Цели:</strong> {formData.goals.join(', ') || 'Не указаны'}</Text>
                <Text size="sm"><strong>Языки:</strong> {Object.keys(formData.language_levels).length} языков</Text>
                
              </Stack>
            </Card>
          </Stack>
        );

      default:
        return null;
    }
  };

  // Подсказки AI
  const stepHints = useMemo(() => {
    switch (activeStep) {
      case 0:
        return ['Заполните личные данные: имя, фамилию, дату рождения, телефон и город.'];
      case 1:
        return ['Выберите ваш уровень образования и укажите учебное заведение. Если вы студент университета — добавьте специальность.'];
      case 2:
        return ['Укажите статусы по экзаменам (IELTS, TOEFL, TOLC) и загрузите сертификаты, если они есть. Добавьте языки и уровень владения.'];
      case 3:
        return ['Выберите направления и цели обучения, чтобы мы могли подобрать подходящие программы.'];
      case 4:
        return ['Выберите город и университеты, где хотите учиться.'];
      case 5:
        return ['Укажите бюджет и продолжительность обучения для более точного подбора программ.'];
      case 6:
        return ['Проверьте все данные и завершите заполнение анкеты.'];
      default:
        return [];
    }
  }, [activeStep]);

  const pct = Math.round(((activeStep + 1) / steps.length) * 100);




  // Показываем загрузку пока данные не загружены
  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Text>Загрузка данных профиля...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" className={styles.formRoot}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Grid gutter="xl">
          {/* Левое меню шагов */}
          <Grid.Col span={2}>
            <Paper withBorder radius="md" p="md" className={styles.leftMenu} style={{ paddingTop: 14 }}>
              <Stack>
                {steps.map((s, idx) => {
                  const invalid = Object.keys(getStepErrors(idx)).length > 0;
                  const stateClass = (
                    idx === activeStep
                      ? (invalid ? styles.stepCurrentInvalid : styles.stepCurrent)
                      : idx < activeStep
                        ? (invalid ? styles.stepInvalid : styles.stepDone)
                        : styles.stepTodo
                  );
                  return (
                  <Group
                    key={s.title}
                    spacing="sm"
                      className={`${styles.stepItem} ${stateClass}`}
                      style={{ cursor: 'pointer' }}
                      wrap="nowrap"
                      onClick={() => setActiveStep(idx)}
                    >
                      <Box className={styles.stepBullet}><span>{idx + 1}</span></Box>
                      <Text size="sm" className={styles.stepLabel} weight={idx === activeStep ? 600 : 500}>{s.title}</Text>
                  </Group>
                  );
                })}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Центральный контент */}
          <Grid.Col span={7}>
            <Paper withBorder radius="md" p="lg" shadow="sm" className={styles.mainCard}>
              <Group position="apart" mb="md" className={styles.header}>
                <Title order={2}>{steps[activeStep].title}</Title>
                <Group spacing="xs" align="center">
                  <Text size="sm" c="dimmed">{activeStep + 1}/{steps.length}</Text>
                  <Progress value={pct} w={120} size="sm"/>
                </Group>
              </Group>

              <Box style={{ minHeight: 420 }}>
                {activeStep === 0 ? (
                  <Stack spacing="md" className={styles.slideIn}>
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput label="Имя" placeholder="Имя" value={formData.first_name} onChange={(e)=>handleInputChange('first_name', e.target.value)} error={errors.first_name} leftSection={<IconUser size={16} />} ref={refs.first_name} />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput label="Фамилия" placeholder="Фамилия" value={formData.last_name} onChange={(e)=>handleInputChange('last_name', e.target.value)} error={errors.last_name} leftSection={<IconUser size={16} />} ref={refs.last_name} />
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span={6}>
                        <DateInput
                          label="Дата рождения"
                          placeholder="Выберите дату"
                          value={formData.date_of_birth}
                          onChange={(value)=>handleInputChange('date_of_birth', value)}
                          valueFormat="YYYY-MM-DD"
                          maxDate={new Date()}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                          <Group spacing="xs" align="flex-end" wrap="nowrap">
                          <Select
                            label="Код"
                            data={phoneCodes}
                            value={formData.phone_code}
                            onChange={(v)=>{
                              // при смене кода — подрежем номер под нужную длину
                              const newCode = v;
                              const maxLen = getPhoneMaxLen(newCode);
                              setFormData((prev)=>({
                                ...prev,
                                phone_code: newCode,
                                phone_local: (prev.phone_local || '').slice(0, maxLen),
                              }));
                              // сбросим ошибку номера, если была
                              if (errors.phone_local) {
                                setErrors((prev)=>({ ...prev, phone_local: null }));
                              }
                            }}
                            w={120}
                          />
                          <TextInput
                            label="Телефон"
                            placeholder={`например: ${getPhoneExample(formData.phone_code)}`}
                            value={formData.phone_local}
                            inputMode="numeric"
                            onChange={(e)=>{
                              const maxLen = getPhoneMaxLen(formData.phone_code);
                              let val = e.target.value || '';
                              // Оставляем только цифры, ограничиваем длину
                              let onlyDigits = val.replace(/\D+/g, '').slice(0, maxLen);
                              // Автоматически добавляем пробелы для читаемости
                              let formatted = onlyDigits.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3').trim();
                              handleInputChange('phone_local', formatted);
                              // Сброс ошибки при вводе
                              if (errors.phone_local) setErrors((prev)=>({ ...prev, phone_local: null }));
                            }}
                            error={errors.phone_local}
                            leftSection={<IconPhone size={16} />}
                            style={{ flex: 1 }}
                            ref={refs.phone_local}
                            description={formData.phone_local && !errors.phone_local ? 'Проверьте правильность номера перед отправкой' : undefined}
                          />
                        </Group>
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span={6}>
                        <Select
                          label="Страна проживания"
                          placeholder="Выберите страну"
                          data={residenceCountries}
                          value={formData.country}
                          onChange={(v)=>handleInputChange('country', v)}
                          searchable
                          clearable
                          error={errors.country}
                          ref={refs.country}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput label="Город" placeholder="Введите город" value={formData.city} onChange={(e)=>handleInputChange('city', e.target.value)} error={errors.city} ref={refs.city} />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                ) : (
                  <Box className={styles.slideIn}>{renderStepContent()}</Box>
                )}
              </Box>

              <Group position="apart" mt="xl" className={styles.footerBar}>
                <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={handlePrev} disabled={activeStep === 0}>Назад</Button>
                {activeStep === steps.length - 1 ? (
                  <Button leftSection={<IconCheck size={16} />} onClick={handleSubmit} loading={isSubmitting}>Завершить</Button>
                ) : (
                  <Button rightSection={<IconArrowRight size={16} />} onClick={() => {
                    const errs = getStepErrors(activeStep);
                    if (Object.keys(errs).length === 0) setActiveStep((s)=>s+1);
                    else { setErrors(errs); scrollToFirstError(errs); }
                  }}>Далее</Button>
                )}
              </Group>

              {Object.values(errors || {}).some(Boolean) && (
                <Alert color="red" mt="md" icon={<IconAlertCircle size={16} />} className={styles.errorAlert}>
                  <Stack spacing={4}>
                    <Text size="sm">Пожалуйста, исправьте ошибки на текущем шаге:</Text>
                    <Group spacing="xs">
                      {Object.entries(errors).filter((entry)=>entry[1]).map((entry) => {
                        const key = entry[0];
                        return (
                          <Button key={key} size="xs" variant="light" color="red" onClick={()=>{
                            const el = refs[key]?.current;
                            if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            if (el?.focus) el.focus();
                          }}>
                            {({
                              first_name: 'Имя',
                              last_name: 'Фамилия',
                              phone_local: 'Телефон',
                              country: 'Страна',
                              city: 'Город',
                              education_level: 'Образование',
                              interests: 'Желаемая специальность',
                              goals: 'Цели',
                              university: 'Университет',
                              exams: 'Сертификаты',
                              avatar: 'Аватар',
                              ielts_file: 'IELTS файл',
                              toefl_file: 'TOEFL файл',
                              tolc_file: 'TOLC файл',
                            }[key] || key)}
                          </Button>
                        );
                      })}
                    </Group>
                  </Stack>
                </Alert>
              )}

              <Group justify="center" mt="sm">
                <Text size="sm" c="dimmed" ta="center">
                  Черновик сохраняется автоматически
                </Text>
              </Group>
            </Paper>
          </Grid.Col>

          {/* Правая колонка с подсказками AI */}
          <Grid.Col span={3}>
            <Card withBorder mb="md" p="md" className={styles.aiHintsCard}>
              <Stack spacing={2}>
                {stepHints.map((hint, idx) => (
                  <Text key={idx} size="sm" color="blue.7">{hint}</Text>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default UserProfileForm;
