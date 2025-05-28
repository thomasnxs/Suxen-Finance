// GastosApp/app/(tabs)/dados.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext'; // Ajustado o caminho

export default function DadosScreen() {
  const { colors } = useTheme();
  // Criando uma função de estilo local para este componente
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    text: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    subText: {
      fontSize: 16,
      color: colors.secondaryText,
      marginTop: 8,
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Dados</Text>
      <Text style={styles.subText}>Em construção...</Text>
    </View>
  );
}