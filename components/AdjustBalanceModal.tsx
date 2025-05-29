// GastosApp/components/AdjustBalanceModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Modal as RNModal, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import GradientButton from './GradientButton';

// Função auxiliar de formatação (pode ser movida para um arquivo utils no futuro)
const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

interface AdjustBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmAdjustment: (newActualBalance: number) => void;
  currentAppBalance: number; // Saldo atual que o app está mostrando
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  infoText: { 
    fontSize: 16, 
    color: colors.secondaryText, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  currentBalanceText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: { 
    height: 55, 
    borderColor: colors.border, 
    borderWidth: 1, 
    marginBottom: 30, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    backgroundColor: colors.background, 
    color: colors.text, 
    fontSize: 22, 
    textAlign: 'center' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    marginTop: 10,
  },
  buttonSpacer: { width: 10 }
});

const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({ 
  visible, 
  onClose, 
  onConfirmAdjustment, 
  currentAppBalance 
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [newBalanceInput, setNewBalanceInput] = useState<string>('');
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      // Não pré-preenchemos, o usuário vai digitar o saldo CORRETO atual dele
      setNewBalanceInput(''); 
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100); 
    } else {
      setNewBalanceInput('');
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
    setNewBalanceInput(cleanedText);
  };

  const handleConfirm = () => {
    const newActualBalance = parseFloat(newBalanceInput.replace(',', '.')) || 0;
    // Permitimos valor 0, mas não negativo para o saldo ajustado.
    if (newActualBalance < 0) { 
      Alert.alert("Valor Inválido", "O saldo ajustado não pode ser negativo.");
      return;
    }
    // Um alerta de confirmação para uma mudança tão significativa pode ser bom
    Alert.alert(
        "Confirmar Ajuste de Saldo",
        `Seu saldo atual no app é ${formatCurrency(currentAppBalance)}.\nVocê deseja ajustar para ${formatCurrency(newActualBalance)}?\n\nUma transação de ajuste será criada para refletir essa diferença.`,
        [
            { text: "Cancelar", style: "cancel" },
            { text: "Confirmar", onPress: () => onConfirmAdjustment(newActualBalance) }
        ]
    );
  };

  return (
    <RNModal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Ajustar Saldo da Conta</Text>
            <Text style={styles.infoText}>Saldo atual no aplicativo:</Text>
            <Text style={styles.currentBalanceText}>{formatCurrency(currentAppBalance)}</Text>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Novo Saldo Correto"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={newBalanceInput}
              onChangeText={handleAmountChange}
              autoFocus={true}
              onFocus={(e) => e.nativeEvent.text ? textInputRef.current?.setSelection(0, e.nativeEvent.text.length) : null}
              selectTextOnFocus={Platform.OS === 'android'}
            />
            <View style={styles.buttonContainer}>
              <GradientButton title="Cancelar" onPress={onClose} type="default" style={{ flex: 1, marginRight: styles.buttonSpacer.width }} />
              <GradientButton title="Confirmar Ajuste" onPress={handleConfirm} type="primary" style={{ flex: 1, marginLeft: styles.buttonSpacer.width }} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

export default AdjustBalanceModal;