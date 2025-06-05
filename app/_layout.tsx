// GastosApp/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native'; // Adicionado Platform
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InitialDataProvider } from '../contexts/InitialDataContext'; // Ajuste o caminho se necessário
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho se necessário

// Ignorar o aviso específico sobre "Text strings..."
// Lembre-se: isso esconde o sintoma, não a causa.
LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component.']);

// Componente funcional para o layout do Stack
function RootStackLayout() {
  const { colors } = useTheme(); // Hook useTheme para aplicar cores do tema ao header

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: 'bold' }, // Estilo opcional para o título
        headerTitleAlign: 'center',
        // Para iOS, podemos definir um botão de voltar mais genérico se quisermos
        // headerBackTitleVisible: false, 
      }}
    >
      {/* A tela 'index' é a primeira a carregar, mas geralmente redireciona.
          Não queremos um header visível para ela. */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />

      {/* A tela 'welcome' também não deve ter o header global. */}
      <Stack.Screen
        name="welcome" 
        options={{ headerShown: false }}
      />

      {/* O grupo '(tabs)' terá seu próprio header configurado aqui. */}
      <Stack.Screen
        name="(tabs)" 
        options={{
          title: 'Gastei!', // Nome do App que aparece no header
          headerShown: true,
          // Podemos remover o botão de voltar padrão aqui se não fizer sentido
          // headerLeft: () => null, // Descomente se não quiser botão de voltar para o grupo de abas
        }}
      />
      
      {/* A tela 'termos' pode usar o estilo de header global.
          O comportamento do botão de voltar será controlado dentro de termos.tsx
          usando params para o modo 'leitura' vs 'aceitação inicial'. */}
      <Stack.Screen 
        name="termos" 
        options={{ 
          title: 'Termos e Privacidade',
          // headerBackVisible é controlado dinamicamente dentro de termos.tsx
          // Se quisermos um comportamento padrão aqui:
          // headerBackTitle: Platform.OS === 'ios' ? 'Voltar' : undefined, // Texto do botão de voltar no iOS
        }} 
      />
    </Stack>
  );
}

// Componente raiz que envolve tudo com os Providers
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