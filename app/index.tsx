// GastosApp/app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, SplashScreen } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Para estilizar o loading

const SETUP_COMPLETE_KEY = '@SuxenFinance:setupComplete';

export default function AppRootOrWelcome() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null); // null = carregando, true/false = estado definido
  const { colors } = useTheme(); // Para o ActivityIndicator

  useEffect(() => {
    // Impedir que a splash screen desapareça automaticamente até termos decidido a rota
    SplashScreen.preventAutoHideAsync(); 

    const checkSetupStatus = async () => {
      try {
        const setupStatus = await AsyncStorage.getItem(SETUP_COMPLETE_KEY);
        if (setupStatus === 'true') {
          setIsSetupComplete(true);
        } else {
          setIsSetupComplete(false);
        }
      } catch (e) {
        console.error("Erro ao verificar status do setup:", e);
        setIsSetupComplete(false); // Em caso de erro, assume que o setup não foi feito
      }
    };

    checkSetupStatus();
  }, []);

  useEffect(() => {
    if (isSetupComplete !== null) {
      SplashScreen.hideAsync(); // Agora podemos esconder a splash screen
    }
  }, [isSetupComplete]);

  if (isSetupComplete === null) {
    // Tela de carregamento enquanto verifica o AsyncStorage
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors?.background || '#ffffff' }}>
        <ActivityIndicator size="large" color={colors?.primary || '#0000ff'} />
      </View>
    );
  }

  if (isSetupComplete) {
    // Se o setup está completo, redireciona para a aba home
    return <Redirect href="/(tabs)/home" />;
  } else {
    // Se o setup não está completo, redireciona para a tela de boas-vindas
    return <Redirect href="/welcome" />;
  }
}