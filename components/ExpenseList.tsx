// GastosApp/components/ExpenseList.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ExpenseListProps {
  transactions: Transaction[];
  onOpenDetailModal: (transaction: Transaction) => void; 
  headerContent?: React.ReactNode;
}

const getItemBackgroundColor = (transaction: Transaction, colors: ThemeColors): string => {
  if (transaction.type === 'income') return colors.successTransparent;
  if (transaction.type === 'investment') return colors.investedTransparent;
  if (transaction.type === 'expense') {
    if (transaction.paymentMethod === 'cartao') return colors.primaryTransparent;
    return colors.dangerTransparent;
  }
  return colors.card;
};

const getThemedStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  listScreenContainer: {
    flex: 1,
  },
  flatListContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemTouchable: {
    borderRadius: 10,
    marginBottom: 10, 
    marginHorizontal: 15,
    shadowColor: isDark ? '#000' : '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.30 : 0.10,
    shadowRadius: isDark ? 3.5 : 2.0,
    elevation: isDark ? 4 : 2,
  },
  itemContainer: {
    flexDirection: 'row',         
    alignItems: 'center', 
    paddingVertical: 16,
    paddingHorizontal: 15,     
  },
  descriptionText: {               
    fontSize: 15,               
    fontWeight: '500',           
    flexGrow: 1, 
    flexShrink: 1, 
    marginRight: 8,
  },
  separatorText: {
    fontSize: 18, 
    color: colors.separatorLine || colors.border,
    marginHorizontal: 8,
  },
  amountText: {               
    fontSize: 16,               
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: 80,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    marginTop: 30,
  },
  emptyText: { 
    fontSize: 16, 
    color: colors.secondaryText, 
    textAlign: 'center', 
  },
});

const ExpenseList: React.FC<ExpenseListProps> = ({ transactions, onOpenDetailModal, headerContent }) => {
  const { colors, isDark } = useTheme();
  const styles = getThemedStyles(colors, isDark);

  // Lógica de visuais restaurada para ser específica para cada tipo
  const getTransactionVisuals = (transaction: Transaction): { color: string; arrow: 'arrow-up' | 'arrow-down' } => {
    if (transaction.type === 'income') {
      return { color: colors.success, arrow: 'arrow-down' };
    }
    if (transaction.type === 'expense') {
      return { color: colors.danger, arrow: 'arrow-up' }; 
    }
    if (transaction.type === 'investment') {
      // Usando a cor de investimento da paleta.
      // Se o contraste com o fundo investedTransparent não for bom, podemos mudar aqui.
      // Ex: color: isDark ? colors.invested : '#A18200' (um amarelo mais escuro para o tema claro)
      return { color: colors.invested, arrow: 'arrow-up' };
    }
    return { color: colors.text, arrow: 'arrow-up' };
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const { color: iconAndAmountTextColor, arrow: arrowName } = getTransactionVisuals(item);
    const itemBackgroundColor = getItemBackgroundColor(item, colors);
    
    let displayDescription = item.description;
    if (item.category === "Pagamento de Fatura CC") {
      displayDescription = "Pagamento Fatura CC";
    }

    // Prefixo específico para cada tipo
    const amountPrefix = item.type === 'income' ? '+' : item.type === 'expense' ? '-' : '⇢';
    
    return (
    <TouchableOpacity 
        style={[styles.itemTouchable, { backgroundColor: itemBackgroundColor }]} 
        onPress={() => onOpenDetailModal(item)}
    >
        <View style={styles.itemContainer}>
          {/* A cor da descrição é a cor padrão do texto do tema, para garantir legibilidade */}
          <Text style={[styles.descriptionText, { color: colors.text }]}> 
              {displayDescription}
          </Text>
          <Text style={styles.separatorText}>|</Text>
          {/* A cor do valor e do ícone é específica do tipo de transação */}
          <Text style={[styles.amountText, { color: iconAndAmountTextColor }]}>
            {amountPrefix} {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.separatorText}>|</Text>
          <FontAwesome 
            name={arrowName} 
            size={18}
            color={iconAndAmountTextColor} 
            style={styles.arrowIcon} 
          />
        </View>
    </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma transação registrada ainda. 🚀</Text>
      <Text style={styles.emptyText}>Adicione uma clicando no botão '+' na tela Home!</Text>
    </View>
  );

  return (
    <View style={styles.listScreenContainer}>
      <FlatList
        data={transactions} 
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={<>{headerContent}</>}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.flatListContentContainer}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default ExpenseList;