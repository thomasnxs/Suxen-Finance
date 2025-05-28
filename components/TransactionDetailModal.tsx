// GastosApp/components/TransactionDetailModal.tsx
import React from 'react';
import { Button, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { // Embora não haja inputs, manter para consistência se adicionar no futuro
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Fundo um pouco mais escuro para modal
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 15, // Um pouco menos arredondado que o setup inicial
    padding: 25, // Padding interno
    alignItems: 'stretch', // Para que os botões ocupem a largura
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  scrollViewContent: {
    // paddingBottom: 10, // Espaço no final do scroll se necessário
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    flex: 1, // Para ocupar espaço e alinhar com valor
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1.5, // Dar mais espaço para o valor
    textAlign: 'right',
  },
  amountValueIncome: { color: colors.success, fontWeight: 'bold' },
  amountValueExpense: { color: colors.danger, fontWeight: 'bold' },
  amountValueInvestment: { color: colors.invested, fontWeight: 'bold' },
  amountValueCard: { color: colors.warning, fontWeight: 'bold' },
  buttonContainer: {
    marginTop: 25,
    flexDirection: 'column', // Botões um abaixo do outro
  },
  deleteButton: {
    // Estilos específicos se o botão de deletar precisar ser diferente
    // Por enquanto, usaremos o Button padrão do RN
  },
  buttonSpacer: {
    height: 10, // Espaço entre os botões de deletar e fechar
  }
});

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (!transaction) {
    return null; // Não renderiza nada se não houver transação
  }

  const handleDeletePress = () => {
    // A confirmação de Alert já está em handleDeleteTransaction no HomeScreen.
    // Apenas chamamos onDelete que já tem o Alert.
    onDelete(transaction.id);
    // O onClose será chamado dentro do handleDeleteTransaction após a exclusão.
  };

  const getAmountStyle = () => {
    if (transaction.type === 'income') return styles.amountValueIncome;
    if (transaction.type === 'investment') return styles.amountValueInvestment;
    return transaction.paymentMethod === 'cartao' ? styles.amountValueCard : styles.amountValueExpense;
  };

  const getPaymentMethodText = () => {
    if (transaction.type === 'income') return 'Entrada na Conta';
    if (transaction.type === 'investment') return 'Movido para Investimentos';
    if (transaction.category === "Pagamento de Fatura CC") return 'Pagamento de Fatura (Saldo)';
    return transaction.paymentMethod === 'saldo' ? 'Saldo da Conta' : 'Cartão de Crédito';
  };
  
  const transactionTypeText = () => {
    if (transaction.category === "Pagamento de Fatura CC") return "Pagamento de Fatura";
    switch(transaction.type) {
        case 'income': return "Entrada";
        case 'expense': return "Saída";
        case 'investment': return "Investimento";
        default: return "N/A";
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Detalhes da Transação</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descrição:</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>

            {transaction.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notas:</Text>
                <Text style={styles.detailValue}>{transaction.notes}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>{new Date(transaction.date).toLocaleDateString('pt-BR')}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hora:</Text>
              <Text style={styles.detailValue}>{new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo:</Text>
              <Text style={styles.detailValue}>{transactionTypeText()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valor:</Text>
              <Text style={[styles.detailValue, getAmountStyle()]}>
                R$ {transaction.amount.toFixed(2).replace('.', ',')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Forma de Pagamento:</Text>
              <Text style={styles.detailValue}>{getPaymentMethodText()}</Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <Button title="Excluir Transação" onPress={handleDeletePress} color={colors.danger} />
              <View style={styles.buttonSpacer} />
              <Button title="Fechar" onPress={onClose} color={colors.primary} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TransactionDetailModal;