import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Button, 
  ActionIcon,
  Badge,
  Alert
} from '@mantine/core';
import { 
  IconMicrophone, 
  IconMicrophoneOff, 
  IconVolume,
  IconRefresh,
  IconAlertCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const VoiceAssistant = ({ onCommand, isListening, onToggleListening }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  useEffect(() => {
    // Проверяем поддержку Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleVoiceCommand = () => {
    if (!isSupported) {
      alert('Голосовые команды не поддерживаются в вашем браузере');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      onToggleListening(true);
      setIsProcessing(true);
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      setLastCommand(command);
      onCommand(command);
      setIsProcessing(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsProcessing(false);
      onToggleListening(false);
    };

    recognition.onend = () => {
      onToggleListening(false);
      setIsProcessing(false);
    };

    recognition.start();
  };

  const quickCommands = [
    'Показать университеты',
    'Проверить документы',
    'Мой прогресс',
    'AI рекомендации',
    'Уведомления',
    'Достижения'
  ];

  if (!isSupported) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Голосовые команды недоступны"
        color="yellow"
        mb="md"
      >
        Ваш браузер не поддерживает голосовые команды. Используйте текстовый ввод.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper shadow="sm" p="md" mb="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={600}>
            Голосовой помощник
          </Text>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => setLastCommand('')}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
        
        <Stack gap="md">
          <Group justify="center">
            <Button
              size="lg"
              radius="xl"
              variant={isListening ? 'filled' : 'light'}
              color={isListening ? 'red' : 'blue'}
              leftSection={
                isListening ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />
              }
              onClick={handleVoiceCommand}
              loading={isProcessing}
              disabled={isProcessing}
            >
              {isListening ? 'Слушаю...' : 'Нажмите и говорите'}
            </Button>
          </Group>
          
          {lastCommand && (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Text size="sm" c="dimmed" mb={4}>
                  Последняя команда:
                </Text>
                <Text size="sm" fw={500}>
                  "{lastCommand}"
                </Text>
              </Paper>
            </MotionDiv>
          )}
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md">
        <Text size="sm" fw={600} mb="md">
          Быстрые команды
        </Text>
        
        <Stack gap="sm">
          {quickCommands.map((command, index) => (
            <MotionDiv
              key={command}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="subtle"
                fullWidth
                justify="flex-start"
                leftSection={<IconVolume size={16} />}
                onClick={() => onCommand(command)}
                size="sm"
              >
                {command}
              </Button>
            </MotionDiv>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default VoiceAssistant;
