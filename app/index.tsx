// GastosApp/app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, SplashScreen } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'; // Adicionado Text e StyleSheet
import { useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho se seu ThemeContext estiver em outro lugar

// Chaves do AsyncStorage com o novo prefixo para consistência
const TERMOS_ACEITOS_KEY = '@GasteiApp:termosAceitos';
const SETUP_COMPLETE_KEY = '@GasteiApp:setupComplete';

export default function AppRootRouter() {
  const [status, setStatus] = useState<'loading' | 'needsTerms' | 'needsWelcome' | 'goToHome'>('loading');
  const { colors } = useTheme(); // Para estilizar o loading

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const checkAppStatus = async () => {
      let termsAccepted = false;
      let setupComplete = false;

      try {
        const termsAcceptedValue = await AsyncStorage.getItem(TERMOS_ACEITOS_KEY);
        if (termsAcceptedValue === 'true') {
          termsAccepted = true;
        }
        console.log(`[AppRootRouter] Termos aceitos? ${termsAcceptedValue}`);

        // Só verifica o setup se os termos já foram aceitos
        if (termsAccepted) {
          const setupCompleteValue = await AsyncStorage.getItem(SETUP_COMPLETE_KEY);
          if (setupCompleteValue === 'true') {
            setupComplete = true;
          }
          console.log(`[AppRootRouter] Setup completo? ${setupCompleteValue}`);
        }
      } catch (e) {
        console.error("[AppRootRouter] Erro ao ler AsyncStorage para status do app:", e);
        // Em caso de erro, força o fluxo de termos para segurança, pois não podemos assumir nada.
        setStatus('needsTerms');
        return;
      }

      if (!termsAccepted) {
        console.log("[AppRootRouter] Decisão: Redirecionar para /termos");
        setStatus('needsTerms');
      } else if (!setupComplete) {
        console.log("[AppRootRouter] Decisão: Termos aceitos, redirecionar para /welcome");
        setStatus('needsWelcome');
      } else {
        console.log("[AppRootRouter] Decisão: Termos aceitos e setup completo. Redirecionar para /home");
        setStatus('goToHome');
      }
    };

    checkAppStatus();
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  useEffect(() => {
    // Esconde a splash screen assim que o status de carregamento inicial for resolvido
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  // Estilos definidos aqui para o componente de Loading e Fallback
  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors?.background || '#ffffff', // Fallback de cor
    },
    fallbackText: {
      color: colors?.text || '#000000', // Fallback de cor
      fontSize: 16,
    }
  });

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors?.primary || '#0000ff'} />
      </View>
    );
  }

  if (status === 'needsTerms') {
    return <Redirect href="/termos" />;
  }

  if (status === 'needsWelcome') {
    return <Redirect href="/welcome" />;
  }

  if (status === 'goToHome') {
    return <Redirect href="/(tabs)/home" />;
  }

  // Fallback para um estado inesperado (teoricamente não deve ser alcançado)
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.fallbackText}>Erro inesperado no roteamento inicial.</Text>
    </View>
  );
}