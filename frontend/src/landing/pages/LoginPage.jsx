import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchProfile, clearError, clearSuccess } from '../../store/authSlice';
import {
  Box,
  Container,
  Paper,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Group,
  Stack,
  Title,
  Alert,
  Anchor,
  ThemeIcon,
  BackgroundImage,
  Overlay,
  ActionIcon,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconRocket,
} from '@tabler/icons-react';
import './LoginPage.css';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [twofaCode, setTwofaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
    emailRef.current?.focus?.();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const payload = twofaCode ? { ...formData, code: twofaCode } : formData;
      const result = await dispatch(loginUser(payload));

      if (loginUser.fulfilled.match(result)) {
        const profileAction = await dispatch(fetchProfile());
        const fetchedUser = profileAction?.payload;
        const onboardingCompleted = fetchedUser?.profile?.onboarding_completed === true;

        navigate(onboardingCompleted ? '/app/dashboard' : '/app/onboarding');
      }
    } catch {
      // handled by auth UI state
    }
  };

  const canSubmit = formData.email && formData.password && !loading;

  return (
    <Box className="login-page">
      <BackgroundImage src="/images/bg-hero.jpg" className="login-background">
        <Overlay color="#000" opacity={0.22} zIndex={1} />

        <Container size="xl" className="login-container">
          <div className="login-content">
            <Paper className="login-card" p="xl" radius="xl" shadow="xl">
              <Stack spacing="md" mb="xl">
                <Group position="apart" align="center">
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() => navigate('/')}
                    className="back-button"
                  >
                    <IconArrowLeft size={20} />
                  </ActionIcon>
                  <Group spacing="xs">
                    <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'purple' }}>
                      <IconRocket size={20} />
                    </ThemeIcon>
                    <Text size="lg" weight={700}>
                      EduBridge
                    </Text>
                  </Group>
                </Group>

                <Box>
                  <Title order={1} size="2.5rem" weight={800} className="login-title">
                    Добро пожаловать!
                  </Title>
                  <Text size="lg" color="dimmed" className="login-subtitle">
                    Войдите в свой аккаунт для продолжения
                  </Text>
                </Box>
              </Stack>

              {searchParams.get('expired') && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Сессия истекла"
                  color="yellow"
                  mb="md"
                  radius="md"
                >
                  Пожалуйста, войдите снова для продолжения работы
                </Alert>
              )}

              {success && (
                <Alert icon={<IconCheck size={16} />} title="Успех" color="green" mb="md" radius="md">
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing="md">
                  <TextInput
                    label="Email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    leftSection={<IconMail size={20} />}
                    size="lg"
                    radius="md"
                    ref={emailRef}
                    required
                    autoComplete="username"
                    className="form-input"
                    disabled={loading}
                  />

                  <PasswordInput
                    label="Пароль"
                    placeholder="Введите ваш пароль"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    leftSection={<IconLock size={20} />}
                    size="lg"
                    radius="md"
                    required
                    autoComplete="current-password"
                    className="form-input"
                    visibilityToggleIcon={({ reveal, size }) =>
                      reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
                    }
                    disabled={loading}
                  />

                  <TextInput
                    label="Код 2FA (если включён)"
                    placeholder="123456"
                    value={twofaCode}
                    onChange={(event) => setTwofaCode(event.target.value)}
                    size="lg"
                    radius="md"
                    autoComplete="one-time-code"
                    className="form-input"
                    disabled={loading}
                  />

                  <Group position="apart" align="center">
                    <Checkbox
                      label="Запомнить меня"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.currentTarget.checked)}
                      size="md"
                    />
                    <Anchor
                      size="sm"
                      onClick={() => navigate('/reset-password')}
                      className="forgot-password-link"
                    >
                      Забыли пароль?
                    </Anchor>
                  </Group>

                  {error && (
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      title="Ошибка входа"
                      color="red"
                      radius="md"
                    >
                      {typeof error === 'string'
                        ? error
                        : error.error || 'Неверный логин или пароль'}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={loading}
                    disabled={!canSubmit}
                    className="login-button"
                    radius="md"
                  >
                    {loading ? 'Вход...' : 'Войти'}
                  </Button>

                  <Text size="sm" c="dimmed" ta="center">
                    Если у вас ещё нет аккаунта, обратитесь к команде EduBridge для получения доступа.
                  </Text>
                </Stack>
              </form>
            </Paper>
          </div>
        </Container>
      </BackgroundImage>
    </Box>
  );
}

export default LoginPage;
