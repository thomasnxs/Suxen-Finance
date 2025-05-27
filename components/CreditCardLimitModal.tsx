// GastosApp/components/CreditCardLimitModal.tsx
import React, { useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

interface CreditCardLimitModalProps {
  visible: boolean;
  currentLimit: number;
  onClose: () => void;
  onSaveLimit: (limit: number) => void;
}

const getModalStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1 },
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
    padding: 35,
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
  buttonSpacer: { width: 10 }
});


const CreditCardLimitModal: React.FC<CreditCardLimitModalProps> = ({ visible, currentLimit, onClose, onSaveLimit }) => {
  const { colors } = useTheme();
  const styles = getModalStyles(colors);

  const [limitInput, setLimitInput] = useState<string>('');

  useEffect(() => {
    if (visible && currentLimit > 0) {
      setLimitInput(currentLimit.toFixed(2).replace('.', ','));
    } else if (visible) {
      setLimitInput('');
    }
  }, [visible, currentLimit]);


  const handleSave = () => {
    const limitValue = parseFloat(limitInput.replace(',', '.'));
    if (!isNaN(limitValue) && limitValue >= 0) {
      onSaveLimit(limitValue);
      onClose();
    } else {
      alert('Por favor, insira um valor de limite válido.');
    }
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
            <Text style={styles.modalText}>Limite do Cartão de Crédito</Text>
            <Text style={styles.label}>Defina o limite total:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5000.00"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={limitInput}
              onChangeText={setLimitInput}
            />
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color={colors.danger} />
              <View style={styles.buttonSpacer} />
              <Button title="Salvar Limite" onPress={handleSave} color={colors.primary}/>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreditCardLimitModal;