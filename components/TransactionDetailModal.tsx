// GastosApp/components/TransactionDetailModal.tsx
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native'; // Alert não é usado aqui diretamente, mas pode manter
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';
import GradientButton from './GradientButton';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void; // NOVA PROP
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, }, 
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', },
  modalView: { margin: 20, backgroundColor: colors.card, borderRadius: 15, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '80%', },
  scrollViewContent: { paddingBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20, textAlign: 'center', },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'flex-start' },
  detailLabel: { fontSize: 16, color: colors.secondaryText, flexShrink: 1, marginRight: 8, flexBasis: '40%' }, 
  detailValue: { fontSize: 16, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right', flexBasis: '60%' }, 
  amountValueIncome: { color: colors.success, fontWeight: 'bold' },
  amountValueExpense: { color: colors.danger, fontWeight: 'bold' },
  amountValueInvestment: { color: colors.invested, fontWeight: 'bold' },
  amountValueCard: { color: colors.warning, fontWeight: 'bold' },
  buttonContainer: { marginTop: 25, flexDirection: 'column', },
  buttonSpacer: { height: 12, } 
});


const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
  onDelete,
  onEdit, // NOVA PROP
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (!transaction) {
    return null;
  }

  const handleDeletePress = () => {
    onDelete(transaction.id); 
  };

  const handleEditPress = () => { // NOVA FUNÇÃO
    if (transaction) {
      onEdit(transaction);
    }
  };

  const getAmountStyle = () => { 
    if (!transaction) return {};
    if (transaction.type === 'income') return styles.amountValueIncome; 
    if (transaction.type === 'investment') return styles.amountValueInvestment; 
    return transaction.paymentMethod === 'cartao' ? styles.amountValueCard : styles.amountValueExpense;
  };
  const getPaymentMethodText = () => { 
    if (!transaction) return "";
    if (transaction.type === 'income') return 'Entrada na Conta'; 
    if (transaction.type === 'investment') return 'Movido para Investimentos'; 
    if (transaction.category === "Pagamento de Fatura CC") return 'Pagamento de Fatura (Saldo)'; 
    return transaction.paymentMethod === 'saldo' ? 'Saldo da Conta' : 'Cartão de Crédito';
  };
  const transactionTypeText = () => { 
    if (!transaction) return "N/A";
    if (transaction.category === "Pagamento de Fatura CC") return "Pagamento de Fatura"; 
    switch(transaction.type) { 
      case 'income': return "Entrada"; 
      case 'expense': return "Saída"; 
      case 'investment': return "Investimento"; 
      default: return "N/A";
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose} >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Detalhes da Transação</Text>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Descrição:</Text><Text style={styles.detailValue} numberOfLines={3} ellipsizeMode="tail">{transaction.description}</Text></View>
            {transaction.notes && (<View style={styles.detailRow}><Text style={styles.detailLabel}>Notas:</Text><Text style={styles.detailValue} numberOfLines={3} ellipsizeMode="tail">{transaction.notes}</Text></View>)}
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Data:</Text><Text style={styles.detailValue}>{new Date(transaction.date).toLocaleDateString('pt-BR')}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Hora:</Text><Text style={styles.detailValue}>{new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Tipo:</Text><Text style={styles.detailValue}>{transactionTypeText()}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Valor:</Text><Text style={[styles.detailValue, getAmountStyle()]}>R$ {transaction.amount.toFixed(2).replace('.', ',')}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Forma de Pagamento:</Text><Text style={styles.detailValue}>{getPaymentMethodText()}</Text></View>
            
            <View style={styles.buttonContainer}>
              <GradientButton title="Editar Transação" onPress={handleEditPress} type="info" /> 
              <View style={styles.buttonSpacer} />
              <GradientButton title="Excluir Transação" onPress={handleDeletePress} type="danger" />
              <View style={styles.buttonSpacer} />
              <GradientButton title="Fechar" onPress={onClose} type="default" /> 
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TransactionDetailModal;