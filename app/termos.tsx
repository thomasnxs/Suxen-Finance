// GastosApp/app/termos.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; // Adicionado useLocalSearchParams
import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

const TERMOS_ACEITOS_KEY = '@GasteiApp:termosAceitos';

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' },
  paragraph: { fontSize: 16, color: colors.text, marginBottom: 12, lineHeight: 22, textAlign: 'justify' },
  highlight: { fontWeight: 'bold', color: colors.primary },
  buttonContainer: { marginTop: 20, paddingHorizontal: 20, paddingBottom: 20 },
});

export default function TermosScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>(); // Para verificar se veio de 'preferencias'

  const isReadOnly = params.source === 'preferencias';

  const handleAcceptTerms = async () => {
    try {
      await AsyncStorage.setItem(TERMOS_ACEITOS_KEY, 'true');
      router.replace('/'); // Volta para o index para decidir o próximo passo (welcome ou home)
    } catch (e) {
      console.error("Erro ao salvar aceitação dos termos:", e);
      Alert.alert("Erro", "Não foi possível salvar sua preferência. Tente novamente.");
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Se não puder voltar (ex: é a primeira tela), redireciona para o fluxo normal
      // Isso é um fallback, idealmente o headerBackVisible já estaria true
      router.replace('/'); 
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Termos e Privacidade', 
          headerBackVisible: isReadOnly, // Mostra botão de voltar nativo se for modo leitura
          headerLeft: isReadOnly ? undefined : () => null, // Remove o botão de voltar se não for modo leitura
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Termos de Uso e Política de Privacidade</Text>
        {/* Seu texto de termos aqui... (mantive o exemplo anterior) */}
        <Text style={styles.paragraph}>Bem-vindo(a) ao <Text style={styles.highlight}>Gastei!</Text></Text>
        <Text style={styles.paragraph}>Este aplicativo foi desenvolvido para ajudar você a gerenciar suas finanças pessoais de forma simples e eficaz.</Text>
        <Text style={styles.paragraph}><Text style={styles.highlight}>IMPORTANTE: Seus Dados São Locais.</Text> Todos os dados financeiros que você registrar neste aplicativo (transações, saldos, configurações) são armazenados <Text style={styles.highlight}>exclusivamente no seu dispositivo</Text> (usando o AsyncStorage).</Text>
        <Text style={styles.paragraph}>Nós não coletamos, armazenamos ou temos acesso a nenhuma de suas informações financeiras em servidores externos. Sua privacidade e a segurança dos seus dados são de sua responsabilidade no seu dispositivo.</Text>
        <Text style={styles.paragraph}><Text style={styles.highlight}>Consequências da Desinstalação:</Text> Se você desinstalar o aplicativo "Gastei!" do seu dispositivo, todos os dados financeiros registrados nele serão <Text style={styles.highlight}>permanentemente perdidos</Text>, pois eles residem apenas localmente. Recomendamos que você utilize a funcionalidade de backup regularmente se desejar preservar seus dados.</Text>
        {!isReadOnly && (
          <Text style={styles.paragraph}>Ao clicar em "Concordo e Continuar", você confirma que leu, entendeu e concorda com estes termos, especialmente sobre o armazenamento local dos dados e as consequências da desinstalação do aplicativo.</Text>
        )}
      </ScrollView>
      {!isReadOnly ? (
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Concordo e Continuar"
            onPress={handleAcceptTerms}
            type="primary"
          />
        </View>
      ) : (
        // No modo leitura (vindo das Preferências), podemos ter um botão de "Voltar" ou confiar no header
        // Se headerBackVisible for true, o botão de voltar do header já funciona
        // Poderia adicionar um botão "Fechar" aqui se quisesse, que chamaria router.back()
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Voltar"
            onPress={handleGoBack} // Usa a função para voltar
            type="default"
          />
        </View>
      )}
    </View>
  );
}