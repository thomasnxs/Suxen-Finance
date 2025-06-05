// GastosApp/app/(tabs)/preferencias.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';

import GradientButton from '../../components/GradientButton';
import InitialSetupModal from '../../components/InitialSetupModal';
import { ThemeColors } from '../../constants/colors';
import { InitialDataContextType, useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';

// Chaves do AsyncStorage - É VITAL que esta lista corresponda EXATAMENTE
// às chaves que você quer que sejam parte do backup/restauração e do reset.
// Considere padronizar todas para @GasteiApp: no futuro.
const ALL_APP_DATA_KEYS = [
  '@GastosApp:initialAccountBalance',
  '@GastosApp:totalInvested',
  '@GastosApp:creditCardLimit',
  '@GastosApp:creditCardBill',
  '@GastosApp:transactions',
  '@SuxenFinance:theme', // Chave atual do tema
  '@SuxenFinance:userName', // Chave atual do nome de usuário
  '@GasteiApp:setupComplete',
  '@GasteiApp:termosAceitos'
];
// Chave específica do tema, como definida no seu ThemeContext (e em ALL_APP_DATA_KEYS)
const THEME_KEY_IN_BACKUP = '@SuxenFinance:theme'; // Ajuste se você padronizou para @GasteiApp:theme

export default function PreferenciasScreen() {
  const { colors, isDark, toggleTheme, setTheme } = useTheme();
  const { 
    initialAccountBalance, 
    totalInvested, 
    creditCardLimit, 
    creditCardBill,
    handleSaveInitialSetup, 
    isLoadingData, 
    forceReloadAllInitialData,
  } = useInitialData() as InitialDataContextType; 
  
  const router = useRouter();
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const systemColorScheme = useColorScheme(); 
  const styles = getThemedStyles(colors, isDark);

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
    console.log("Preferencias: Iniciando reset. Chaves a remover:", ALL_APP_DATA_KEYS);
    try {
      await AsyncStorage.multiRemove(ALL_APP_DATA_KEYS);
      console.log("Preferencias: Dados do AsyncStorage removidos.");

      if (forceReloadAllInitialData) {
        await forceReloadAllInitialData();
      }
      const themeToRestore = Platform.OS === 'ios' ? (systemColorScheme ?? 'light') : 'light';
      if (setTheme) {
        await setTheme(themeToRestore); 
      }
      
      Alert.alert(
        "Dados Resetados",
        "Todos os dados do aplicativo foram apagados.",
        [{ text: "OK", onPress: () => router.replace('/') }] 
      );
    } catch (error) {
      console.error("Preferencias: Erro ao resetar dados do app:", error);
      Alert.alert("Erro", "Não foi possível resetar os dados do aplicativo.");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const storedDataArray = await AsyncStorage.multiGet(ALL_APP_DATA_KEYS);
      const dataToExport: { [key: string]: any } = {};
      
      storedDataArray.forEach(([key, value]) => {
        if (value !== null) {
          try {
            dataToExport[key] = JSON.parse(value); 
          } catch (e) {
            dataToExport[key] = value; 
          }
        }
      });

      if (Object.keys(dataToExport).length === 0) {
        Alert.alert("Sem Dados", "Não há dados para exportar.");
        setIsExporting(false);
        return;
      }

      const backupObject = {
        appName: Constants.expoConfig?.name || "GasteiAppBackup",
        appVersion: Constants.expoConfig?.version || "1.0.0",
        exportDate: new Date().toISOString(),
        platform: Platform.OS,
        data: dataToExport,
      };

      const jsonString = JSON.stringify(backupObject, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
      const fileName = `gastei-backup-${timestamp}.json`;
      const fileUri = FileSystem.cacheDirectory + fileName; 

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Exportação Concluída", `Seus dados foram salvos em: ${fileUri}\n\nO compartilhamento não está disponível, acesse o arquivo manualmente ou tente mais tarde.`);
        setIsExporting(false);
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Salvar backup do Gastei!',
        UTI: 'public.json', 
      });
    } catch (error: any) {
      console.error("Erro ao exportar dados:", error);
      Alert.alert("Erro na Exportação", `Não foi possível exportar seus dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json', 
        copyToCacheDirectory: true, 
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("Seleção de arquivo cancelada ou nenhum arquivo selecionado.");
        setIsImporting(false);
        return;
      }

      const pickedFile = result.assets[0];
      const fileContentString = await FileSystem.readAsStringAsync(pickedFile.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const backupObject = JSON.parse(fileContentString);

      if (
        !backupObject || typeof backupObject !== 'object' ||
        backupObject.appName !== (Constants.expoConfig?.name || "GasteiAppBackup") ||
        !backupObject.data || typeof backupObject.data !== 'object'
      ) {
        Alert.alert("Arquivo Inválido", "O arquivo selecionado não parece ser um backup válido do Gastei!.");
        setIsImporting(false);
        return;
      }
      
      Alert.alert(
        "Restaurar Backup",
        "Tem certeza que deseja restaurar os dados deste backup? Todos os dados atuais no aplicativo serão substituídos. Esta ação não pode ser desfeita.",
        [
          { text: "Cancelar", style: "cancel", onPress: () => setIsImporting(false) },
          { 
            text: "Restaurar", 
            style: "destructive", 
            onPress: async () => {
              try {
                setIsImporting(true); 
                console.log("Usuário confirmou a restauração. Dados a serem restaurados:", backupObject.data);

                const dataFromBackup = backupObject.data as { [key: string]: any };
                const multiSetPairs: [string, string][] = [];

                // Prepara os dados para o AsyncStorage (tudo deve ser string)
                for (const key in dataFromBackup) {
                  if (Object.prototype.hasOwnProperty.call(dataFromBackup, key) && ALL_APP_DATA_KEYS.includes(key)) { // Restaura apenas chaves conhecidas
                    const value = dataFromBackup[key];
                    multiSetPairs.push([key, JSON.stringify(value)]); // Stringifica todos os valores
                  }
                }
                
                // Opcional: Limpar TODAS as chaves conhecidas ANTES de restaurar, para garantir estado limpo.
                // await AsyncStorage.multiRemove(ALL_APP_DATA_KEYS); 
                // console.log("Chaves antigas removidas antes da restauração.");

                await AsyncStorage.multiSet(multiSetPairs);
                console.log("Dados do backup restaurados no AsyncStorage.");

                if (forceReloadAllInitialData) {
                  await forceReloadAllInitialData();
                  console.log("InitialDataContext recarregado.");
                }

                const themeValueFromBackup = dataFromBackup[THEME_KEY_IN_BACKUP];
                if (setTheme && (themeValueFromBackup === 'dark' || themeValueFromBackup === 'light')) { 
                  // Se o valor no backup já é 'dark' ou 'light' (porque foi JSON.parse na exportação)
                  await setTheme(themeValueFromBackup);
                  console.log("Tema restaurado para:", themeValueFromBackup);
                } else {
                  const themeToRestoreDefault = Platform.OS === 'ios' ? (systemColorScheme ?? 'light') : 'light';
                  await setTheme(themeToRestoreDefault);
                  console.log("Tema do backup não encontrado ou inválido, usando tema padrão:", themeToRestoreDefault);
                }

                Alert.alert(
                  "Restauração Concluída", 
                  "Seus dados foram restaurados com sucesso! O aplicativo será reiniciado para aplicar todas as alterações.",
                  [{ text: "OK", onPress: () => router.replace('/') }] 
                );

              } catch (restoreError: any) {
                console.error("Erro ao restaurar dados do backup:", restoreError);
                Alert.alert("Erro na Restauração", `Não foi possível restaurar os dados: ${restoreError.message || 'Erro desconhecido'}`);
              } finally {
                setIsImporting(false);
              }
            } 
          }
        ]
      );

    } catch (error: any) {
      console.error("Erro durante o processo de importação:", error);
      Alert.alert("Erro na Importação", `Não foi possível processar o arquivo de backup: ${error.message || 'Erro desconhecido'}`);
      setIsImporting(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Preferências' }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Iniciais</Text>
        <GradientButton title="Editar Dados Iniciais" onPress={handleOpenInitialSetup} type="primary" style={styles.button} disabled={isLoadingData || isExporting || isImporting}/>
        <Text style={styles.descriptionText}>Altere seu saldo inicial, total investido, limite do cartão e fatura inicial.</Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.themeSwitchContainer}>
          <Text style={[styles.themeLabel, !isDark && styles.activeThemeLabel, {color: !isDark ? colors.primary: colors.secondaryText}]}>☀️ Claro</Text>
          <Switch trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }} thumbColor={isDark ? colors.primary : colors.switchThumb} ios_backgroundColor={colors.border} onValueChange={toggleTheme} value={isDark} style={styles.switchStyle} />
          <Text style={[styles.themeLabel, isDark && styles.activeThemeLabel, {color: isDark ? colors.primary: colors.secondaryText}]}>🌙 Escuro</Text>
        </View>
      </View>
      <View style={styles.separator} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre e Legal</Text>
        <GradientButton title="Termos de Uso e Privacidade" onPress={() => router.push({ pathname: '/termos', params: { source: 'preferencias' }})} type="default" style={styles.button} disabled={isExporting || isImporting}/>
        <Text style={styles.descriptionText}>Leia novamente os termos de uso e a política de privacidade do aplicativo.</Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup e Restauração</Text>
        <GradientButton
          title={isExporting ? "Exportando..." : "Exportar Meus Dados"}
          onPress={handleExportData} type="info" style={styles.button}
          disabled={isExporting || isImporting || isLoadingData}
          icon={isExporting ? <ActivityIndicator size="small" color={colors.card} style={{marginRight: 8}} /> : null} />
        <Text style={styles.descriptionText}>Salve um arquivo de backup com todas as suas transações e configurações.</Text>
        
        <View style={{marginTop: 15}} /> 
        <GradientButton
          title={isImporting ? "Restaurando..." : "Importar Dados de Backup"}
          onPress={handleImportData} type="success" style={styles.button}
          disabled={isExporting || isImporting || isLoadingData}
          icon={isImporting ? <ActivityIndicator size="small" color={colors.card} style={{marginRight: 8}} /> : null} />
        <Text style={styles.descriptionText}>Restaure seus dados a partir de um arquivo de backup. Isso sobrescreverá os dados atuais.</Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplicativo</Text>
        <GradientButton title="Resetar Dados do App" onPress={confirmResetAppData} type="danger" style={styles.button} disabled={isExporting || isImporting}/>
        <Text style={styles.descriptionText}>Apaga todos os seus dados financeiros e configurações, retornando o app ao estado inicial.</Text>
      </View>

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={onModalSave} 
        currentInitialBalance={initialAccountBalance}
        currentInitialInvested={totalInvested}
        currentCreditCardLimit={creditCardLimit}
        currentCreditCardBill={creditCardBill} />
    </ScrollView>
  );
}

const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, alignItems: 'stretch' },
  section: { backgroundColor: colors.card, borderRadius: 10, padding: 20, marginBottom: 20, shadowColor: isDark ? '#000' : '#555', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.15, shadowRadius: isDark ? 3 : 2, elevation: isDark ? 4 : 3 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' },
  button: { marginBottom: 10 },
  descriptionText: { fontSize: 14, color: colors.secondaryText, textAlign: 'center', marginTop: 5 },
  separator: { height: 0, marginVertical: 10 },
  themeSwitchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  themeLabel: { fontSize: 16, marginHorizontal: 10 },
  activeThemeLabel: { fontWeight: 'bold' },
  switchStyle: { transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLabel: { fontSize: 16, color: colors.secondaryText },
  summaryAmount: { fontSize: 16, fontWeight: 'bold' },
  summaryDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingLeft: 15, borderBottomWidth: 1, borderBottomColor: colors.border, },
  summaryDetailLabel: { fontSize: 14, color: colors.secondaryText },
  summaryDetailAmount: { fontSize: 14, fontWeight: '500' },
  categoryExpensesContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  categoryExpensesTitle: { fontSize: 14, fontWeight: '600', color: colors.secondaryText, marginBottom: 4, paddingLeft: 15 },
  summaryCategoryLabel: { fontSize: 14, color: colors.secondaryText, flex: 1 },
  summaryCategoryAmount: { fontSize: 14, fontWeight: '500' },
});