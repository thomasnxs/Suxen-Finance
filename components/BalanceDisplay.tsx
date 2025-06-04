// GastosApp/components/BalanceDisplay.tsx
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatters'; // <--- ADICIONADO IMPORT

interface BalanceDisplayProps {
  currentBalance: number;
  creditCardBill: number;
  totalInvested: number;
  creditCardLimit: number;
  onOpenCartaoDetail: () => void;
  onOpenResgatarInvestimentoModal: () => void;
  initialAccountBalance: number;
}

// const formatCurrency = (value: number): string => { // <--- REMOVIDA DEFINIÇÃO LOCAL
//   return `R$ ${value.toFixed(2).replace('.', ',')}`;
// };

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: isDark ? '#000' : '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.30 : 0.15,
    shadowRadius: isDark ? 3.5 : 2.5,
    elevation: isDark ? 5 : 3,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  eyeIcon: {
    padding: 5,
  },
  currentBalanceValueColor: { color: colors.success },
  creditCardValueColor: { color: colors.warning },
  investedValueColor: { color: colors.invested },
  cardDetailText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
});

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  currentBalance,
  creditCardBill,
  totalInvested,
  creditCardLimit,
  onOpenCartaoDetail,
  onOpenResgatarInvestimentoModal,
  initialAccountBalance, // Esta prop não está sendo usada no JSX, considerar remover se não for necessária
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [showSaldo, setShowSaldo] = useState(true);

  const toggleShowSaldo = () => {
    setShowSaldo(prev => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Card 1: Saldo Atual */}
      <View style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Saldo Atual em Conta</Text>
          <TouchableOpacity onPress={toggleShowSaldo} style={styles.eyeIcon}>
            <FontAwesome name={showSaldo ? "eye" : "eye-slash"} size={22} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.cardValue, styles.currentBalanceValueColor]}>
          {showSaldo ? formatCurrency(currentBalance) : 'R$ ••••••'}
        </Text>
      </View>

      {/* Card 2: Cartão de Crédito */}
      <TouchableOpacity onPress={onOpenCartaoDetail} activeOpacity={0.7}>
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Cartão de Crédito</Text>
            <FontAwesome name="chevron-right" size={18} color={colors.secondaryText} />
          </View>
          <Text style={[styles.cardValue, styles.creditCardValueColor]}>{`Fatura: ${formatCurrency(creditCardBill)}`}</Text>
          <Text style={styles.cardDetailText}>{`Limite: ${creditCardLimit > 0 ? formatCurrency(creditCardLimit) : 'Não definido'}`}</Text>
        </View>
      </TouchableOpacity>

      {/* Card 3: Investimentos */}
      <TouchableOpacity onPress={onOpenResgatarInvestimentoModal} activeOpacity={0.7}>
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Investimentos</Text>
            <FontAwesome name="chevron-right" size={18} color={colors.secondaryText} />
          </View>
          <Text style={[styles.cardValue, styles.investedValueColor]}>{`Total: ${formatCurrency(totalInvested)}`}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BalanceDisplay;