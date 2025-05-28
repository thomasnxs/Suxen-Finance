// GastosApp/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'; // Ajustado para o caminho correto se seu context estiver em /app

// Componente interno para acessar o tema para o Stack
function RootStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="(tabs)" // Aponta para a pasta app/(tabs) e seu _layout.tsx
        options={{
          title: 'Nome do App', 
          headerShown: true, 
        }}
      />
      {/* Outras telas de Stack globais (ex: modais) podem ser adicionadas aqui */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider> 
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootStackLayout />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}