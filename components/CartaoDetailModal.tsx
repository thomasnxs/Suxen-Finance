// GastosApp/components/CartaoDetailModal.tsx
import React from 'react';
import { Modal as RNModal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatters'; // <--- ADICIONADO IMPORT
import GradientButton from './GradientButton';

interface CartaoDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onPagarFaturaPress: () => void; // Será chamada para abrir o modal de pagamento
  creditCardLimit: number;
  currentCreditCardBill: number;
}

// const formatCurrency = (value: number) => { // <--- REMOVIDA DEFINIÇÃO LOCAL
//   return `R$ ${value.toFixed(2).replace('.', ',')}`;
// };

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%', // Ajustável conforme o conteúdo
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20, textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  detailLabel: { fontSize: 16, color: colors.secondaryText, flexShrink: 1, marginRight: 8 },
  detailValue: { fontSize: 16, color: colors.text, fontWeight: '500', textAlign: 'right' },
  availablePositive: { color: colors.success },
  availableNegative: { color: colors.danger },
  faturaValue: { color: colors.warning },
  buttonContainer: { marginTop: 30, flexDirection: 'column' }, // Botões empilhados
  buttonSpacer: { height: 12 }
});

const CartaoDetailModal: React.FC<CartaoDetailModalProps> = ({
  visible,
  onClose,
  onPagarFaturaPress,
  creditCardLimit,
  currentCreditCardBill,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const creditCardAvailable = creditCardLimit > 0 ? creditCardLimit - currentCreditCardBill : 0;
  const availableStyle = creditCardAvailable >= 0 ? styles.availablePositive : styles.availableNegative;

  return (
    <RNModal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Detalhes do Cartão</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fatura Atual:</Text>
              <Text style={[styles.detailValue, styles.faturaValue]}>{formatCurrency(currentCreditCardBill)}</Text>
            </View>

            {creditCardLimit > 0 && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Limite Total:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(creditCardLimit)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Disponível:</Text>
                  <Text style={[styles.detailValue, availableStyle]}>{formatCurrency(creditCardAvailable)}</Text>
                </View>
              </>
            )}
            {/* Simplificando a lógica para exibir 'Não definido' */}
            {creditCardLimit <= 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Limite Total:</Text>
                <Text style={styles.detailValue}>Não definido</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <GradientButton
                title="Pagar Fatura"
                onPress={onPagarFaturaPress}
                type="success" // Ou 'primary'
              />
              <View style={styles.buttonSpacer} />
              <GradientButton
                title="Fechar"
                onPress={onClose}
                type="default"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

export default CartaoDetailModal;