// GastosApp/app/(tabs)/preferencias.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import GradientButton from '../../components/GradientButton';
import InitialSetupModal from '../../components/InitialSetupModal';
import { ThemeColors } from '../../constants/colors';
import { InitialDataContextType, useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';

const ALL_APP_DATA_KEYS = [
  '@GastosApp:initialAccountBalance',
  '@GastosApp:totalInvested',
  '@GastosApp:creditCardLimit',
  '@GastosApp:creditCardBill',
  '@GastosApp:transactions',
  '@SuxenFinance:theme',
  '@SuxenFinance:userName',
  '@SuxenFinance:setupComplete'
];

export default function PreferenciasScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { 
    initialAccountBalance, 
    totalInvested, 
    creditCardLimit, 
    creditCardBill,
    handleSaveInitialSetup, 
    isLoadingData, 
    forceReloadAllInitialData // PEGANDO A NOVA FUNÇÃO DO CONTEXTO
  } = useInitialData() as InitialDataContextType; 
  
  const styles = getStyles(colors, isDark);
  const router = useRouter();
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);

  const handleOpenInitialSetup = () => {
    if (isLoadingData) {
      Alert.alert("Aguarde", "Os dados iniciais ainda estão carregando.");
      return;
    }
    setIsInitialSetupModalVisible(true);
  };

  const onModalSave = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    await handleSaveInitialSetup(data); 
    setIsInitialSetupModalVisible(false);
    Alert.alert("Sucesso", "Dados iniciais atualizados!");
  };

  const confirmResetAppData = () => {
    Alert.alert(
      "Resetar Dados do Aplicativo",
      "Tem certeza que deseja apagar todos os dados e voltar para a configuração inicial? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Resetar Tudo", style: "destructive", onPress: handleResetAppData }
      ]
    );
  };

  const handleResetAppData = async () => {
    console.log("Preferencias: Iniciando reset de todos os dados do app.");
    try {
      await AsyncStorage.multiRemove(ALL_APP_DATA_KEYS);
      console.log("Preferencias: Dados do AsyncStorage removidos.");
      
      await forceReloadAllInitialData(); // <<--- CHAMANDO A FUNÇÃO DO CONTEXTO
      console.log("Preferencias: InitialDataContext forçado a recarregar.");

      Alert.alert(
        "Dados Resetados",
        "Todos os dados do aplicativo foram apagados.", // Mensagem simplificada
        [{ text: "OK", onPress: () => router.replace('/welcome') }] 
      );
    } catch (error) {
      console.error("Preferencias: Erro ao resetar dados do app:", error);
      Alert.alert("Erro", "Não foi possível resetar os dados do aplicativo.");
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Preferências' }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Iniciais</Text>
        <GradientButton
          title="Editar Dados Iniciais"
          onPress={handleOpenInitialSetup}
          type="primary"
          style={styles.button}
          disabled={isLoadingData}
        />
        <Text style={styles.descriptionText}>
          Altere seu saldo inicial, total investido, limite do cartão e fatura inicial definida no setup.
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.themeSwitchContainer}>
          <Text style={[styles.themeLabel, !isDark && styles.activeThemeLabel, {color: !isDark ? colors.primary: colors.secondaryText}]}>☀️ Claro</Text>
          <Switch
            trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
            thumbColor={isDark ? colors.primary : colors.switchThumb}
            ios_backgroundColor={colors.border}
            onValueChange={toggleTheme}
            value={isDark}
            style={styles.switch}
          />
          <Text style={[styles.themeLabel, isDark && styles.activeThemeLabel, {color: isDark ? colors.primary: colors.secondaryText}]}>🌙 Escuro</Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplicativo</Text>
        <GradientButton
          title="Resetar Dados do App"
          onPress={confirmResetAppData}
          type="danger"
          style={styles.button}
        />
        <Text style={styles.descriptionText}>
          Apaga todos os seus dados financeiros e configurações, retornando o app ao estado inicial.
        </Text>
      </View>

      {/* InitialSetupModal é renderizado aqui, como antes */}
      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={onModalSave} 
        currentInitialBalance={initialAccountBalance}
        currentInitialInvested={totalInvested}
        currentCreditCardLimit={creditCardLimit}
        currentCreditCardBill={creditCardBill} 
      />
    </ScrollView>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    alignItems: 'stretch', 
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: isDark ? '#000' : '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: isDark ? 3 : 2,
    elevation: isDark ? 4 : 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    marginBottom: 10, 
  },
  descriptionText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
  },
  separator: {
    height: 0, 
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', 
    paddingVertical: 10,
  },
  themeLabel: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  activeThemeLabel: {
    fontWeight: 'bold',
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [], 
  }
});