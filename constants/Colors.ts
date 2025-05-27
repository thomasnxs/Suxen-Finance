// GastosApp/constants/colors.ts

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
  accent: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  invested: string;
  disabled: string;
  placeholder: string;
  switchThumb: string;
  switchTrackFalse: string;
  switchTrackTrue: string;
  headerBackground: string;
  headerText: string;
  icon: string;
  isDark?: boolean; // Para conveniência em funções de estilo
}

export const lightColors: ThemeColors = {
  background: '#e9ecef',
  card: '#ffffff',
  text: '#212529',
  secondaryText: '#6c757d',
  border: '#dee2e6',
  primary: '#007bff',
  accent: '#6f42c1',
  success: 'green',
  danger: 'red',
  warning: 'orangered',
  info: 'dodgerblue',
  invested: '#8A2BE2',
  disabled: '#adb5bd',
  placeholder: '#888',
  switchThumb: '#f4f3f4',
  switchTrackFalse: '#767577',
  switchTrackTrue: '#81b0ff',
  headerBackground: '#f8f9fa',
  headerText: '#212529',
  icon: '#495057',
  isDark: false,
};

export const darkColors: ThemeColors = {
  background: '#1c1c1e',
  card: '#2c2c2e',
  text: '#f0f0f0',
  secondaryText: '#8e8e93',
  border: '#3a3a3c',
  primary: '#0a84ff',
  accent: '#bf5af2',
  success: '#30d158',
  danger: '#ff453a',
  warning: '#ff9f0a',
  info: '#0a84ff',
  invested: '#c98bff',
  disabled: '#505054',
  placeholder: '#6e6e73',
  switchThumb: '#e9e9eb',
  switchTrackFalse: '#39393d',
  switchTrackTrue: '#0a84ff',
  headerBackground: '#1c1c1e',
  headerText: '#ffffff',
  icon: '#aeaeb2',
  isDark: true,
};