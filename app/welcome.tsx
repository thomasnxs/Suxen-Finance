// GastosApp/app/welcome.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import InitialSetupModal from '../components/InitialSetupModal';
import { ThemeColors } from '../constants/colors';
import { useInitialData } from '../contexts/InitialDataContext'; // IMPORTAR O HOOK DO CONTEXTO
import { useTheme } from '../contexts/ThemeContext';

const USER_NAME_KEY = '@SuxenFinance:userName';
const SETUP_COMPLETE_KEY = '@SuxenFinance:setupComplete';

export default function WelcomeScreen() {
  const { colors } = useTheme(); // Removido isDark se não usado diretamente para estilos aqui
  const router = useRouter();
  const styles = getStyles(colors);

  // Usar o contexto para salvar os dados iniciais
  const { 
    handleSaveInitialSetup: saveInitialDataInContext, 
    initialAccountBalance, // Para passar como valor atual para o modal, se necessário
    totalInvested,
    creditCardLimit,
    creditCardBill
  } = useInitialData();

  const [userName, setUserName] = useState('');
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);

  // Carregar o nome do usuário se já existir (ex: se ele voltou para esta tela)
  useEffect(() => {
    const loadUserName = async () => {
      const storedName = await AsyncStorage.getItem(USER_NAME_KEY);
      if (storedName) {
        setUserName(storedName);
      }
    };
    loadUserName();
  }, []);


  const handleStart = async () => {
    if (userName.trim() === '') {
      Alert.alert('Nome Necessário', 'Por favor, insira seu nome para começar.');
      return;
    }
    console.log('WelcomeScreen: Nome do Usuário a ser salvo:', userName);
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, userName);
      console.log('WelcomeScreen: Nome salvo no AsyncStorage');
      setIsInitialSetupModalVisible(true); // Abre o modal de configuração inicial
    } catch (error) {
      console.error('WelcomeScreen: Erro ao salvar nome no AsyncStorage:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu nome. Tente novamente.');
    }
  };

  // Esta função será chamada pelo InitialSetupModal
  const handleModalSave = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    console.log('WelcomeScreen: Dados da configuração inicial recebidos do modal:', data);
    try {
      // Chama a função do contexto para salvar os dados financeiros iniciais
      await saveInitialDataInContext(data); 
      console.log('WelcomeScreen: Dados financeiros iniciais salvos via contexto.');

      await AsyncStorage.setItem(SETUP_COMPLETE_KEY, 'true');
      console.log('WelcomeScreen: Setup marcado como completo.');
      
      setIsInitialSetupModalVisible(false);
      router.replace('/(tabs)/home'); 
    } catch (error) {
      console.error('WelcomeScreen: Erro ao salvar configuração inicial completa:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <Stack.Screen options={{ title: 'Bem-vindo(a)!', headerTitleAlign: 'center', headerBackVisible: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Olá!</Text>
        <Text style={styles.subtitle}>Qual é o seu nome?</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome aqui"
          placeholderTextColor={colors.placeholder}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="words"
        />
        <GradientButton
          title="Iniciar Configuração" // Título do botão atualizado
          onPress={handleStart}
          type="primary"
          style={styles.button}
        />
      </View>

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={handleModalSave} // Chama a função que usa o contexto
        // Passando os valores atuais do contexto (que devem ser 0 após um reset)
        // ou os valores da última configuração se o usuário estiver editando via "Preferências"
        // No fluxo de welcome após um reset, esperamos que sejam 0.
        currentInitialBalance={initialAccountBalance}
        currentInitialInvested={totalInvested}
        currentCreditCardLimit={creditCardLimit}
        currentCreditCardBill={creditCardBill}
      />
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: colors.background, // Fundo para KAV
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor removido daqui, já está no KAV
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.secondaryText,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 30,
  },
  button: {
    width: '100%', 
  }
});