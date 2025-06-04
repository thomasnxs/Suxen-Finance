// GastosApp/app/(tabs)/preferencias.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';

import GradientButton from '../../components/GradientButton';
import InitialSetupModal from '../../components/InitialSetupModal';
import { ThemeColors } from '../../constants/colors';
import { InitialDataContextType, useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';

// ATENÇÃO: Revise esta lista cuidadosamente.
// Adicionadas as novas chaves e atualizada a de setup.
// As chaves @SuxenFinance e @GastosApp podem ser padronizadas para @GasteiApp: em um próximo passo.
const ALL_APP_DATA_KEYS = [
  // Chaves financeiras - manter ou padronizar para @GasteiApp:
  '@GastosApp:initialAccountBalance',
  '@GastosApp:totalInvested',
  '@GastosApp:creditCardLimit',
  '@GastosApp:creditCardBill',
  '@GastosApp:transactions',
  // Chaves de configuração legadas/atuais - idealmente padronizar para @GasteiApp:
  '@SuxenFinance:theme',    // -> Deveria ser @GasteiApp:theme
  '@SuxenFinance:userName', // -> Deveria ser @GasteiApp:userName
  // Chaves do novo fluxo
  '@GasteiApp:setupComplete', // ATUALIZADA
  '@GasteiApp:termosAceitos'  // NOVA
];

export default function PreferenciasScreen() {
  const { colors, isDark, toggleTheme, setTheme } = useTheme(); // Adicionado setTheme se quiser um seletor mais explícito
  const { 
    initialAccountBalance, 
    totalInvested, 
    creditCardLimit, 
    creditCardBill,
    handleSaveInitialSetup, 
    isLoadingData, 
    forceReloadAllInitialData,
    // Adicione setUserNameInContext se for padronizar a chave de userName e quiser resetá-la aqui
  } = useInitialData() as InitialDataContextType; 
  
  const styles = getThemedStyles(colors, isDark);
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
    console.log("Preferencias: Iniciando reset de todos os dados do app. Chaves a serem removidas:", ALL_APP_DATA_KEYS);
    try {
      // Limpa os contextos ANTES de apagar do AsyncStorage e redirecionar
      // Para ThemeContext (reverte para o tema do sistema ou 'light')
      await AsyncStorage.removeItem('@GasteiApp:theme'); // Ou a chave que você usa para o tema
      setTheme(Platform.OS === 'ios' ? (useColorScheme() ?? 'light') : 'light'); // Reajusta o tema na UI

      // Para InitialDataContext
      await forceReloadAllInitialData(); // Isso já tentará ler do AsyncStorage (que estará vazio para esses itens)
                                        // e setará os valores para os defaults (0, string vazia)

      // Remove todas as chaves especificadas
      await AsyncStorage.multiRemove(ALL_APP_DATA_KEYS);
      console.log("Preferencias: Dados do AsyncStorage removidos.");
      
      // O forceReloadAllInitialData já deve ter resetado o estado do contexto para os padrões.
      // Se o nome do usuário não for resetado por forceReloadAllInitialData (porque é uma chave separada),
      // você precisaria chamar uma função para resetá-lo no contexto ou diretamente aqui:
      // if (setUserNameInContext) { // Supondo que você adicione setUserNameInContext ao contexto
      //   await setUserNameInContext('');
      // }


      Alert.alert(
        "Dados Resetados",
        "Todos os dados do aplicativo foram apagados e as configurações revertidas.",
        [{ text: "OK", onPress: () => router.replace('/') }] // Redireciona para o index, que fará o fluxo de termos -> welcome
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
          Altere seu saldo inicial, total investido, limite do cartão e fatura inicial.
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

      {/* NOVA SEÇÃO PARA TERMOS E OUTRAS INFORMAÇÕES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre e Legal</Text>
        <GradientButton
          title="Termos de Uso e Privacidade"
          onPress={() => router.push({ pathname: '/termos', params: { source: 'preferencias' }})}
          type="default" // Ou um 'info' se você tiver
          style={styles.button}
        />
        <Text style={styles.descriptionText}>
          Leia novamente os termos de uso e a política de privacidade do aplicativo.
        </Text>
        {/* Futuramente, aqui pode entrar "Apoie o Desenvolvedor", "Backup/Restore", etc. */}
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
          Apaga todos os seus dados financeiros e configurações, retornando o app ao estado inicial (termos de uso).
        </Text>
      </View>

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

// --- Função getThemedStyles (COMO ESTAVA ANTES, COM OS ESTILOS NECESSÁRIOS) ---
// Certifique-se de que esta função está completa e correta
const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
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
    shadowColor: isDark ? '#000' : '#555', // Ajustado para usar isDark
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.15,   // Ajustado para usar isDark
    shadowRadius: isDark ? 3 : 2,        // Ajustado para usar isDark
    elevation: isDark ? 4 : 3,           // Ajustado para usar isDark
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
  separator: { // Se quiser uma linha visível, ajuste height e adicione backgroundColor
    height: 0, 
    marginVertical: 10, // Apenas para espaçamento se height for 0
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
    // A cor será condicional no JSX
  },
  activeThemeLabel: {
    fontWeight: 'bold',
    // A cor primária será aplicada no JSX
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [], 
  }
});