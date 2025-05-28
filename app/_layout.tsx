// GastosApp/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InitialDataProvider } from '../contexts/InitialDataContext'; // Supondo que useInitialData é exportado
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

// SplashScreen.preventAutoHideAsync(); // Movido para app/index.tsx para melhor controle

function RootStackLayout() {
  const { colors } = useTheme();
  // const { isLoadingData } = useInitialData(); // Exemplo se precisasse esperar dados do context

  // useEffect(() => {
  //   if (!isLoadingData) { // Exemplo: Esconder splash screen após dados do context carregarem
  //     SplashScreen.hideAsync();
  //   }
  // }, [isLoadingData]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="welcome" // Tela de Boas-Vindas
        options={{
          headerShown: false, // A tela de welcome gerencia seu próprio header ou não tem
        }}
      />
      <Stack.Screen
        name="(tabs)" // Nosso grupo de abas
        options={{
          title: 'Nome do App', 
          headerShown: true, 
        }}
      />
      {/* Outras telas globais ou modais podem ser adicionadas aqui */}
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