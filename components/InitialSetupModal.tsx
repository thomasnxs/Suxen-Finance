// GastosApp/components/InitialSetupModal.tsx
import React, { useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  scrollViewContent: {
    alignItems: 'stretch',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  label: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
  },
  input: {
    height: 45,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 5,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  buttonSpacer: {
    width: 10,
  }
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

  useEffect(() => {
    if (visible) {
      // Se o valor atual for > 0, formata e mostra. Senão, deixa o campo vazio.
      setBalanceInput(currentInitialBalance > 0 ? currentInitialBalance.toFixed(2).replace('.', ',') : '');
      setInvestedInput(currentInitialInvested > 0 ? currentInitialInvested.toFixed(2).replace('.', ',') : '');
      setLimitInput(currentCreditCardLimit > 0 ? currentCreditCardLimit.toFixed(2).replace('.', ',') : '');
      setInitialBillInput(currentCreditCardBill > 0 ? currentCreditCardBill.toFixed(2).replace('.', ',') : '');
    }
  }, [visible, currentInitialBalance, currentInitialInvested, currentCreditCardLimit, currentCreditCardBill]);

  const handleSave = () => {
    // O parseFloat de uma string vazia resultará em NaN. O '|| 0' garante que se torne 0.
    const balanceValue = parseFloat(balanceInput.replace(',', '.')) || 0;
    const investedValue = parseFloat(investedInput.replace(',', '.')) || 0;
    const limitValue = parseFloat(limitInput.replace(',', '.')) || 0;
    const initialBillValue = parseFloat(initialBillInput.replace(',', '.')) || 0;

    // A validação de < 0 ainda é importante se o usuário digitar números negativos manualmente.
    if (balanceValue < 0 || investedValue < 0 || limitValue < 0 || initialBillValue < 0) {
      alert('Os valores não podem ser negativos. Por favor, insira valores válidos (ou deixe em branco/0).');
      return;
    }
    onSaveSetup({ balance: balanceValue, invested: investedValue, limit: limitValue, initialBill: initialBillValue });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalText}>Configuração Inicial de Saldos e Cartão</Text>

              <Text style={styles.label}>Saldo Inicial em Conta:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 1250,75 (ou deixe em branco para 0)"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={balanceInput}
                onChangeText={setBalanceInput}
              />

              <Text style={styles.label}>Total Investido Inicialmente:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 5000,00 (ou deixe em branco para 0)"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={investedInput}
                onChangeText={setInvestedInput}
              />

              <Text style={styles.label}>Limite Total do Cartão de Crédito:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 2000,00 (ou deixe em branco para 0)"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={limitInput}
                onChangeText={setLimitInput}
              />

              <Text style={styles.label}>Fatura Aberta Atual do Cartão (Saldo Devedor):</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 350,00 (ou deixe em branco para 0)"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={initialBillInput}
                onChangeText={setInitialBillInput}
              />

              <View style={styles.buttonContainer}>
                <Button title="Cancelar" onPress={onClose} color={colors.danger} />
                <View style={styles.buttonSpacer} />
                <Button title="Salvar Configurações" onPress={handleSave} color={colors.primary}/>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InitialSetupModal;