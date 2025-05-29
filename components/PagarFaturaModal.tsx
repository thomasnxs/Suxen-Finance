// GastosApp/components/PagarFaturaModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Modal as RNModal, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import GradientButton from './GradientButton';

const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

interface PagarFaturaModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmPagamento: (amount: number) => void;
  currentBill: number;
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)', // Este é o fundo escuro translúcido
    paddingVertical: 0, // Adicionado padding para evitar que o modal fique colado nas bordas
    paddingHorizontal: 25 // Adicionado padding horizontal para evitar que o modal fique colado nas bordas  

  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 20, // Um pouco mais arredondado
    paddingVertical: 40,   // Aumentado padding vertical
    paddingHorizontal: 55, // Aumentado padding horizontal
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%', 
    // minHeight e justifyContent removidos para deixar o conteúdo ditar a altura
    // até o maxHeight, se necessário (mas para este modal, provavelmente não)
  },
  modalTitle: { 
    fontSize: 22, // Aumentado
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 20, // Aumentado
    textAlign: 'center' 
  },
  infoText: { 
    fontSize: 16, // Aumentado
    color: colors.secondaryText, 
    marginBottom: 25, // Aumentado
    textAlign: 'center' 
  },
  input: { 
    height: 55, 
    borderColor: colors.border, 
    borderWidth: 1, 
    marginBottom: 30, // Aumentado
    paddingHorizontal: 15, 
    borderRadius: 10, 
    backgroundColor: colors.background, 
    color: colors.text, 
    fontSize: 22, // Aumentado
    textAlign: 'center' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    marginTop: 10, // Espaço acima dos botões
    marginLeft: -20, // Ajuste para alinhar com o input
    gap: 16,
  },
  buttonSpacer: { width: 12 } // Aumentado espaçador
});

const PagarFaturaModal: React.FC<PagarFaturaModalProps> = ({ visible, onClose, onConfirmPagamento, currentBill }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [amount, setAmount] = useState<string>('');
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      const billString = currentBill > 0 ? currentBill.toFixed(2).replace('.', ',') : '';
      setAmount(billString);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100); 
    } else {
      setAmount('');
    }
  }, [visible, currentBill]);

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
      Alert.alert("Valor Inválido", "Por favor, insira um valor de pagamento positivo.");
      return;
    }
    if (numericAmount > currentBill) {
        Alert.alert(
            "Valor Excede a Fatura", 
            `O valor informado (${formatCurrency(numericAmount)}) é maior que a fatura atual (${formatCurrency(currentBill)}). Por favor, insira um valor igual ou inferior.`
        ); 
        return;
    }
    onConfirmPagamento(numericAmount);
  };

  return (
    <RNModal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoidingContainer}
        // Ajuste este offset conforme necessário, especialmente se houver um header global acima do modal
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} 
      >
        <View style={styles.centeredView}> 
          <View style={styles.modalView}>
            {/* Não precisamos de ScrollView aqui, pois o conteúdo é pequeno e fixo */}
            <Text style={styles.modalTitle}>Pagar Fatura do Cartão</Text>
            <Text style={styles.infoText}>Fatura atual: {formatCurrency(currentBill)}</Text>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Valor do Pagamento"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
              autoFocus={true}
              onFocus={(e) => e.nativeEvent.text ? textInputRef.current?.setSelection(0, e.nativeEvent.text.length) : null}
              selectTextOnFocus={Platform.OS === 'android'}
            />
            <View style={styles.buttonContainer}>
              <GradientButton title="Cancelar" onPress={onClose} type="default" style={{ flex: 1, minWidth: 130, maxWidth: 180, marginLeft: 0 }} />
              <GradientButton title="Confirmar" onPress={handleConfirm} type="success" style={{ flex: 1, minWidth: 130, maxWidth: 180, marginLeft: 0 }} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

export default PagarFaturaModal;