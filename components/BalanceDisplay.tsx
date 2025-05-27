// GastosApp/components/BalanceDisplay.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

interface BalanceDisplayProps {
  currentBalance: number;
  creditCardBill: number;
  initialAccountBalance: number; // Ainda presente como prop, mas não exibida
  totalInvested: number;
  creditCardLimit: number;
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: isDark ? '#000' : '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.35 : 0.20,
    shadowRadius: isDark ? 3.84 : 1.41,
    elevation: isDark ? 5 : 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.text,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  currentBalanceValue: {
    color: colors.success,
  },
  creditCardValue: { // Usado para Fatura do Cartão
    color: colors.warning,
  },
  investedValue: {
    color: colors.invested,
  },
  creditAvailableValue: {
    color: colors.info,
  },
  creditExceededValue: {
    color: colors.danger,
    fontWeight: 'bold',
  }
});

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  currentBalance,
  creditCardBill,
  // initialAccountBalance, // Não exibido
  totalInvested,
  creditCardLimit,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const creditCardAvailable = creditCardLimit > 0 ? creditCardLimit - creditCardBill : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo Financeiro 📊</Text>

      {/* NOVA ORDEM ABAIXO */}

      <View style={styles.balanceRow}>
        <Text style={styles.label}>Saldo Atual em Conta:</Text>
        <Text style={[styles.value, styles.currentBalanceValue]}>
          R$ {currentBalance.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      {/* Informações do Cartão de Crédito agrupadas */}
      {creditCardLimit > 0 && ( // Só mostra se o limite for definido
        <>
          <View style={styles.balanceRow}>
            <Text style={styles.label}>Limite do Cartão:</Text>
            <Text style={styles.value}>R$ {creditCardLimit.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.label}>Disponível no Cartão:</Text>
            <Text style={[styles.value, creditCardAvailable >= 0 ? styles.creditAvailableValue : styles.creditExceededValue]}>
              R$ {creditCardAvailable.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </>
      )}
      {/* Mesmo que não haja limite definido, a fatura pode existir e ser mostrada */}
      <View style={styles.balanceRow}>
        <Text style={styles.label}>Fatura do Cartão:</Text>
        <Text style={[styles.value, styles.creditCardValue]}>
          R$ {creditCardBill.toFixed(2).replace('.', ',')}
        </Text>
      </View>


      {/* Total Investido pode vir aqui ou no final, conforme preferência */}
      <View style={styles.balanceRow}>
        <Text style={styles.label}>Total Investido:</Text>
        <Text style={[styles.value, styles.investedValue]}>
          R$ {totalInvested.toFixed(2).replace('.', ',')}
        </Text>
      </View>

    </View>
  );
};

export default BalanceDisplay;