import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Stack,
  Text,
  TextInput,
  Select,
  Button,
  Group,
  Avatar,
  FileInput,
  Switch,
  PasswordInput,
  Card,
  Badge,
  ActionIcon,
  Grid,
  Container,
  Paper,
  Title,
  Divider,
  Alert,
  Progress,
  CopyButton,
  Tooltip,
  Loader,
  Center,
  Flex,
  SimpleGrid,
  ThemeIcon,
  UnstyledButton,
  Timeline,
  ScrollArea,
  Affix,
  Transition,
  useMantineTheme,
  List,
  RingProgress,
  NumberInput,
  Modal,
  Stepper,
  Skeleton,
  Anchor,
  Breadcrumbs,
  Image
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconLanguage,
  IconBell,
  IconCamera,
  IconEdit,
  IconX,
  IconDeviceFloppy,
  IconTrash,
  IconCheck,
  IconCopy,
  IconRefresh,
  IconAlertTriangle,
  IconShield,
  IconSettings,
  IconPalette,
  IconWorld,
  IconKey,
  IconHistory,
  IconDownload,
  IconUpload,
  IconEye,
  IconEyeOff,
  IconChevronRight,
  IconActivity,
  IconCreditCard,
  IconBrandGoogle,
  IconFingerprint,
  IconLogout,
  IconClock,
  IconLocation,
  IconAt,
  IconUserCircle,
  IconStar,
  IconTrendingUp,
  IconChartBar,
  IconDatabase,
  IconCloud,
  IconLockAccess,
  IconShieldLock,
  IconDeviceDesktop,
  IconLock,
  IconMoonStars,
  IconSun,
  IconInfoCircle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfileComplete, fetchProfile, requestEmailVerification, changePassword, updateProfile, fetchDevices, revokeDevice, revokeAllDevices, twofaSetup, twofaEnable, twofaDisable } from '../../../../store/authSlice';
