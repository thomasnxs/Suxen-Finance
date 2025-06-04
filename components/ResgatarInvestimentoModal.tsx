// GastosApp/components/ResgatarInvestimentoModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Modal as RNModal, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatters'; // <--- ADICIONADO IMPORT
import GradientButton from './GradientButton';

// Função auxiliar de formatação (pode ser movida para um arquivo utils no futuro)
// const formatCurrency = (value: number): string => { // <--- REMOVIDA DEFINIÇÃO LOCAL
//   return `R$ ${value.toFixed(2).replace('.', ',')}`;
// };

interface ResgatarInvestimentoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmResgate: (amount: number) => void;
  currentTotalInvested: number;
}

// Reutilizando/adaptando estilos de modais anteriores
const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: {
    margin: 70, // Este valor de margem é bem grande, pode ser intencional
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 55,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' },
  infoText: { fontSize: 16, color: colors.secondaryText, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 55,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 25,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 20,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: -20, // Este marginLeft pode precisar de ajuste dependendo do padding do modalView e do efeito desejado
    gap: 16,
  },
  buttonSpacer: { // Este estilo não está sendo usado ativamente se 'gap' estiver funcionando
    width: 0,
  },
});

const ResgatarInvestimentoModal: React.FC<ResgatarInvestimentoModalProps> = ({
  visible,
  onClose,
  onConfirmResgate,
  currentTotalInvested
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [amount, setAmount] = useState<string>('');
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      // Não pré-preenchemos, pois o usuário vai dizer quanto quer resgatar
      setAmount('');
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    } else {
      setAmount('');
    }
  }, [visible]);

  const handleAmountChange = (text: string) => {
    let cleanedText = text.replace(/[^0-9.,]/g, '');
    const parts = cleanedText.split(/[.,]/);
    if (parts.length > 1) {
      const integerPart = parts[0];
      let decimalPart = parts.slice(1).join('');
      if (decimalPart.length > 2) decimalPart = decimalPart.substring(0, 2);
      const originalSeparator = cleanedText.includes(',') && cleanedText.indexOf(',') < (cleanedText.includes('.') ? cleanedText.indexOf('.') : Infinity) ? ',' : (cleanedText.includes('.') ? '.' : '');
      cleanedText = integerPart + (originalSeparator ? originalSeparator : (decimalPart.length > 0 ? '.' : '')) + decimalPart;
    }
    setAmount(cleanedText);
  };

  const handleConfirm = () => {
    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
    if (numericAmount <= 0) {
      Alert.alert("Valor Inválido", "Por favor, insira um valor de resgate positivo.");
      return;
    }
    if (numericAmount > currentTotalInvested) {
      Alert.alert(
        "Valor Insuficiente",
        `Você não pode resgatar ${formatCurrency(numericAmount)} pois possui apenas ${formatCurrency(currentTotalInvested)} investido.`,
      );
      return;
    }
    onConfirmResgate(numericAmount);
  };

  return (
    <RNModal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? -10 : 0}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Resgatar Investimento</Text>
            <Text style={styles.infoText}>Total investido atual: {formatCurrency(currentTotalInvested)}</Text>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Valor do Resgate"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
              autoFocus={true}
              onFocus={(e) => e.nativeEvent.text ? textInputRef.current?.setSelection(0, e.nativeEvent.text.length) : null}
              selectTextOnFocus={Platform.OS === 'android'}
            />
            <View style={styles.buttonContainer}>
              <GradientButton title="Cancelar" onPress={onClose} type="default" style={{ flex: 1, minWidth: 130, maxWidth: 180, marginLeft: 0  }} />
              <GradientButton title="Resgatar" onPress={handleConfirm} type="success" style={{ flex: 1, minWidth: 130, maxWidth: 180, marginLeft: 0  }} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

export default ResgatarInvestimentoModal;