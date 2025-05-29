// GastosApp/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InitialDataProvider } from '../contexts/InitialDataContext'; // Importação correta
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

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
        name="welcome" 
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)" 
        options={{
          title: 'Nome do App', 
          headerShown: true, 
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider> 
      <InitialDataProvider> 
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootStackLayout />
        </GestureHandlerRootView>
      </InitialDataProvider>
    </ThemeProvider>
  );
}