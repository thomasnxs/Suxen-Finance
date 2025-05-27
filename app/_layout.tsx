// GastosApp/app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext'; // Importar ThemeProvider

// Removido ThemeToggleButton daqui, pois ele é melhor gerenciado em index.tsx
// junto com os outros botões de headerRight que dependem do estado da tela.

// Não há necessidade de RootLayoutNav separado se só temos uma configuração de Stack.
// Podemos simplificar.

export default function RootLayout() {
  return (
    // 1. ThemeProvider envolve tudo para que o tema esteja disponível em todo o app.
    <ThemeProvider>
      {/* 2. GestureHandlerRootView é importante para gestos de navegação. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* 3. Stack define o tipo de navegação. */}
        <Stack>
          <Stack.Screen
            name="index" // Corresponde ao arquivo app/index.tsx
            options={{
              title: '', // Título do header nativo removido (conforme solicitado)
              // As opções de header (headerLeft, headerRight, headerStyle, headerTintColor)
              // são agora configuradas dinamicamente em app/index.tsx usando navigation.setOptions()
              // para que possam acessar o contexto do tema para estilização e o botão de toggle.
              // Se você quisesse um headerStyle estático aqui, poderia ser:
              // headerStyle: { backgroundColor: lightColors.headerBackground }, // Exemplo, não ideal sem acesso ao tema
            }}
          />
          {/* Adicione outras Stack.Screen aqui para futuras telas */}
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}