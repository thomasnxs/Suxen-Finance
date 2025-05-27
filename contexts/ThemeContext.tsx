// GastosApp/contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from '../constants/colors';

interface ThemeContextData {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Fornecendo um valor default mais completo para o contexto, embora o provider vá sobrescrever.
const defaultThemeContextValue: ThemeContextData = {
  theme: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => console.warn('toggleTheme called outside of ThemeProvider'),
  setTheme: () => console.warn('setTheme called outside of ThemeProvider'),
};

const ThemeContext = createContext<ThemeContextData>(defaultThemeContextValue);


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<'light' | 'dark'>(systemScheme ?? 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@SuxenFinance:theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
        } else if (systemScheme) {
          setThemeState(systemScheme);
        }
        // Se não houver tema salvo e nem do sistema, mantém o default 'light' que foi setado no useState.
      } catch (error) {
        console.error('Falha ao carregar tema do AsyncStorage', error);
        if (systemScheme) setThemeState(systemScheme);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('@SuxenFinance:theme', newTheme);
    } catch (error) {
      console.error('Falha ao salvar tema no AsyncStorage', error);
    }
  };

  // Função para definir um tema específico, caso precise no futuro (ex: configurações do usuário)
  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('@SuxenFinance:theme', newTheme);
    } catch (error) {
      console.error('Falha ao salvar tema no AsyncStorage', error);
    }
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
  // O valor default do context garante que context nunca seja undefined aqui se o hook for usado corretamente.
  // Mas uma verificação extra não faz mal se você for muito cauteloso ou se o valor default fosse undefined.
  if (context === undefined) {
     throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};