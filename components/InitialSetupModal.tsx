// GastosApp/components/InitialSetupModal.tsx
import React, { useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

interface InitialSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSetup: (data: { balance: number; invested: number }) => void;
  currentInitialBalance: number;
  currentInitialInvested: number;
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
    width: '85%',
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
    marginBottom: 20,
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
    marginTop: 10,
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
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [balanceInput, setBalanceInput] = useState<string>('');
  const [investedInput, setInvestedInput] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setBalanceInput(currentInitialBalance > 0 ? currentInitialBalance.toFixed(2).replace('.', ',') : '');
      setInvestedInput(currentInitialInvested > 0 ? currentInitialInvested.toFixed(2).replace('.', ',') : '');
    }
  }, [visible, currentInitialBalance, currentInitialInvested]);

  const handleSave = () => {
    const balanceValue = parseFloat(balanceInput.replace(',', '.')) || 0;
    const investedValue = parseFloat(investedInput.replace(',', '.')) || 0;

    if (isNaN(balanceValue) || balanceValue < 0 || isNaN(investedValue) || investedValue < 0) {
      alert('Por favor, insira valores válidos (ou deixe 0).');
      return;
    }
    onSaveSetup({ balance: balanceValue, invested: investedValue });
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
            <Text style={styles.modalText}>Configuração Inicial de Saldos</Text>

            <Text style={styles.label}>Saldo Inicial em Conta:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1250.75"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={balanceInput}
              onChangeText={setBalanceInput}
            />

            <Text style={styles.label}>Total Investido Inicialmente:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5000.00"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={investedInput}
              onChangeText={setInvestedInput}
            />

            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color={colors.danger} />
              <View style={styles.buttonSpacer} />
              <Button title="Salvar Saldos" onPress={handleSave} color={colors.primary}/>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InitialSetupModal;