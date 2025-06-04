// GastosApp/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native'; // <--- ADICIONADO IMPORT
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InitialDataProvider } from '../contexts/InitialDataContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

// ADICIONADO PARA IGNORAR O ERRO ESPECÍFICO
// Lembre-se: como discutido, isso esconde o sintoma, não a causa,
// e é geralmente recomendado para desenvolvimento apenas em casos específicos.
LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component.']);

function RootStackLayout() {
  const { colors } = useTheme(); // useTheme é usado aqui para estilizar o header do Stack

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleAlign: 'center',
      }}
    >
      {/* A tela 'index' geralmente redireciona, então pode não precisar de um header visível se fosse listada aqui.
          No seu app/index.tsx, ele redireciona para /welcome ou /(tabs)/home.
          A tela 'welcome' geralmente também não tem header.
      */}
      <Stack.Screen
        name="welcome" // Corresponde ao arquivo app/welcome.tsx
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)" // Corresponde ao grupo de abas em app/(tabs)/_layout.tsx
        options={{
          title: 'Gastei!', // Este título aparecerá no header acima das abas
          headerShown: true,
        }}
      />
      {/* Se você tiver uma tela app/index.tsx que NÃO redireciona e deve ser parte do Stack, 
          você a adicionaria aqui. Ex:
      <Stack.Screen name="index" options={{ headerShown: false }} /> 
      */}
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