import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Group,
  ThemeIcon,
  Text,
  Title,
  Select,
  TextInput,
  Stack,
  Box,
  Badge,
  Button,
  Alert,
  Skeleton,
  Progress,
  Divider,
  SimpleGrid,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconMap, 
  IconMapPin, 
  IconSchool, 
  IconSearch, 
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconUsers,
  IconCalendar,
  IconBook
} from '@tabler/icons-react';
import ItalyMap from './ItalyMap';
import { getApiRequestUrl } from '../../../shared/services/api';
import styles from './ItalyMap.module.css';

const GeographyStep = ({ value, onChange, error }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedCity, setSelectedCity] = useState(value?.city || '');
  const [selectedUniversity, setSelectedUniversity] = useState(value?.university || '');
  const [universities, setUniversities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Синхронизация локального состояния с value из props
  useEffect(() => {
    if (value?.city !== selectedCity) setSelectedCity(value?.city || '');
    if (value?.university !== selectedUniversity) setSelectedUniversity(value?.university || '');
    // eslint-disable-next-line
  }, [value?.city, value?.university]);

  useEffect(() => {
    const fetchUnis = async () => {
      setLoading(true);
      setLoadingError(null);
      
      try {
        const res = await fetch(getApiRequestUrl('/api/education/universities/?is_active=true&limit=1000'));

        if (!res.ok) {
          throw new Error(`Ошибка сети: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        const results = Array.isArray(data) ? data : (data.results || []);

        if (results.length === 0) {
          setUniversities([]);
          setCities([]);
          setLoadingError(null);
          setRetryCount(0);
          return;
        }

        // Более надежная фильтрация по Италии
        const italianUnis = results.filter((u) => {
          const country = (u.country || '').toLowerCase().trim();
          return country === 'italy' || country === 'италия';
        });

        const nextUniversities = italianUnis.length > 0 ? italianUnis : [];
        setUniversities(nextUniversities);

        // Собираем уникальные города из всех университетов
        const uniqueCities = Array.from(new Set(nextUniversities.map((u) => u.city).filter(Boolean)));
        setCities(uniqueCities);

        // Сбрасываем счетчик попыток при успешной загрузке
        setRetryCount(0);

      } catch (error) {
        console.error('GeographyStep: Error fetching universities:', error);
        setLoadingError(error.message);
        setUniversities([]);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnis();
  }, [retryCount]);

  // Вызываем onChange только если значения реально изменились
  const prev = useRef({ city: selectedCity, university: selectedUniversity });
  useEffect(() => {
    if (
      prev.current.city !== selectedCity ||
      prev.current.university !== selectedUniversity
    ) {
      prev.current = { city: selectedCity, university: selectedUniversity };
      onChange({ city: selectedCity, university: selectedUniversity });
    }
    // eslint-disable-next-line
  }, [selectedCity, selectedUniversity]);

  // Функция для повторной попытки загрузки
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Функция обработки смены города с очисткой университета
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    if (newCity !== selectedCity) {
      setSelectedUniversity(''); // Очищаем выбранный университет при смене города
    }
  };

  // Университеты в выбранном городе (без фильтров)
  const cityUnis = universities.filter(u => u.city === selectedCity);
  const hasUniversityData = universities.length > 0;
  const useManualEntry = !loading && !hasUniversityData;

  return (
    <Stack spacing="xl">
      {/* Статистика */}
      {universities.length > 0 && (
        <Group gap="md" mb="md">
          <Badge size="xl" variant="light" color="blue" leftSection={<IconMapPin size={16} />} style={{ fontSize: '14px', fontWeight: 600 }}>
            {new Set(universities.map(u => u.city)).size} городов
          </Badge>
          <Badge size="xl" variant="light" color="green" leftSection={<IconSchool size={16} />} style={{ fontSize: '14px', fontWeight: 600 }}>
            {universities.length} университетов
          </Badge>
          {selectedCity && (
            <Badge size="xl" variant="filled" color="orange" leftSection={<IconCheck size={16} />} style={{ fontSize: '14px', fontWeight: 600 }}>
              Выбран: {selectedCity}
            </Badge>
          )}
        </Group>
      )}

      {/* Просто карта Италии */}
      <Card withBorder radius="xl" p="lg" style={{
        background: isDark 
          ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: isDark 
          ? '2px solid rgba(99, 179, 237, 0.2)' 
          : '2px solid rgba(59, 130, 246, 0.1)',
        boxShadow: isDark 
          ? '0 8px 32px rgba(0,0,0,0.3)' 
          : '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        {loading ? (
          <Box style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Skeleton height={400} radius="md" mb="md" />
            <Group justify="center" gap="sm">
              <Progress value={75} size="sm" style={{ width: 200 }} />
              <Text size="sm" c="dimmed">Загрузка университетов...</Text>
            </Group>
          </Box>
        ) : loadingError ? (
          <Alert 
            icon={<IconAlertCircle size={20} />} 
            title="Не удалось загрузить университеты" 
            color="yellow" 
            variant="light"
            radius="md"
          >
            <Stack gap="md">
              <Text mb="md">
                {loadingError}. Можно продолжить и заполнить город и университет вручную.
              </Text>
              <Group>
                <Button 
                  leftSection={<IconRefresh size={16} />} 
                  variant="light" 
                  size="sm"
                  onClick={handleRetry}
                  loading={loading}
                >
                  Попробовать снова
                </Button>
              </Group>
            </Stack>
          </Alert>
        ) : universities.length === 0 ? (
          <Alert 
            icon={<IconInfoCircle size={20} />} 
            title="Университеты пока не загружены" 
            color="yellow" 
            variant="light"
            radius="md"
          >
            <Stack gap="md">
              <Text>
                В базе пока нет данных по университетам. Этот шаг всё равно можно пройти вручную.
              </Text>
              <Button
                leftSection={<IconRefresh size={16} />}
                variant="light"
                size="sm"
                onClick={handleRetry}
              >
                Проверить снова
              </Button>
            </Stack>
          </Alert>
        ) : (
          <ItalyMap 
            selectedCity={selectedCity} 
            onSelectCity={handleCityChange} 
            universities={universities}
            cities={cities}
            isUniversityCardOpen={!!selectedUniversity}
          />
        )}
      </Card>

      {useManualEntry && (
        <Card withBorder radius="xl" p="lg">
          <Stack gap="md">
            <Box>
              <Text fw={600} size="lg">
                Введите данные вручную
              </Text>
              <Text size="sm" c="dimmed">
                Карта и список университетов появятся, когда данные будут загружены в базу.
              </Text>
            </Box>

            <TextInput
              label="Город обучения"
              placeholder="Например: Milano"
              value={selectedCity}
              onChange={(event) => handleCityChange(event.currentTarget.value)}
              error={error && !selectedCity ? error : null}
              leftSection={<IconMapPin size={16} />}
            />

            <TextInput
              label="Университет"
              placeholder="Например: Universita di Bologna"
              value={selectedUniversity}
              onChange={(event) => setSelectedUniversity(event.currentTarget.value)}
              error={error && selectedCity && !selectedUniversity ? error : null}
              leftSection={<IconSchool size={16} />}
            />
          </Stack>
        </Card>
      )}

      {/* Выбор университета */}
      {selectedCity && universities.length > 0 && (
        <Card withBorder radius="xl" p="lg" style={{
          background: selectedUniversity 
            ? isDark 
              ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
            : isDark 
              ? '#2d3748' 
              : 'white',
          border: selectedUniversity 
            ? isDark 
              ? '2px solid rgba(99, 179, 237, 0.5)' 
              : '2px solid rgba(14, 165, 233, 0.3)'
            : isDark 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.1)',
          transition: 'all 300ms ease'
        }}>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Box>
                <Text fw={600} size="lg" c="dark">
                  🎓 Выберите университет в {selectedCity}
                </Text>
                <Text size="sm" c="dimmed">
                  {cityUnis.length === 0 ? 'В выбранном городе пока нет университетов' : `Доступно ${cityUnis.length} университетов`}
                </Text>
              </Box>
              {selectedUniversity && (
                <Badge size="lg" variant="filled" color="green" leftSection={<IconCheck size={14} />}>
                  Выбран
                </Badge>
              )}
            </Group>
                    
            {cityUnis.length > 0 ? (
              <>
                <Select
                  placeholder="Начните вводить название университета..."
                  data={cityUnis.map(u => ({ 
                    value: u.name, 
                    label: u.name,
                    description: u.description ? u.description.substring(0, 100) + '...' : undefined
                  }))}
                  value={selectedUniversity}
                  onChange={setSelectedUniversity}
                  searchable
                  clearable
                  error={error}
                  size="lg"
                  radius="md"
                  leftSection={<IconSearch size={18} />}
                  styles={{
                    input: {
                      fontSize: '16px',
                      padding: '12px 16px',
                      paddingLeft: '48px' // Добавляем отступ слева для иконки
                    }
                  }}
                />
                
                {/* Детальная информация о выбранном университете */}
                {selectedUniversity && (() => {
                  const selectedUni = cityUnis.find(u => u.name === selectedUniversity);
                  if (!selectedUni) return null;
                  
                  return (
                    <Card 
                      withBorder 
                      radius="md" 
                      p="md" 
                      mt="md"
                      className={styles.universityDetails}
                      style={{
                        background: isDark 
                          ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' 
                          : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        border: isDark 
                          ? '1px solid rgba(99, 179, 237, 0.3)' 
                          : '1px solid rgba(14, 165, 233, 0.2)'
                      }}
                    >
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start">
                          <Box style={{ flex: 1 }}>
                            <Text fw={700} size="lg" c="dark" mb="xs">
                              {selectedUni.name}
                            </Text>
                            {selectedUni.description && (
                              <Text size="sm" c="dimmed" mb="sm">
                                {selectedUni.description}
                              </Text>
                            )}
                          </Box>
                          {selectedUni.level && (
                            <Badge size="lg" variant="filled" color="blue">
                              {selectedUni.level}
                            </Badge>
                          )}
                        </Group>
                        
                        <Divider />
                        
                        <SimpleGrid cols={2} spacing="md">
                          {selectedUni.student_count && (
                            <Group gap="xs">
                              <IconUsers size={16} color="gray" />
                              <Box>
                                <Text size="xs" c="dimmed">Студентов</Text>
                                <Text size="sm" fw={600}>
                                  {selectedUni.student_count.toLocaleString()}
                                </Text>
                              </Box>
                            </Group>
                          )}
                          
                          {selectedUni.deadline && (
                            <Group gap="xs">
                              <IconCalendar size={16} color="orange" />
                              <Box>
                                <Text size="xs" c="dimmed">Дедлайн подачи</Text>
                                <Text size="sm" fw={600}>
                                  {new Date(selectedUni.deadline).toLocaleDateString('ru-RU')}
                                </Text>
                              </Box>
                            </Group>
                          )}
                          
                          {selectedUni.website && (
                            <Group gap="xs">
                              <IconMapPin size={16} color="green" />
                              <Box>
                                <Text size="xs" c="dimmed">Сайт</Text>
                                <Text 
                                  size="sm" 
                                  fw={600} 
                                  c="blue" 
                                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                  onClick={() => window.open(selectedUni.website, '_blank')}
                                >
                                  Перейти на сайт
                                </Text>
                              </Box>
                            </Group>
                          )}
                          
                          {selectedUni.majors && selectedUni.majors.length > 0 && (
                            <Group gap="xs">
                              <IconBook size={16} color="purple" />
                              <Box>
                                <Text size="xs" c="dimmed">Специальности</Text>
                                <Text size="sm" fw={600}>
                                  {selectedUni.majors.length} программ
                                </Text>
                              </Box>
                            </Group>
                          )}
                        </SimpleGrid>
                        
                        {/* Популярные специальности */}
                        {selectedUni.majors && selectedUni.majors.length > 0 && (
                          <Box>
                            <Text size="sm" fw={600} mb="xs">
                              Популярные специальности:
                            </Text>
                            <Group gap="xs">
                              {selectedUni.majors.slice(0, 4).map((major, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="light" 
                                  color="violet" 
                                  size="sm"
                                >
                                  {major.name}
                                </Badge>
                              ))}
                              {selectedUni.majors.length > 4 && (
                                <Badge variant="outline" color="gray" size="sm">
                                  +{selectedUni.majors.length - 4} еще
                                </Badge>
                              )}
                            </Group>
                          </Box>
                        )}
                      </Stack>
                    </Card>
                  );
                })()}
              </>
            ) : (
              <Alert 
                icon={<IconInfoCircle size={20} />} 
                title="Университеты не найдены" 
                color="blue" 
                variant="light"
                radius="md"
              >
                В городе {selectedCity} пока нет доступных университетов. Попробуйте выбрать другой город.
              </Alert>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default GeographyStep;
