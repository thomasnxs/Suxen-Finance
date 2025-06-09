// CÓDIGO COMPLETO PARA GastosApp/app/(tabs)/preferencias.tsx

import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import GradientButton from '../../components/GradientButton';
import InitialSetupModal from '../../components/InitialSetupModal';
import { ThemeColors } from '../../constants/colors';
import { InitialDataContextType, useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';

const ALL_APP_DATA_KEYS = [
  '@GasteiApp:transactions', '@GasteiApp:initialAccountBalance', '@GasteiApp:totalInvested',
  '@GasteiApp:creditCardLimit', '@GasteiApp:initialCreditCardBill', '@GasteiApp:currentCreditCardBill',
  '@GasteiApp:theme', '@GasteiApp:userName', '@GasteiApp:setupComplete', '@GasteiApp:termosAceitos'
];
const THEME_KEY_IN_BACKUP = '@GasteiApp:theme';

export default function PreferenciasScreen() {
  const { colors, isDark, toggleTheme, setTheme } = useTheme();
  const { 
    initialAccountBalance, totalInvested, creditCardLimit, creditCardBill,
    handleSaveInitialSetup, isLoadingData, forceReloadAllInitialData,
  } = useInitialData() as InitialDataContextType; 
  
  const router = useRouter();
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const systemColorScheme = useColorScheme(); 
  const styles = getThemedStyles(colors, isDark);

  const PIX_KEY = "5bfc4156-fdec-428a-b432-b5f9262bb54c"; // <-- SUBSTITUA AQUI!

  const handleCopyPixKey = async () => {
    await Clipboard.setStringAsync(PIX_KEY);
    Alert.alert("Chave PIX Copiada!", "Obrigado pelo seu apoio! ❤️");
  };

  const handleOpenInitialSetup = () => { if (!isLoadingData) setIsInitialSetupModalVisible(true); };
  const onModalSave = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => { await handleSaveInitialSetup(data); setIsInitialSetupModalVisible(false); Alert.alert("Sucesso", "Dados atualizados!"); };
  const confirmResetAppData = () => { Alert.alert("Resetar App", "Tem certeza? Esta ação não pode ser desfeita.", [ { text: "Cancelar", style: "cancel" }, { text: "Resetar", style: "destructive", onPress: handleResetAppData } ]); };
  const handleResetAppData = async () => { try { await AsyncStorage.multiRemove(ALL_APP_DATA_KEYS); if (forceReloadAllInitialData) await forceReloadAllInitialData(); const theme = systemColorScheme ?? 'light'; if (setTheme) await setTheme(theme); Alert.alert("Resetado", "App resetado com sucesso.", [{ text: "OK", onPress: () => router.replace('/') }]); } catch (e) { Alert.alert("Erro", "Não foi possível resetar."); }};
  const handleExportData = async () => { setIsExporting(true); try { const storedDataArray = await AsyncStorage.multiGet(ALL_APP_DATA_KEYS); const dataToExport: { [key: string]: any } = {}; storedDataArray.forEach(([key, value]) => { if (value !== null) { try { dataToExport[key] = JSON.parse(value); } catch { dataToExport[key] = value; } } }); if (Object.keys(dataToExport).length === 0) { Alert.alert("Sem Dados", "Nada para exportar."); setIsExporting(false); return; } const backupObject = { appName: Constants.expoConfig?.name, appVersion: Constants.expoConfig?.version, exportDate: new Date().toISOString(), data: dataToExport, }; const jsonString = JSON.stringify(backupObject, null, 2); const fileName = `gastei-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`; const fileUri = FileSystem.cacheDirectory + fileName; await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 }); await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Salvar backup' }); } catch (e) { Alert.alert("Erro", "Exportação falhou."); } finally { setIsExporting(false); } };
  const handleImportData = async () => { setIsImporting(true); try { const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' }); if (!result.canceled) { const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri); const backupObject = JSON.parse(fileContent); if (backupObject?.appName === Constants.expoConfig?.name && backupObject?.data) { Alert.alert("Restaurar Backup?", "Isso substituirá todos os dados atuais.", [{ text: "Cancelar", style: "cancel" }, { text: "Restaurar", style: "destructive", onPress: async () => { const pairs = Object.entries(backupObject.data).map(([key, value]) => [key, JSON.stringify(value)]) as [string, string][]; await AsyncStorage.multiSet(pairs); await forceReloadAllInitialData(); const theme = backupObject.data[THEME_KEY_IN_BACKUP] === 'dark' ? 'dark' : 'light'; await setTheme(theme); Alert.alert("Sucesso!", "Dados restaurados. O app será recarregado.", [{ text: "OK", onPress: () => router.replace('/') }]); }} ]); } else { Alert.alert("Arquivo Inválido"); } } } catch (e) { Alert.alert("Erro", "Importação falhou."); } finally { setIsImporting(false); } };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Preferências' }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Iniciais</Text>
        <GradientButton title="Editar Dados Iniciais" onPress={handleOpenInitialSetup} type="primary" style={styles.button} disabled={isLoadingData || isExporting || isImporting}/>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.themeSwitchContainer}>
          <Text style={[styles.themeLabel, !isDark && styles.activeThemeLabel]}>☀️ Claro</Text>
          <Switch onValueChange={toggleTheme} value={isDark} />
          <Text style={[styles.themeLabel, isDark && styles.activeThemeLabel]}>🌙 Escuro</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre e Legal</Text>
        <GradientButton title="Termos de Uso e Privacidade" onPress={() => router.push({ pathname: '/termos', params: { source: 'preferencias' }})} type="default" style={styles.button} disabled={isExporting || isImporting}/>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apoie o Desenvolvedor</Text>
        <Text style={styles.descriptionText}>Gostou do Gastei!? Considere fazer uma doação via PIX para apoiar o projeto.</Text>
        <View style={styles.pixContainer}>
          <Text style={styles.pixKeyText} selectable>{PIX_KEY}</Text>
          <TouchableOpacity onPress={handleCopyPixKey} style={styles.copyButton}>
            <FontAwesome name="copy" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup e Restauração</Text>
        <GradientButton title={isExporting ? "Exportando..." : "Exportar Dados"} onPress={handleExportData} type="info" style={styles.button} disabled={isExporting || isImporting || isLoadingData} icon={isExporting ? <ActivityIndicator size="small" color={colors.card} style={{marginRight: 8}} /> : null} />
        <View style={{height: 10}}/>
        <GradientButton title={isImporting ? "Processando..." : "Importar Dados"} onPress={handleImportData} type="success" style={styles.button} disabled={isExporting || isImporting || isLoadingData} icon={isImporting ? <ActivityIndicator size="small" color={colors.card} style={{marginRight: 8}} /> : null} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplicativo</Text>
        <GradientButton title="Resetar Dados do App" onPress={confirmResetAppData} type="danger" style={styles.button} disabled={isExporting || isImporting}/>
      </View>

      <InitialSetupModal visible={isInitialSetupModalVisible} onClose={() => setIsInitialSetupModalVisible(false)} onSaveSetup={onModalSave} currentInitialBalance={initialAccountBalance} currentInitialInvested={totalInvested} currentCreditCardLimit={creditCardLimit} currentCreditCardBill={creditCardBill} />
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
  themeLabel: { fontSize: 16, marginHorizontal: 10, color: colors.text },
  activeThemeLabel: { fontWeight: 'bold', color: colors.primary },
  switchStyle: { transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [] },
  pixContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, marginTop: 15, borderWidth: 1, borderColor: colors.border },
  pixKeyText: { fontSize: 14, color: colors.text, flex: 1, marginRight: 10 },
  copyButton: { padding: 8 },
});