// GastosApp/app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, SplashScreen } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho se necessário

const TERMOS_ACEITOS_KEY = '@GasteiApp:termosAceitos';
const SETUP_COMPLETE_KEY = '@GasteiApp:setupComplete';

export default function AppRootRouter() {
  const [status, setStatus] = useState<'loading' | 'needsTerms' | 'needsWelcome' | 'goToHome'>('loading');
  const { colors } = useTheme();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    console.log("[AppRootRouter] preventAutoHideAsync chamado.");

    const checkAppStatusAndHideSplash = async () => {
      let termsAccepted = false;
      let setupComplete = false;
      let finalStatus: 'needsTerms' | 'needsWelcome' | 'goToHome' = 'needsTerms'; // Default para o fluxo inicial

      try {
        const termsAcceptedValue = await AsyncStorage.getItem(TERMOS_ACEITOS_KEY);
        if (termsAcceptedValue === 'true') {
          termsAccepted = true;
        }
        console.log(`[AppRootRouter] Termos aceitos (Storage)? ${termsAcceptedValue}`);

        if (termsAccepted) {
          const setupCompleteValue = await AsyncStorage.getItem(SETUP_COMPLETE_KEY);
          if (setupCompleteValue === 'true') {
            setupComplete = true;
          }
          console.log(`[AppRootRouter] Setup completo (Storage)? ${setupCompleteValue}`);
        }
      } catch (e) {
        console.error("[AppRootRouter] Erro ao ler AsyncStorage:", e);
        // Em caso de erro, o default 'needsTerms' será usado, e a splash escondida abaixo
      }

      // Determina o status final
      if (!termsAccepted) {
        finalStatus = 'needsTerms';
      } else if (!setupComplete) {
        finalStatus = 'needsWelcome';
      } else {
        finalStatus = 'goToHome';
      }
      
      // Esconde a splash ANTES de definir o estado que causa o redirect
      // Isso pode ajudar a evitar um "flash" da tela de loading se o AsyncStorage for muito rápido
      await SplashScreen.hideAsync();
      console.log("[AppRootRouter] Splash nativa escondida.");
      
      setStatus(finalStatus);
      console.log(`[AppRootRouter] Status final definido para: ${finalStatus}`);
    };

    checkAppStatusAndHideSplash();
  }, []); // Roda apenas uma vez na montagem

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors?.background || '#FFFFFF', // Fallback seguro
    },
    text: { // Renomeado de fallbackText para apenas text
      color: colors?.text || '#000000', // Fallback seguro
      fontSize: 16,
    }
  });

  // Enquanto o status é 'loading' (antes do checkAppStatusAndHideSplash definir um estado final),
  // mostramos o ActivityIndicator.
  if (status === 'loading') {
    console.log("[AppRootRouter] Renderizando: Tela de Loading (ActivityIndicator).");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors?.primary || '#0000FF'} />
      </View>
    );
  }

  // Redirecionamentos baseados no status final
  if (status === 'needsTerms') {
    console.log("[AppRootRouter] Renderizando: Redirect para /termos.");
    return <Redirect href="/termos" />;
  }
  if (status === 'needsWelcome') {
    console.log("[AppRootRouter] Renderizando: Redirect para /welcome.");
    return <Redirect href="/welcome" />;
  }
  if (status === 'goToHome') {
    console.log("[AppRootRouter] Renderizando: Redirect para /(tabs)/home.");
    return <Redirect href="/(tabs)/home" />;
  }
  
  // Fallback (não deve ser alcançado em condições normais)
  console.log("[AppRootRouter] Renderizando: Tela de Fallback (erro de roteamento).");
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.text}>Erro no roteamento.</Text>
    </View>
  );
}