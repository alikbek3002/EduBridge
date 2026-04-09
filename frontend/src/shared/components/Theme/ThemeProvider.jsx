import React, { createContext, useContext, useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import theme from './themeConfig.js';
// Контекст для темы
import { ThemeContext } from './themeContext.js';

const _reactContextFns = [createContext, useContext];

const ThemeProvider = ({ children }) => {
  // colorScheme может быть 'light' | 'dark' | 'system'
  const [colorScheme, setColorScheme] = useState('system');
  const [systemScheme, setSystemScheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [fontSize, setFontSize] = useState('md');
  const [animations, setAnimations] = useState(true);

  // Подписка на системную тему
  useEffect(() => {
    try {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => setSystemScheme(mql.matches ? 'dark' : 'light');
      update();
      if (mql.addEventListener) mql.addEventListener('change', update);
      else if (mql.addListener) mql.addListener(update);
      return () => {
        if (mql.removeEventListener) mql.removeEventListener('change', update);
        else if (mql.removeListener) mql.removeListener(update);
      };
    } catch {
      // no-op in non-browser
    }
  }, []);

  // Загружаем настройки из localStorage
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('colorScheme') || 'system';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || 'blue';
    const savedFontSize = localStorage.getItem('fontSize') || 'md';
    const savedAnimations = localStorage.getItem('animations') !== 'false';

    setColorScheme(savedColorScheme);
    setPrimaryColor(savedPrimaryColor);
    setFontSize(savedFontSize);
    setAnimations(savedAnimations);
  }, []);

  // Сохраняем настройки в localStorage
  const updateColorScheme = (scheme) => {
    setColorScheme(scheme);
    localStorage.setItem('colorScheme', scheme);
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const updateAnimations = (enabled) => {
    setAnimations(enabled);
    localStorage.setItem('animations', enabled);
  };

  const toggleColorScheme = () => {
    const effective = colorScheme === 'system' ? systemScheme : colorScheme;
    updateColorScheme(effective === 'light' ? 'dark' : 'light');
  };

  const effectiveScheme = colorScheme === 'system' ? systemScheme : colorScheme;

  const value = {
    colorScheme,
    primaryColor,
    fontSize,
    animations,
    updateColorScheme,
    updatePrimaryColor,
    updateFontSize,
    updateAnimations,
    toggleColorScheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <MantineProvider
        theme={{
          ...theme,
          primaryColor,
          fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem'
          }
        }}
        forceColorScheme={effectiveScheme}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
