// GastosApp/components/InitialSetupModal.tsx
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';
import GradientButton from './GradientButton';

interface InitialSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSetup: (data: { balance: number; invested: number; limit: number; initialBill: number }) => void;
  currentInitialBalance: number;
  currentInitialInvested: number;
  currentCreditCardLimit: number;
  currentCreditCardBill: number;
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', },
  modalView: { margin: 20, backgroundColor: colors.card, borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '90%', },
  scrollViewContent: { alignItems: 'stretch', paddingBottom: 10 },
  modalText: { marginBottom: 15, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.text, },
  label: { fontSize: 14, color: colors.secondaryText, marginBottom: 5, textAlign: 'left', width: '100%', },
  input: { height: 45, borderColor: colors.border, borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, width: '100%', borderRadius: 5, fontSize: 16, color: colors.text, backgroundColor: colors.background, },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12, },
  buttonSpacer: { width: 5, } 
});


const InitialSetupModal: React.FC<InitialSetupModalProps> = ({
  visible,
  onClose,
  onSaveSetup,
  currentInitialBalance,
  currentInitialInvested,
  currentCreditCardLimit,
  currentCreditCardBill,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [balanceInput, setBalanceInput] = useState<string>('');
  const [investedInput, setInvestedInput] = useState<string>('');
  const [limitInput, setLimitInput] = useState<string>('');
  const [initialBillInput, setInitialBillInput] = useState<string>('');

  const handleNumericInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    let cleanedText = text.replace(/[^0-9.,]/g, ''); 
    const parts = cleanedText.split(/[.,]/);

    if (parts.length > 1) {
      const integerPart = parts[0];
      let decimalPart = parts.slice(1).join(''); 
      if (decimalPart.length > 2) {
        decimalPart = decimalPart.substring(0, 2);
      }
      const originalSeparator = cleanedText.includes(',') && cleanedText.indexOf(',') < (cleanedText.includes('.') ? cleanedText.indexOf('.') : Infinity) 
                             ? ',' 
                             : (cleanedText.includes('.') ? '.' : '');
      cleanedText = integerPart + (originalSeparator ? originalSeparator : (decimalPart.length > 0 ? '.' : '')) + decimalPart;
    }
    setter(cleanedText);
  };

  useEffect(() => {
    if (visible) {
      // Usar Boolean() explicitamente para a condição, embora currentInitialBalance > 0 já seja booleano
      setBalanceInput(Boolean(currentInitialBalance > 0) ? currentInitialBalance.toFixed(2).replace('.', ',') : '');
      setInvestedInput(Boolean(currentInitialInvested > 0) ? currentInitialInvested.toFixed(2).replace('.', ',') : '');
      setLimitInput(Boolean(currentCreditCardLimit > 0) ? currentCreditCardLimit.toFixed(2).replace('.', ',') : '');
      setInitialBillInput(Boolean(currentCreditCardBill > 0) ? currentCreditCardBill.toFixed(2).replace('.', ',') : '');
    } else {
      setBalanceInput('');
      setInvestedInput('');
      setLimitInput('');
      setInitialBillInput('');
    }
  }, [visible, currentInitialBalance, currentInitialInvested, currentCreditCardLimit, currentCreditCardBill]);

  const handleSave = () => {
    const balanceValue = parseFloat(balanceInput.replace(',', '.')) || 0;
    const investedValue = parseFloat(investedInput.replace(',', '.')) || 0;
    const limitValue = parseFloat(limitInput.replace(',', '.')) || 0;
    const initialBillValue = parseFloat(initialBillInput.replace(',', '.')) || 0;

    if (balanceValue < 0 || investedValue < 0 || limitValue < 0 || initialBillValue < 0) {
      Alert.alert('Os valores não podem ser negativos. Por favor, insira valores válidos (ou deixe em branco/0).');
      return;
    }
    onSaveSetup({ balance: balanceValue, invested: investedValue, limit: limitValue, initialBill: initialBillValue });
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose} >
      <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.keyboardAvoidingContainer} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} 
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView 
              contentContainerStyle={styles.scrollViewContent} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalText}>Configuração Inicial</Text>
              
              <Text style={styles.label}>Saldo Inicial em Conta:</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 1250,75" 
                placeholderTextColor={colors.placeholder} 
                keyboardType="numeric" 
                value={balanceInput} 
                onChangeText={(text) => handleNumericInputChange(text, setBalanceInput)} 
              />
              
              <Text style={styles.label}>Total Investido Inicialmente:</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 5000,00" 
                placeholderTextColor={colors.placeholder} 
                keyboardType="numeric" 
                value={investedInput} 
                onChangeText={(text) => handleNumericInputChange(text, setInvestedInput)} 
              />
              
              <Text style={styles.label}>Limite Total do Cartão de Crédito:</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 2000,00" 
                placeholderTextColor={colors.placeholder} 
                keyboardType="numeric" 
                value={limitInput} 
                onChangeText={(text) => handleNumericInputChange(text, setLimitInput)} 
              />
              
              <Text style={styles.label}>Fatura Aberta Atual do Cartão:</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 350,00" 
                placeholderTextColor={colors.placeholder} 
                keyboardType="numeric" 
                value={initialBillInput} 
                onChangeText={(text) => handleNumericInputChange(text, setInitialBillInput)} 
              />
              
              <View style={styles.buttonContainer}>
                <GradientButton 
                  title="Cancelar" 
                  onPress={onClose} 
                  type="danger" 
                  style={{flex: 1, marginRight: styles.buttonSpacer.width }}
                />
                <GradientButton 
                  title="Salvar" 
                  onPress={handleSave} 
                  type="primary" 
                  style={{flex: 1, marginLeft: styles.buttonSpacer.width }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InitialSetupModal;