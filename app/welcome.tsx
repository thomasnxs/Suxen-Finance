// GastosApp/app/welcome.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import GradientButton from '../components/GradientButton'; // Ajuste o caminho se necessário
import InitialSetupModal from '../components/InitialSetupModal'; // Ajuste o caminho se necessário
import { ThemeColors } from '../constants/colors'; // Ajuste o caminho se necessário
import { InitialDataContextType, useInitialData } from '../contexts/InitialDataContext';
import { useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho se necessário

// Chave do AsyncStorage para o status de setup completo (PADRONIZADA)
const SETUP_COMPLETE_KEY = '@GasteiApp:setupComplete';
// A chave para userName é gerenciada pelo InitialDataContext (@SuxenFinance:userName ou @GasteiApp:userName)

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const { 
    handleSaveInitialSetup: saveContextInitialData, // Renomeado para clareza
    setUserNameInContext,
    userName: contextUserName, // Para pré-preencher, se disponível
    // Pegando os valores atuais do contexto para passar ao InitialSetupModal
    initialAccountBalance,
    totalInvested,
    creditCardLimit,
    creditCardBill,
  } = useInitialData() as InitialDataContextType; 

  const styles = getThemedStyles(colors); // getThemedStyles precisa ser definida abaixo

  const [nameInput, setNameInput] = useState('');
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);

  useEffect(() => {
    // Preenche o input com o nome do contexto se já existir
    if (contextUserName) {
      setNameInput(contextUserName);
    }
  }, [contextUserName]);


  const handleStartConfiguration = async () => {
    if (nameInput.trim() === '') {
      Alert.alert('Nome Necessário', 'Por favor, insira seu nome para começar.');
      return;
    }
    try {
      await setUserNameInContext(nameInput.trim()); 
      console.log('[WelcomeScreen] Nome salvo no contexto e AsyncStorage.');
      setIsInitialSetupModalVisible(true); // Abre o modal de configuração inicial
    } catch (error) {
      console.error('[WelcomeScreen] Erro ao salvar nome:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu nome. Tente novamente.');
    }
  };

  // Esta função será chamada pelo InitialSetupModal através da prop onSaveSetup
  const handleSaveSetupData = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    console.log('[WelcomeScreen] Dados da configuração inicial recebidos do modal:', data);
    try {
      // Salva os dados financeiros no contexto (e AsyncStorage via contexto)
      await saveContextInitialData(data); 
      console.log('[WelcomeScreen] Dados financeiros iniciais salvos via contexto.');

      // Marca o setup como completo no AsyncStorage
      await AsyncStorage.setItem(SETUP_COMPLETE_KEY, 'true');
      console.log('[WelcomeScreen] Setup marcado como completo com a chave:', SETUP_COMPLETE_KEY);
      
      setIsInitialSetupModalVisible(false);
      // Redireciona para a home, substituindo a tela de welcome/setup do histórico de navegação
      router.replace('/(tabs)/home'); 
    } catch (error) {
      console.error('[WelcomeScreen] Erro ao salvar configuração inicial completa:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <Stack.Screen 
        options={{ 
          title: 'Bem-vindo(a) ao Gastei!', 
          headerTitleAlign: 'center', 
          headerBackVisible: false // Não deve haver como voltar daqui no fluxo inicial
        }} 
      />
      <View style={styles.container}>
        <Text style={styles.title}>Olá!</Text>
        <Text style={styles.subtitle}>Para começarmos, qual é o seu nome?</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome aqui"
          placeholderTextColor={colors.placeholder}
          value={nameInput} 
          onChangeText={setNameInput} 
          autoCapitalize="words"
          onSubmitEditing={handleStartConfiguration} // Permite submeter com "Enter" do teclado
        />
        <GradientButton
          title="Iniciar Configuração" 
          onPress={handleStartConfiguration}
          type="primary"
          style={styles.button}
        />
      </View>

      {/* Modal de Configuração Inicial */}
      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={handleSaveSetupData} // Passando a função correta
        // Passando os valores atuais do contexto (que seriam 0 na primeira vez)
        // para o modal, caso ele precise deles como default ou para edição.
        currentInitialBalance={initialAccountBalance} 
        currentInitialInvested={totalInvested}       
        currentCreditCardLimit={creditCardLimit}     
        currentCreditCardBill={creditCardBill}       
      />
    </KeyboardAvoidingView>
  );
}

// Definição da função de estilos (adapte conforme seus estilos reais)
const getThemedStyles = (colors: ThemeColors) => StyleSheet.create({
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