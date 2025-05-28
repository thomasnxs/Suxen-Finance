// GastosApp/app/(tabs)/preferencias.tsx
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import GradientButton from '../../components/GradientButton';
import InitialSetupModal from '../../components/InitialSetupModal';
import { ThemeColors } from '../../constants/colors';
import { useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function PreferenciasScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { 
    initialAccountBalance, 
    totalInvested, 
    creditCardLimit, 
    creditCardBill, // Fatura inicial/configurada
    handleSaveInitialSetup,
    isLoadingData 
  } = useInitialData();
  
  const styles = getStyles(colors, isDark);

  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);

  const handleOpenInitialSetup = () => {
    if (isLoadingData) {
      // Talvez mostrar um feedback ou desabilitar o botão se os dados ainda estão carregando
      console.log("Dados iniciais ainda carregando, aguarde para editar.");
      return;
    }
    setIsInitialSetupModalVisible(true);
  };

  // A função onSaveSetup do modal chamará diretamente handleSaveInitialSetup do contexto
  const onModalSave = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    await handleSaveInitialSetup(data); // Chama a função do contexto
    setIsInitialSetupModalVisible(false);
    // Não precisa de navegação aqui, pois o modal fecha e permanece na tela de Preferências
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
          disabled={isLoadingData} // Desabilita o botão se os dados do contexto estiverem carregando
        />
        <Text style={styles.descriptionText}>
          Altere seu saldo inicial, total investido, limite do cartão e fatura inicial.
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.themeSwitchContainer}>
          <Text style={[styles.themeLabel, !isDark && styles.activeThemeLabel]}>☀️ Claro</Text>
          <Switch
            trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
            thumbColor={isDark ? colors.primary : colors.switchThumb}
            ios_backgroundColor={colors.border} // Para iOS
            onValueChange={toggleTheme}
            value={isDark}
            style={styles.switch}
          />
          <Text style={[styles.themeLabel, isDark && styles.activeThemeLabel]}>🌙 Escuro</Text>
        </View>
      </View>

      {/* Outras preferências podem ser adicionadas aqui no futuro */}

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={onModalSave} // Passa a função que chama o handleSaveInitialSetup do contexto
        currentInitialBalance={initialAccountBalance}
        currentInitialInvested={totalInvested}
        currentCreditCardLimit={creditCardLimit}
        currentCreditCardBill={creditCardBill} // Passa a fatura inicial/configurada do contexto
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
    alignItems: 'stretch', // Para que os botões e seções ocupem a largura
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
    marginBottom: 10, // Espaço abaixo do botão
  },
  descriptionText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10, // Espaço entre as seções, se não usar o marginbottom da section
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Espaça os elementos
    paddingVertical: 10,
  },
  themeLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    marginHorizontal: 10,
  },
  activeThemeLabel: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [], // Ajuste opcional para iOS
  }
});