// GastosApp/components/ExpenseList.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors'; // A interface ThemeColors agora inclui separatorLine
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';

interface ExpenseListProps {
  transactions: Transaction[];
  onOpenDetailModal: (transaction: Transaction) => void; 
  headerContent?: React.ReactNode;
}

const getItemBackgroundColor = (transaction: Transaction, colors: ThemeColors): string => {
  if (transaction.type === 'income') {
    return colors.successTransparent;
  }
  if (transaction.type === 'investment') {
    return colors.investedTransparent;
  }
  if (transaction.type === 'expense') {
    if (transaction.paymentMethod === 'cartao') {
      return colors.primaryTransparent; 
    }
    return colors.dangerTransparent; 
  }
  return colors.card;
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
    shadowColor: isDark ? '#000' : '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: isDark ? 4 : 2.5,
    elevation: isDark ? 4 : 3,
  },
  itemContainer: {
    flexDirection: 'row',        
    alignItems: 'center',       
    paddingVertical: 40,        
    paddingHorizontal: 15, // Levemente aumentado para dar mais espaço interno      
  },
  descriptionText: {            
    fontSize: 15,               
    fontWeight: '500',          
    color: colors.text,
    flexGrow: 1, // Permite que a descrição cresça para preencher o espaço
    flexShrink: 1, // Permite que a descrição encolha se necessário
    // marginRight não é mais necessário aqui, o separador terá marginHorizontal
  },
  separatorText: {
    fontSize: 18,
    color: colors.separatorLine, // USANDO A NOVA COR DO TEMA
    marginHorizontal: 10,       // Espaçamento consistente para os separadores
  },
  amountText: {                  
    fontSize: 16,               
    fontWeight: 'bold',
    // marginHorizontal não é mais necessário, o separador já tem
  },
  arrowIcon: {
    // Não precisa de margem específica, o último separador já tem marginHorizontal
  },
  dangerColor: { color: colors.danger },
  successColor: { color: colors.success },
  investedColor: { color: colors.invested },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 30, },
  emptyText: { fontSize: 16, color: colors.secondaryText, textAlign: 'center', },
});

const ExpenseList: React.FC<ExpenseListProps> = ({ transactions, onOpenDetailModal, headerContent }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const getTransactionVisuals = (transaction: Transaction): { color: string; arrow: 'arrow-up' | 'arrow-down' } => {
    if (transaction.type === 'income') {
      return { color: styles.successColor.color, arrow: 'arrow-down' }; // ENTRADA: Verde, Seta para BAIXO
    }
    if (transaction.type === 'investment') {
      return { color: styles.investedColor.color, arrow: 'arrow-up' };   // INVESTIMENTO: Cor de investimento, Seta para CIMA
    }
    // DESPESA (incluindo pagamento de fatura): Vermelho, Seta para CIMA
    return { color: styles.dangerColor.color, arrow: 'arrow-up' }; 
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const { color: iconAndTextColor, arrow: arrowName } = getTransactionVisuals(item);
    const itemBackgroundColor = getItemBackgroundColor(item, colors);
    const displayDescription = item.category === "Pagamento de Fatura CC" ? "Pagamento Fatura CC" : item.description;
    
    return (
    <TouchableOpacity 
        style={[styles.itemTouchable, { backgroundColor: itemBackgroundColor }]} 
        onPress={() => onOpenDetailModal(item)}
    >
        <View style={styles.itemContainer}>
          <Text 
              style={styles.descriptionText} 
              // numberOfLines e ellipsizeMode removidos para permitir quebra de linha
            > 
                {displayDescription}
            </Text>
            <Text style={styles.separatorText}>|</Text>
          <Text style={[styles.amountText, { color: iconAndTextColor }]}>
            R$ {item.amount.toFixed(2).replace('.', ',')}
          </Text>
            <Text style={styles.separatorText}>|</Text>
            <FontAwesome 
              name={arrowName} 
              size={20} 
              color={iconAndTextColor} 
              style={styles.arrowIcon} 
            />
        </View>
    </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => ( <View style={styles.emptyContainer}><Text style={styles.emptyText}>Nenhuma transação registrada ainda. 🚀</Text></View>);

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