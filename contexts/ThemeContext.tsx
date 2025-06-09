// GastosApp/contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from '../constants/colors';

const THEME_STORAGE_KEY = '@GasteiApp:theme'; // <-- CHAVE PADRONIZADA AQUI

interface ThemeContextData {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const defaultThemeContextValue: ThemeContextData = {
  theme: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => console.warn('toggleTheme chamado fora do ThemeProvider'),
  setTheme: () => console.warn('setTheme chamado fora do ThemeProvider'),
};

const ThemeContext = createContext<ThemeContextData>(defaultThemeContextValue);


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<'light' | 'dark'>(systemScheme ?? 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY); // Usa a nova constante
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
        } else if (systemScheme) {
          setThemeState(systemScheme);
        }
      } catch (error) {
        console.error('Falha ao carregar tema do AsyncStorage', error);
        if (systemScheme) setThemeState(systemScheme);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const saveThemePreference = async (newTheme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme); // Usa a nova constante
    } catch (error) {
      console.error('Falha ao salvar tema no AsyncStorage', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  };

  const currentColors = theme === 'light' ? lightColors : darkColors;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors: currentColors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextData => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};