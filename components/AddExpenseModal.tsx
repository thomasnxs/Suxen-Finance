// GastosApp/components/AddExpenseModal.tsx
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Modal as RNModal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { commonExpenseSuggestions, ExpenseCategory } from '../constants/commonExpenses';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';
import GradientButton from './GradientButton';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense: (data: Omit<Transaction, 'id' | 'date' | 'type' | 'paymentMethod'> & { categoryDetails?: ExpenseCategory, paymentMethodSelection: 'saldo' | 'cartao' }) => void;
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  keyboardAvoidingContainer: { 
    flex: 1, 
  },
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 15,
    paddingHorizontal: 20, // Padding horizontal
    paddingTop: 20,       // Padding no topo
    paddingBottom: 15,    // Padding na base (antes dos botões, se não estiverem no scroll)
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '90%', 
  },
  scrollViewContent: { 
    paddingBottom: 10, // Espaço no final do scroll para os botões não colarem
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 15, // Reduzido
    textAlign: 'center' 
  },
  input: { 
    height: 45, 
    borderColor: colors.border, 
    borderWidth: 1, 
    marginBottom: 10, // Reduzido
    paddingHorizontal: 10, 
    borderRadius: 5, 
    backgroundColor: colors.background, 
    color: colors.text, 
    fontSize: 16 
  },
  notesInput: { 
    minHeight: 60, // Reduzido um pouco
    textAlignVertical: 'top', 
    paddingTop: 10 
  },
  descriptionButton: { 
    minHeight: 45, 
    borderColor: colors.border, 
    borderWidth: 1, 
    marginBottom: 10, // Reduzido
    paddingHorizontal: 10, 
    paddingVertical: 12, 
    borderRadius: 5, 
    justifyContent: 'center', 
    backgroundColor: colors.background 
  },
  descriptionButtonText: { fontSize: 16, color: colors.text }, // Adicionado color aqui para o texto digitado
  suggestionsContainer: { 
    maxHeight: 130, // Reduzido um pouco para economizar espaço
    borderColor: colors.border, 
    borderWidth: 1, 
    borderRadius: 5, 
    marginBottom: 10, 
    backgroundColor: colors.card 
  },
  suggestionItem: { paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.border }, // Reduzido paddingVertical
  suggestionText: { fontSize: 16, color: colors.text },
  suggestionTextBold: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  switchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    marginVertical: 10, // Reduzido
    paddingVertical: 8,  // Reduzido
  },
  paymentLabel: { fontSize: 16, color: colors.secondaryText },
  activeText: { fontWeight: 'bold', color: colors.primary },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15, // Reduzido
    // paddingBottom: 5, // Adicionado para dar espaço se não estiver no ScrollView
  },
  buttonSpacer: { width: 5 }
});

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ visible, onClose, onAddExpense }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethodSelection, setPaymentMethodSelection] = useState<'saldo' | 'cartao'>('saldo');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const expenseOnlySuggestions = commonExpenseSuggestions.filter(
    cat => cat.type !== 'investment' && cat.type !== 'cc_payment'
  );

  useEffect(() => {
    if (!visible) {
      setDescription('');
      setSelectedCategory(null);
      setAmount('');
      setNotes('');
      setPaymentMethodSelection('saldo');
      setShowSuggestions(false);
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

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
    const finalDescription = selectedCategory ? selectedCategory.name : description;

    if (finalDescription.trim() && numericAmount > 0) {
      onAddExpense({
        description: finalDescription.trim(),
        amount: numericAmount,
        categoryDetails: selectedCategory || undefined,
        notes: notes.trim() || undefined,
        paymentMethodSelection: paymentMethodSelection,
      });
      onClose(); 
    } else {
      Alert.alert('Erro', 'Por favor, preencha descrição e um valor numérico positivo válido.');
    }
  };

  const selectSuggestion = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setDescription(category.name); 
    setShowSuggestions(false);
  };

  const handleDescriptionTextChange = (text: string) => {
    setDescription(text);
    setSelectedCategory(null);
  };

  const displayedDescription = selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : description;
  const descriptionButtonTextColor = description || selectedCategory ? colors.text : colors.placeholder;

  return (
    <RNModal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoidingContainer} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} // Pode precisar de ajuste
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollViewContent} // Aplicado aqui
            >
              <Text style={styles.modalTitle}>Adicionar Novo Gasto</Text>

              <TouchableOpacity style={styles.descriptionButton} onPress={() => setShowSuggestions(prev => !prev)}>
                <Text style={[styles.descriptionButtonText, { color: descriptionButtonTextColor }]}>
                  {displayedDescription || "Clique para selecionar ou digitar descrição"}
                </Text>
              </TouchableOpacity>

              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView nestedScrollEnabled={true}>
                    <TouchableOpacity style={styles.suggestionItem} onPress={() => { setDescription(''); setSelectedCategory(null); setShowSuggestions(false); }}>
                      <Text style={styles.suggestionTextBold}>-- Digitar Personalizado --</Text>
                    </TouchableOpacity>
                    {expenseOnlySuggestions.map((category) => (
                      <TouchableOpacity key={category.key} style={styles.suggestionItem} onPress={() => selectSuggestion(category)}>
                        <Text style={styles.suggestionText}>{category.emoji} {category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {!selectedCategory && !showSuggestions && (
                <TextInput
                  style={styles.input}
                  placeholder="Ou digite a descrição aqui..."
                  placeholderTextColor={colors.placeholder}
                  value={description}
                  onChangeText={handleDescriptionTextChange}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Valor (Ex: 15,50)"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange}
              />

              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Observações (opcional)"
                placeholderTextColor={colors.placeholder}
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <View style={styles.switchContainer}>
                <Text style={[styles.paymentLabel, paymentMethodSelection === 'saldo' ? styles.activeText : {color: colors.secondaryText} ]}>Saldo</Text>
                <Switch
                  trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
                  thumbColor={paymentMethodSelection === 'cartao' ? colors.accent : colors.switchThumb}
                  ios_backgroundColor={colors.border}
                  onValueChange={() => setPaymentMethodSelection(prev => prev === 'saldo' ? 'cartao' : 'saldo')}
                  value={paymentMethodSelection === 'cartao'}
                />
                <Text style={[styles.paymentLabel, paymentMethodSelection === 'cartao' ? styles.activeText : {color: colors.secondaryText} ]}>Cartão</Text>
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton title="Cancelar" onPress={onClose} type="danger" style={{ flex: 1, marginRight: styles.buttonSpacer.width }} />
                <GradientButton title="Adicionar Gasto" onPress={handleSubmit} type="primary" style={{ flex: 1, marginLeft: styles.buttonSpacer.width }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

export default AddExpenseModal;