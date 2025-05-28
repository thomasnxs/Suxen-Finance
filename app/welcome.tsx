// GastosApp/app/welcome.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router'; // useRouter para navegação
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import GradientButton from '../components/GradientButton'; // Ajuste o caminho se necessário
import InitialSetupModal from '../components/InitialSetupModal'; // Ajuste o caminho se necessário
import { ThemeColors } from '../constants/colors'; // Ajuste o caminho se necessário
import { useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho se necessário

// Chaves do AsyncStorage
const USER_NAME_KEY = '@SuxenFinance:userName';
const SETUP_COMPLETE_KEY = '@SuxenFinance:setupComplete';

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter(); // Para navegação
  const styles = getStyles(colors);

  const [userName, setUserName] = useState('');
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);

  // Estados para passar ao InitialSetupModal (serão carregados do context ou storage mais tarde)
  // Por agora, como estamos chamando pela primeira vez, podem ser zero.
  // Na próxima etapa, integraremos com o InitialDataContext para valores atuais.
  const [currentValuesForModal, setCurrentValuesForModal] = useState({
    balance: 0,
    invested: 0,
    limit: 0,
    initialBill: 0,
  });

  const handleStart = async () => {
    if (userName.trim() === '') {
      Alert.alert('Nome Necessário', 'Por favor, insira seu nome para começar.');
      return;
    }
    console.log('Nome do Usuário:', userName);
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, userName);
      console.log('Nome salvo no AsyncStorage');
      // Abrir o modal de configuração inicial
      setIsInitialSetupModalVisible(true);
    } catch (error) {
      console.error('Erro ao salvar nome no AsyncStorage:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu nome. Tente novamente.');
    }
  };

  const handleSaveInitialSetup = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    console.log('Dados da configuração inicial recebidos:', data);
    // Aqui salvaremos os dados financeiros e marcaremos o setup como completo.
    // A lógica de salvar os dados financeiros já está no InitialDataContext,
    // mas como ainda não o integramos aqui, vamos simular.
    try {
      // Simulação de salvar os dados (na próxima etapa usaremos o context)
      await AsyncStorage.setItem('@GastosApp:initialAccountBalance', JSON.stringify(data.balance));
      await AsyncStorage.setItem('@GastosApp:totalInvested', JSON.stringify(data.invested));
      await AsyncStorage.setItem('@GastosApp:creditCardLimit', JSON.stringify(data.limit));
      await AsyncStorage.setItem('@GastosApp:creditCardBill', JSON.stringify(data.initialBill));
      
      await AsyncStorage.setItem(SETUP_COMPLETE_KEY, 'true');
      console.log('Setup marcado como completo e dados salvos.');
      setIsInitialSetupModalVisible(false);
      // Navegar para as abas, substituindo a tela de welcome para não poder voltar
      router.replace('/(tabs)/home'); 
    } catch (error) {
      console.error('Erro ao salvar configuração inicial completa:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      {/* Configura o header para esta tela específica */}
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
          title="Iniciar"
          onPress={handleStart}
          type="primary"
          style={styles.button}
        />
      </View>

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={handleSaveInitialSetup}
        // Passando valores zerados ou os últimos valores se quiséssemos permitir edição aqui
        // Na próxima etapa, esses valores virão do InitialDataContext
        currentInitialBalance={currentValuesForModal.balance}
        currentInitialInvested={currentValuesForModal.invested}
        currentCreditCardLimit={currentValuesForModal.limit}
        currentCreditCardBill={currentValuesForModal.initialBill}
      />
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
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
    width: '100%', // Para o botão ocupar a largura total
  }
});