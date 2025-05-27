// GastosApp/components/ExpenseList.tsx
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';

interface ExpenseListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  headerContent?: React.ReactNode;
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  listScreenContainer: {
    flex: 1,
  },
  flatListContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 15,
    shadowColor: isDark ? '#000' : '#666',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.2,
    shadowRadius: isDark ? 2 : 1.5,
    elevation: isDark ? 3 : 2,
  },
  itemInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flexShrink: 1,
  },
  notes: {
    fontSize: 13,
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginTop: 3,
    marginLeft: 2,
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  itemAmountPayment: {
    alignItems: 'flex-end',
    marginHorizontal:10,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  debitAmount: { color: colors.danger },
  creditAmount: { color: colors.warning },
  incomeAmount: { color: colors.success },
  investmentAmount: { color: colors.invested },
  paymentMethod: {
    fontSize: 12,
    color: colors.secondaryText,
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
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  deleteButtonText: {
    fontSize: 20,
    color: colors.danger,
  },
});

const ExpenseList: React.FC<ExpenseListProps> = ({ transactions, onDeleteTransaction, headerContent }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const getTransactionStyleBasedOnTheme = (transaction: Transaction) => {
    if (transaction.type === 'income') return styles.incomeAmount;
    if (transaction.type === 'investment') return styles.investmentAmount;
    return transaction.paymentMethod === 'cartao' ? styles.creditAmount : styles.debitAmount;
  };

  const getPaymentMethodText = (transaction: Transaction) => {
    if (transaction.type === 'income') return '(Entrada)';
    if (transaction.type === 'investment') return '(Para Investimento)';
    return transaction.paymentMethod === 'saldo' ? '(Débito/Conta)' : '(Crédito)';
  };

  const handleDelete = (id: string, description: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a transação "${description}"?`,
      [{ text: "Cancelar", style: "cancel", onPress: () => {} },
       { text: "Excluir", style: "destructive", onPress: () => onDeleteTransaction(id) }]
    );
  }

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.description}>{item.description}</Text>
        {item.notes ? (<Text style={styles.notes}>{item.notes}</Text>) : null}
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString('pt-BR')} - {new Date(item.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
      <View style={styles.itemAmountPayment}>
        <Text style={[styles.amount, getTransactionStyleBasedOnTheme(item)]}>
          {item.type === 'income' ? '+ ' : (item.type === 'expense' || item.type === 'investment' ? '- ' : '')}
          R$ {item.amount.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.paymentMethod}>{getPaymentMethodText(item)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.description)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma transação registrada ainda. 🚀</Text>
    </View>
  );

  return (
    <View style={styles.listScreenContainer}>
      {/* O título do histórico de transações foi movido para o listHeader em app/index.tsx */}
      <FlatList
        data={[...transactions].reverse()}
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