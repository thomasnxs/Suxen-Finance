// GastosApp/app/welcome.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import GradientButton from '../components/GradientButton'; // Ajuste o caminho se necessário
import InitialSetupModal from '../components/InitialSetupModal'; // Ajuste o caminho se necessário
import { ThemeColors } from '../constants/colors'; // Ajuste o caminho se necessário
import { InitialDataContextType, useInitialData } from '../contexts/InitialDataContext'; // Importar o hook e o tipo
import { useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho se necessário

// Chave do AsyncStorage para o status de setup completo
const SETUP_COMPLETE_KEY = '@SuxenFinance:setupComplete';
// A USER_NAME_KEY já está definida e usada no InitialDataContext

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = getStyles(colors);

  // Pega as funções e dados do contexto
  const { 
    handleSaveInitialSetup: saveInitialDataInContext, 
    setUserNameInContext, // Função para salvar o nome no contexto e AsyncStorage
    initialAccountBalance, 
    totalInvested,
    creditCardLimit,
    creditCardBill,
    userName: contextUserName // Pega o userName do contexto para preencher o input se já existir
  } = useInitialData() as InitialDataContextType; // Usando asserção de tipo

  const [nameInput, setNameInput] = useState(''); // Estado local para o input de nome
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);

  useEffect(() => {
    // Preenche o input com o nome do contexto se já existir 
    // (ex: se o usuário voltou para esta tela ou se o app foi resetado e o contexto carregou um nome vazio)
    if (contextUserName) {
      setNameInput(contextUserName);
    }
  }, [contextUserName]); // Roda quando o userName do contexto mudar


  const handleStart = async () => {
    if (nameInput.trim() === '') {
      Alert.alert('Nome Necessário', 'Por favor, insira seu nome para começar.');
      return;
    }
    console.log('WelcomeScreen: Nome do Usuário a ser salvo:', nameInput);
    try {
      // Usa a função do contexto para salvar o nome no AsyncStorage e atualizar o estado do contexto
      await setUserNameInContext(nameInput.trim()); 
      console.log('WelcomeScreen: Nome salvo no AsyncStorage e no Contexto.');
      setIsInitialSetupModalVisible(true); // Abre o modal de configuração inicial
    } catch (error) {
      console.error('WelcomeScreen: Erro ao salvar nome:', error);
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
          value={nameInput} 
          onChangeText={setNameInput} 
          autoCapitalize="words"
        />
        <GradientButton
          title="Iniciar Configuração" 
          onPress={handleStart}
          type="primary"
          style={styles.button}
        />
      </View>

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={handleModalSave} 
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
    backgroundColor: colors.background, 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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