import { useTheme } from '../../../../shared/components/Theme/useTheme.js';
import { API_BASE_URL } from '../../../../shared/services/api.js';
import QRCode from 'qrcode/lib/browser';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const SettingsSection = () => {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const themeCtx = useTheme();
  const { user, profileUpdating, devices, devicesLoading, twofa } = useSelector((state) => state.auth);
  
  // State management
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [twofaCode, setTwofaCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    country: '',
    language: localStorage.getItem('app_language') || 'ru',
    theme: localStorage.getItem('colorScheme') || 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      deadlines: true,
      progress: true,
      ai: true
    }
  });

  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.date_of_birth || '',
        city: user.city || '',
        country: user.country || '',
      }));
      const raw = user?.avatar || '';
      const abs = raw && (raw.startsWith('http://') || raw.startsWith('https://')) ? raw : (raw ? `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}` : '');
      setAvatarPreview(abs);
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper functions
  const isValidImageFile = (file) => {
    if (!(file instanceof File)) return false;
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAvatarError('Поддерживаются JPG, PNG или WEBP');
      return false;
    }
    if (file.size > maxSizeBytes) {
      setAvatarError('Размер файла до 5 MB');
      return false;
    }
    setAvatarError('');
    return true;
  };

  const passwordStrength = () => {
    const v = pwdForm.next || '';
    let s = 0;
    if (v.length >= 8) s++;
    if (/[a-z]/.test(v)) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^\w\s]/.test(v)) s++;
    return s;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 2) return 'red';
    if (strength < 4) return 'yellow';
    return 'green';
  };

  const autoSaveField = async (patch) => {
    try {
      if (Object.prototype.hasOwnProperty.call(patch, 'date_of_birth')) {
        patch.date_of_birth = patch.date_of_birth ? patch.date_of_birth : null;
      }
      await dispatch(updateProfile(patch)).unwrap();
      await dispatch(fetchProfile());
      notifications.show({ 
        color: 'green', 
        message: 'Сохранено', 
        icon: <IconCheck size={16} />,
        autoClose: 2000
      });
    } catch {
      notifications.show({ 
        color: 'red', 
        message: 'Не удалось сохранить', 
        icon: <IconAlertTriangle size={16} /> 
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        avatar: avatarFile instanceof File ? avatarFile : undefined,
      };
      const res = await dispatch(updateProfileComplete(payload)).unwrap();
      const updated = res?.user;
      if (updated?.avatar) {
        const raw = updated.avatar;
        const abs = raw && (raw.startsWith('http://') || raw.startsWith('https://')) ? raw : `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
        setAvatarPreview(abs);
      }
      await dispatch(fetchProfile());
      notifications.show({ 
        color: 'green', 
        message: 'Настройки сохранены', 
        icon: <IconCheck size={16} /> 
      });
    } catch {
      notifications.show({ 
        color: 'red', 
        message: 'Не удалось сохранить настройки', 
        icon: <IconAlertTriangle size={16} /> 
      });
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || '');
  };

  const submitPasswordChange = async () => {
    setPwdMsg(null);
    if (!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm) {
      setPwdMsg({ type: 'error', text: 'Проверьте поля пароля' });
      return;
    }
    try {
      const res = await dispatch(changePassword({ 
        old_password: pwdForm.current, 
        new_password: pwdForm.next, 
        new_password_confirm: pwdForm.confirm 
      })).unwrap();
      setPwdMsg({ type: 'success', text: res?.message || 'Пароль изменен' });
      setPwdForm({ current: '', next: '', confirm: '' });
      notifications.show({ 
        color: 'green', 
        message: 'Пароль изменён', 
        icon: <IconCheck size={16} /> 
      });
    } catch {
      setPwdMsg({ type: 'error', text: 'Ошибка изменения пароля' });
      notifications.show({ 
        color: 'red', 
        message: 'Ошибка изменения пароля', 
        icon: <IconAlertTriangle size={16} /> 
      });
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'profile', label: 'Профиль', icon: IconUser, description: 'Личные данные и аватар' },
    { id: 'preferences', label: 'Предпочтения', icon: IconPalette, description: 'Язык и тема интерфейса' },
    { id: 'security', label: 'Безопасность', icon: IconShieldLock, description: 'Пароль и защита аккаунта' },
    { id: 'sessions', label: 'Сессии', icon: IconDeviceDesktop, description: 'Активные устройства' },
    { id: 'twofa', label: '2FA', icon: IconLock, description: 'Двухфакторная аутентификация' },
    { id: 'notifications', label: 'Уведомления', icon: IconBell, description: 'Настройки оповещений' },
    { id: 'activity', label: 'Активность', icon: IconActivity, description: 'История действий' },
    { id: 'data', label: 'Данные', icon: IconDatabase, description: 'Экспорт и управление данными' }
  ];

  const renderProfileSection = () => (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      shadow="sm"
      radius="lg"
      p="xl"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
    >
      <Group align="flex-start" gap="xl">
        <Stack align="center" gap="md">
          <Box
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.3)',
              position: 'relative'
            }}
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Аватар"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Center style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)' }}>
                <IconUser size={40} />
              </Center>
            )}
            {isEditing && (
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                radius="xl"
                style={{ position: 'absolute', bottom: -5, right: -5 }}
                onClick={() => document.getElementById('avatar-input')?.click()}
              >
                <IconCamera size={16} />
              </ActionIcon>
            )}
          </Box>
          
          {isEditing && (
            <>
              <FileInput
                id="avatar-input"
                style={{ display: 'none' }}
                onChange={(file) => {
                  if (file && !isValidImageFile(file)) {
                    setAvatarFile(null);
                    return;
                  }
                  setAvatarFile(file || null);
                  if (file instanceof File) {
                    const url = URL.createObjectURL(file);
                    setAvatarPreview(url);
                  }
                }}
                accept="image/*"
              />
              {avatarError && (
                <Text size="xs" c="red" ta="center" style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: 4, color: theme.colors.red[6] }}>
                  {avatarError}
                </Text>
              )}
            </>
          )}
        </Stack>

        <Box style={{ flex: 1 }}>
          <Title order={2} mb="xs" c="white">
            {userData.firstName} {userData.lastName}
          </Title>
          <Text size="sm" c="rgba(255,255,255,0.8)" mb="xl">
            {userData.email}
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Имя"
              value={userData.firstName}
              onChange={(e) => setUserData({...userData, firstName: e.target.value})}
              onBlur={() => autoSaveField({ first_name: userData.firstName })}
              disabled={!isEditing}
              styles={{
                label: { color: 'rgba(255,255,255,0.9)', fontWeight: 500 },
                input: { 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  '&::placeholder': { color: 'rgba(255,255,255,0.5)' }
                }
              }}
            />
            <TextInput
              label="Фамилия"
              value={userData.lastName}
              onChange={(e) => setUserData({...userData, lastName: e.target.value})}
              onBlur={() => autoSaveField({ last_name: userData.lastName })}
              disabled={!isEditing}
              styles={{
                label: { color: 'rgba(255,255,255,0.9)', fontWeight: 500 },
                input: { 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white'
                }
              }}
            />
            <TextInput
              label="Телефон"
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
              onBlur={() => autoSaveField({ phone: userData.phone })}
              disabled={!isEditing}
              leftSection={<IconPhone size={16} />}
              styles={{
                label: { color: 'rgba(255,255,255,0.9)', fontWeight: 500 },
                input: { 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white'
                }
              }}
            />
            <TextInput
              label="Дата рождения"
              type="date"
              value={userData.birthDate}
              onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
              onBlur={() => autoSaveField({ date_of_birth: userData.birthDate })}
              disabled={!isEditing}
              leftSection={<IconCalendar size={16} />}
              styles={{
                label: { color: 'rgba(255,255,255,0.9)', fontWeight: 500 },
                input: { 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white'
                }
              }}
            />
            <TextInput
              label="Город"
              value={userData.city}
              onChange={(e) => setUserData({...userData, city: e.target.value})}
              onBlur={() => autoSaveField({ city: userData.city })}
              disabled={!isEditing}
              leftSection={<IconMapPin size={16} />}
              styles={{
                label: { color: 'rgba(255,255,255,0.9)', fontWeight: 500 },
                input: { 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white'
                }
              }}
            />
            <TextInput
              label="Страна"
              value={userData.country}
              onChange={(e) => setUserData({...userData, country: e.target.value})}
              onBlur={() => autoSaveField({ country: userData.country })}
              disabled={!isEditing}
              leftSection={<IconWorld size={16} />}
              styles={{
                label: { color: 'rgba(255,255,255,0.9)', fontWeight: 500 },
                input: { 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white'
                }
              }}
            />
          </SimpleGrid>
        </Box>
      </Group>
    </MotionCard>
  );

  const renderPreferencesSection = () => (
    <Stack gap="md">
      <Card shadow="sm" radius="lg" p="lg">
        <Group mb="md">
          <ThemeIcon size="lg" radius="xl" variant="light">
            <IconLanguage size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>Язык и локализация</Text>
            <Text size="sm" c="dimmed">Настройка языка интерфейса</Text>
          </Box>
        </Group>
        <Select
          label="Язык интерфейса"
          data={[
            { value: 'ru', label: '🇷🇺 Русский' },
            { value: 'en', label: '🇺🇸 English' }
          ]}
          value={userData.language}
          onChange={(v) => {
            setUserData({ ...userData, language: v });
            localStorage.setItem('app_language', v || 'ru');
          }}
          disabled={!isEditing}
        />
      </Card>

      <Card shadow="sm" radius="lg" p="lg">
        <Group mb="md">
          <ThemeIcon size="lg" radius="xl" variant="light">
            <IconPalette size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>Внешний вид</Text>
            <Text size="sm" c="dimmed">Настройка темы оформления</Text>
          </Box>
        </Group>
        <Select
          label="Тема"
          data={[
            { value: 'light', label: '☀️ Светлая' },
            { value: 'dark', label: '🌙 Тёмная' }
          ]}
          value={userData.theme}
          onChange={(v) => {
            setUserData({ ...userData, theme: v });
            themeCtx.updateColorScheme(v || 'light');
          }}
          disabled={!isEditing}
        />
      </Card>
    </Stack>
  );

  const renderSecuritySection = () => (
    <Stack gap="md">
      <Card shadow="sm" radius="lg" p="lg">
        <Group mb="md">
          <ThemeIcon size="lg" radius="xl" variant="light" color="red">
            <IconKey size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>Смена пароля</Text>
            <Text size="sm" c="dimmed">Обновите пароль для повышения безопасности</Text>
          </Box>
        </Group>

        {pwdMsg && (
          <Alert 
            color={pwdMsg.type === 'success' ? 'green' : 'red'} 
            mb="md" 
            icon={<IconInfoCircle size={16} />}
          >
            {pwdMsg.text}
          </Alert>
        )}

        <Stack gap="md">
          <PasswordInput
            label="Текущий пароль"
            value={pwdForm.current}
            onChange={(e) => setPwdForm({...pwdForm, current: e.target.value})}
            leftSection={<IconLock size={16} />}
          />
          <PasswordInput
            label="Новый пароль"
            value={pwdForm.next}
            onChange={(e) => setPwdForm({...pwdForm, next: e.target.value})}
            leftSection={<IconKey size={16} />}
          />
          <Box>
            <Progress
              value={(passwordStrength() / 5) * 100}
              color={getPasswordStrengthColor(passwordStrength())}
              size="sm"
              mb="xs"
            />
            <Text size="xs" c="dimmed">
              Сила пароля: {passwordStrength() < 2 ? 'Слабый' : passwordStrength() < 4 ? 'Средний' : 'Сильный'}
            </Text>
          </Box>
          <PasswordInput
            label="Повторите новый пароль"
            value={pwdForm.confirm}
            onChange={(e) => setPwdForm({...pwdForm, confirm: e.target.value})}
            leftSection={<IconCheck size={16} />}
          />
          <Button
            onClick={submitPasswordChange}
            loading={profileUpdating}
            leftSection={<IconDeviceFloppy size={16} />}
          >
            Сменить пароль
          </Button>
        </Stack>
      </Card>
    </Stack>
  );

  const renderSessionsSection = () => (
    <Card shadow="sm" radius="lg" p="lg">
      <Group mb="md" justify="space-between">
        <Group>
          <ThemeIcon size="lg" radius="xl" variant="light" color="blue">
            <IconDeviceDesktop size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>Активные сессии</Text>
            <Text size="sm" c="dimmed">Управление устройствами с доступом к аккаунту</Text>
          </Box>
        </Group>
        <Button
          variant="light"
          color="red"
          size="sm"
          onClick={() => modals.openConfirmModal({
            title: 'Завершить все сессии?',
            children: 'Это действие завершит все активные сессии на всех устройствах. Вам потребуется войти заново.',
            labels: { confirm: 'Завершить все', cancel: 'Отмена' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
              dispatch(revokeAllDevices()).then(() => {
                dispatch(fetchDevices());
                notifications.show({
                  color: 'green',
                  message: 'Все сессии завершены',
                  icon: <IconCheck size={16} />
                });
              });
            }
          })}
        >
          Завершить все
        </Button>
      </Group>

      <Stack gap="md">
        {devicesLoading ? (
          <Stack gap="xs">
            <Skeleton height={60} />
            <Skeleton height={60} />
            <Skeleton height={60} />
          </Stack>
        ) : devices.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Активных устройств не найдено
          </Text>
        ) : (
          devices.map((device, index) => (
            <MotionCard
              key={device.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              withBorder
              radius="md"
              p="md"
            >
              <Group justify="space-between" align="flex-start">
                <Group>
                  <ThemeIcon variant="light" size="lg" radius="xl">
                    <IconDeviceDesktop size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={500} size="sm" lineClamp={1}>
                      {device.user_agent || 'Неизвестное устройство'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      IP: {device.ip_address || '—'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(device.last_seen).toLocaleString('ru-RU')}
                    </Text>
                  </Box>
                </Group>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => modals.openConfirmModal({
                    title: 'Завершить сессию?',
                    children: 'Устройство будет отключено от аккаунта.',
                    labels: { confirm: 'Завершить', cancel: 'Отмена' },
                    confirmProps: { color: 'red' },
                    onConfirm: () => {
                      dispatch(revokeDevice(device.id)).then(() => {
                        dispatch(fetchDevices());
                        notifications.show({
                          color: 'green',
                          message: 'Сессия завершена',
                          icon: <IconCheck size={16} />
                        });
                      });
                    }
                  })}
                >
                  Завершить
                </Button>
              </Group>
            </MotionCard>
          ))
        )}
      </Stack>
    </Card>
  );

  const renderTwoFASection = () => (
    <Card shadow="sm" radius="lg" p="lg">
      <Group mb="md">
        <ThemeIcon size="lg" radius="xl" variant="light" color="green">
          <IconShield size={20} />
        </ThemeIcon>
        <Box>
          <Text fw={600}>Двухфакторная аутентификация</Text>
          <Text size="sm" c="dimmed">Дополнительная защита вашего аккаунта</Text>
        </Box>
      </Group>

      {!user?.two_factor_enabled ? (
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} variant="light">
            2FA значительно повышает безопасность аккаунта. Используйте приложения Google Authenticator или Authy.
          </Alert>

          <Stepper active={qrDataUrl ? 1 : 0} breakpoint="sm">
            <Stepper.Step label="Генерация" description="Создать секретный ключ">
              <Button
                onClick={async () => {
                  const res = await dispatch(twofaSetup(false));
                  const url = res?.payload?.otpauth_url;
                  if (url) {
                    try {
                      const dataUrl = await QRCode.toDataURL(url);
                      setQrDataUrl(dataUrl);
                    } catch {
                      setQrDataUrl('');
                    }
                  }
                }}
                loading={twofa.loading}
                leftSection={<IconKey size={16} />}
              >
                Сгенерировать секрет
              </Button>
            </Stepper.Step>

            <Stepper.Step label="Настройка" description="Сканировать QR-код">
              {qrDataUrl && (
                <Group>
                  <Box ta="center">
                    <Image src={qrDataUrl} alt="2FA QR" width={160} height={160} />
                    <Text size="xs" c="dimmed" mt="xs">
                      Отсканируйте QR-код в приложении
                    </Text>
                  </Box>
                  <Stack>
                    <Text size="sm">Или введите секрет вручную:</Text>
                    <Group>
                      <Text size="xs" ff="monospace" bg="gray.1" p="xs" style={{ borderRadius: 4 }}>
                        {twofa.secret}
                      </Text>
                      <CopyButton value={twofa.secret}>
                        {({ copied, copy }) => (
                          <ActionIcon variant="light" onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        )}
                      </CopyButton>
                    </Group>
                  </Stack>
                </Group>
              )}
            </Stepper.Step>

            <Stepper.Step label="Активация" description="Ввести код подтверждения">
              <Group>
                <TextInput
                  label="Код из приложения"
                  value={twofaCode}
                  onChange={(e) => setTwofaCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  styles={{ input: { fontFamily: 'monospace', fontSize: '16px', letterSpacing: '2px' } }}
                />
                <Button
                  onClick={() => {
                    dispatch(twofaEnable(twofaCode)).then(() => {
                      dispatch(fetchProfile());
                      setQrDataUrl('');
                      setTwofaCode('');
                      notifications.show({
                        color: 'green',
                        message: '2FA успешно включена',
                        icon: <IconCheck size={16} />
                      });
                    }).catch(() => {
                      notifications.show({
                        color: 'red',
                        message: 'Неверный код',
                        icon: <IconAlertTriangle size={16} />
                      });
                    });
                  }}
                  disabled={!twofaCode || twofaCode.length !== 6}
                  leftSection={<IconLock size={16} />}
                >
                  Включить 2FA
                </Button>
              </Group>
            </Stepper.Step>
          </Stepper>
        </Stack>
      ) : (
        <Group justify="space-between" align="center" p="md" bg="green.0" style={{ borderRadius: 8 }}>
          <Group>
            <ThemeIcon color="green" variant="light" size="lg">
              <IconCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={500} c="green">2FA включена</Text>
              <Text size="sm" c="dimmed">Ваш аккаунт защищён</Text>
            </Box>
          </Group>
          <Button
            variant="outline"
            color="red"
            onClick={() => modals.openConfirmModal({
              title: 'Отключить 2FA?',
              children: 'Это снизит безопасность вашего аккаунта. Вы уверены?',
              labels: { confirm: 'Отключить', cancel: 'Отмена' },
              confirmProps: { color: 'red' },
              onConfirm: () => {
                dispatch(twofaDisable()).then(() => {
                  dispatch(fetchProfile());
                  notifications.show({
                    color: 'orange',
                    message: '2FA отключена',
                    icon: <IconAlertTriangle size={16} />
                  });
                });
              }
            })}
          >
            Отключить
          </Button>
        </Group>
      )}
    </Card>
  );

  const renderNotificationsSection = () => (
    <Stack gap="md">
      {!user?.is_verified && (
        <Alert color="orange" icon={<IconMail size={16} />}>
          <Group justify="space-between" align="center">
            <Text>Ваш email не подтверждён</Text>
            <Button
              variant="light"
              size="sm"
              onClick={() => dispatch(requestEmailVerification())}
            >
              Отправить письмо
            </Button>
          </Group>
        </Alert>
      )}

      <Card shadow="sm" radius="lg" p="lg">
        <Group mb="md">
          <ThemeIcon size="lg" radius="xl" variant="light" color="blue">
            <IconBell size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>Настройки уведомлений</Text>
            <Text size="sm" c="dimmed">Управление способами получения уведомлений</Text>
          </Box>
        </Group>

        <Stack gap="lg">
          {[
            { key: 'email', label: 'Email уведомления', desc: 'Получать уведомления на электронную почту', icon: IconMail },
            { key: 'push', label: 'Push уведомления', desc: 'Браузерные уведомления', icon: IconBell },
            { key: 'sms', label: 'SMS уведомления', desc: 'Уведомления по SMS', icon: IconPhone },
            { key: 'deadlines', label: 'Дедлайны', desc: 'Напоминания о важных датах', icon: IconCalendar },
            { key: 'progress', label: 'Прогресс', desc: 'Уведомления о достижениях', icon: IconTrendingUp },
            { key: 'ai', label: 'AI помощник', desc: 'Советы и рекомендации от ИИ', icon: IconStar }
          ].map(({ key, label, desc, icon }) => {
            const NotificationIcon = icon;
            return (
            <Group key={key} justify="space-between" align="center">
              <Group>
                <ThemeIcon variant="light" size="md" radius="xl">
                  <NotificationIcon size={16} />
                </ThemeIcon>
                <Box>
                  <Text fw={500}>{label}</Text>
                  <Text size="sm" c="dimmed">{desc}</Text>
                </Box>
              </Group>
              <Switch
                checked={userData.notifications[key]}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: { ...userData.notifications, [key]: e.currentTarget.checked }
                })}
                disabled={!isEditing}
              />
            </Group>
          )})}
        </Stack>
      </Card>
    </Stack>
  );

  const renderActivitySection = () => (
    <Card shadow="sm" radius="lg" p="lg">
      <Group mb="md">
        <ThemeIcon size="lg" radius="xl" variant="light" color="violet">
          <IconActivity size={20} />
        </ThemeIcon>
        <Box>
          <Text fw={600}>История активности</Text>
          <Text size="sm" c="dimmed">Последние действия в аккаунте</Text>
        </Box>
      </Group>

      <Timeline active={2} bulletSize={24} lineWidth={2}>
        <Timeline.Item bullet={<IconUser size={12} />} title="Обновление профиля">
          <Text c="dimmed" size="sm">Изменены личные данные</Text>
          <Text size="xs" mt={4} c="dimmed">2 часа назад</Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconShield size={12} />} title="Вход в систему">
          <Text c="dimmed" size="sm">Успешный вход с нового устройства</Text>
          <Text size="xs" mt={4} c="dimmed">1 день назад</Text>
        </Timeline.Item>

        <Timeline.Item title="Смена пароля" bullet={<IconKey size={12} />}>
          <Text c="dimmed" size="sm">Пароль успешно изменён</Text>
          <Text size="xs" mt={4} c="dimmed">3 дня назад</Text>
        </Timeline.Item>

        <Timeline.Item title="Регистрация" bullet={<IconUserCircle size={12} />}>
          <Text c="dimmed" size="sm">Создание аккаунта</Text>
          <Text size="xs" mt={4} c="dimmed">2 недели назад</Text>
        </Timeline.Item>
      </Timeline>
    </Card>
  );

  const renderDataSection = () => (
    <Stack gap="md">
      <Card shadow="sm" radius="lg" p="lg">
        <Group mb="md">
          <ThemeIcon size="lg" radius="xl" variant="light" color="teal">
            <IconDownload size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>Экспорт данных</Text>
            <Text size="sm" c="dimmed">Скачайте копию ваших данных</Text>
          </Box>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={() => notifications.show({ message: 'Экспорт данных начат' })}
          >
            Скачать данные профиля
          </Button>
          <Button
            variant="light"
            leftSection={<IconChartBar size={16} />}
            onClick={() => notifications.show({ message: 'Экспорт статистики начат' })}
          >
            Скачать статистику обучения
          </Button>
        </SimpleGrid>
      </Card>

      <Card shadow="sm" radius="lg" p="lg" style={{ borderColor: theme.colors.red[3] }}>
        <Group mb="md">
          <ThemeIcon size="lg" radius="xl" variant="light" color="red">
            <IconTrash size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} c="red">Опасная зона</Text>
            <Text size="sm" c="dimmed">Необратимые действия с аккаунтом</Text>
          </Box>
        </Group>

        <Button
          color="red"
          variant="outline"
          leftSection={<IconTrash size={16} />}
          onClick={() => modals.openConfirmModal({
            title: 'Удалить аккаунт?',
            children: 'Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.',
            labels: { confirm: 'Удалить аккаунт', cancel: 'Отмена' },
            confirmProps: { color: 'red' },
            onConfirm: () => notifications.show({ 
              color: 'red', 
              message: 'Функция удаления аккаунта будет доступна в следующих версиях' 
            })
          })}
        >
          Удалить аккаунт
        </Button>
      </Card>
    </Stack>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'preferences': return renderPreferencesSection();
      case 'security': return renderSecuritySection();
      case 'sessions': return renderSessionsSection();
      case 'twofa': return renderTwoFASection();
      case 'notifications': return renderNotificationsSection();
      case 'activity': return renderActivitySection();
      case 'data': return renderDataSection();
      default: return renderProfileSection();
    }
  };

  return (
    <Container size="xl" px="md">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Breadcrumbs mb="md">
            <Anchor href="#" onClick={(e) => e.preventDefault()}>Кабинет</Anchor>
            <Anchor href="#" onClick={(e) => e.preventDefault()}>Аккаунт</Anchor>
            <Text c="dimmed">Настройки</Text>
          </Breadcrumbs>

          <Group justify="space-between" align="center" mb="xs">
            <Box>
              <Title order={1} size="h2" mb="xs">
                Настройки аккаунта
              </Title>
              <Text c="dimmed">
                Управление личными данными, безопасностью и предпочтениями
              </Text>
            </Box>
            <Button
              size="md"
              leftSection={<IconEdit size={18} />}
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "filled"}
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </Button>
          </Group>
        </Box>

        <Grid>
          {/* Navigation */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card shadow="sm" radius="lg" p="md" style={{ position: 'sticky', top: 20 }}>
              <Stack gap="xs">
                {navigationItems.map((item) => (
                  <UnstyledButton
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    p="md"
                    style={{
                      borderRadius: 8,
                      backgroundColor: activeSection === item.id ? theme.colors.blue[0] : 'transparent',
                      border: activeSection === item.id ? `1px solid ${theme.colors.blue[3]}` : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Group>
                      <ThemeIcon
                        size="md"
                        variant={activeSection === item.id ? 'filled' : 'light'}
                        color={activeSection === item.id ? 'blue' : 'gray'}
                      >
                        <item.icon 
                          size={16} 
                          color={
                            activeSection === item.id
                              ? '#ffffff'
                              : (theme.colorScheme === 'dark' 
                                  ? theme.colors.gray[3]
                                  : theme.colors.gray[7])
                          }
                        />
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text fw={activeSection === item.id ? 600 : 500} size="sm">
                          {item.label}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {item.description}
                        </Text>
                      </Box>
                      {activeSection === item.id && (
                        <IconChevronRight size={16} color={theme.colors.blue[6]} />
                      )}
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Content */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <AnimatePresence mode="wait">
              <MotionBox
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSectionContent()}
              </MotionBox>
            </AnimatePresence>
          </Grid.Col>
        </Grid>

        {/* Sticky Save Button */}
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={isEditing}>
            {(transitionStyles) => (
              <Group style={transitionStyles}>
                <Button
                  variant="outline"
                  leftSection={<IconX size={16} />}
                  onClick={handleCancel}
                >
                  Отменить
                </Button>
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSave}
                  loading={saving || profileUpdating}
                >
                  Сохранить
                </Button>
              </Group>
            )}
          </Transition>
        </Affix>

        {/* Scroll to Top */}
        <Affix position={{ bottom: 20, left: 20 }}>
          <Transition transition="slide-up" mounted={showScrollTop}>
            {(transitionStyles) => (
              <ActionIcon
                style={transitionStyles}
                size="xl"
                variant="filled"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <IconChevronRight style={{ transform: 'rotate(-90deg)' }} size={20} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      </Stack>
    </Container>
  );
};

export default SettingsSection;
