// GastosApp/components/EditTransactionModal.tsx
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Modal as RNModal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { commonExpenseSuggestions, ExpenseCategory } from '../constants/commonExpenses';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';
import GradientButton from './GradientButton';

interface EditTransactionModalProps {
  visible: boolean;
  transactionToEdit: Transaction | null;
  onClose: () => void;
  onSaveEdit: (editedTransaction: Transaction) => void;
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { 
    margin: 20, 
    backgroundColor: colors.card, 
    borderRadius: 15, 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 15, 
    alignItems: 'stretch', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5, 
    width: '90%', 
    maxHeight: '90%', 
    overflow: 'hidden' 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' },
  formScrollView: {}, // Pode ser usado para aplicar flex:1 ao ScrollView se necessário
  scrollViewContent: { // Estilo para o contentContainer do ScrollView
    flexGrow: 1, 
    paddingBottom: 10, 
  },
  input: { height: 45, borderColor: colors.border, borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5, backgroundColor: colors.background, color: colors.text, fontSize: 16 },
  notesInput: { minHeight: 60, textAlignVertical: 'top', paddingTop: 10 },
  descriptionButton: { minHeight: 45, borderColor: colors.border, borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 5, justifyContent: 'center', backgroundColor: colors.background },
  descriptionButtonText: { fontSize: 16, color: colors.text },
  suggestionsContainer: { maxHeight: 130, borderColor: colors.border, borderWidth: 1, borderRadius: 5, marginBottom: 10, backgroundColor: colors.card },
  suggestionItem: { paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.border }, 
  suggestionText: { fontSize: 16, color: colors.text },
  suggestionTextBold: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 10, paddingVertical: 8,  },
  paymentLabel: { fontSize: 16, color: colors.secondaryText },
  activeText: { fontWeight: 'bold', color: colors.primary },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop:10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  buttonSpacer: { width: 5 },
  infoText: { fontSize: 14, color: colors.secondaryText, fontStyle: 'italic', textAlign: 'center', marginBottom: 10, },
});

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ visible, transactionToEdit, onClose, onSaveEdit }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethodSelection, setPaymentMethodSelection] = useState<'saldo' | 'cartao'>('saldo');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Armazenar o tipo original para lógica condicional
  const [originalType, setOriginalType] = useState<Transaction['type']>();

  // Filtra sugestões para excluir 'investment' e 'cc_payment' se for uma despesa
  const availableSuggestions = commonExpenseSuggestions.filter(cat => {
    if (originalType === 'expense') return cat.type !== 'investment' && cat.type !== 'cc_payment';
    return true; 
  });

  useEffect(() => {
    if (transactionToEdit && visible) {
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toFixed(2).replace('.', ',')); // Formata para string com vírgula
      setNotes(transactionToEdit.notes || '');
      setOriginalType(transactionToEdit.type);

      if (transactionToEdit.type === 'expense' && (transactionToEdit.paymentMethod === 'saldo' || transactionToEdit.paymentMethod === 'cartao')) {
        setPaymentMethodSelection(transactionToEdit.paymentMethod as 'saldo' | 'cartao');
      } else {
        setPaymentMethodSelection('saldo'); 
      }

      const categoryMatch = commonExpenseSuggestions.find(cat => cat.name === transactionToEdit.category);
      if (categoryMatch) {
        setSelectedCategory(categoryMatch);
      } else {
        setSelectedCategory(null); // Garante que não haja categoria selecionada se não for das sugestões
      }
      setShowSuggestions(false);

    } else if (!visible) {
      // Opcional: Resetar os campos quando o modal é fechado pode ser feito aqui se desejar,
      // mas o useEffect já preenche quando uma nova `transactionToEdit` chega.
    }
  }, [transactionToEdit, visible]);
  
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

  const handleSave = () => {
    if (!transactionToEdit) return;

    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
    // Se a categoria foi deselecionada e o usuário digitou, usar a descrição digitada.
    // Se uma categoria está selecionada, usar o nome dela.
    const finalDescription = selectedCategory ? selectedCategory.name : description;

    if (finalDescription.trim() && numericAmount > 0) {
      const editedTransaction: Transaction = {
        ...transactionToEdit, 
        description: finalDescription.trim(),
        amount: numericAmount,
        category: selectedCategory?.name || (originalType === 'income' ? undefined : finalDescription.trim()),
        notes: notes.trim() || undefined,
        paymentMethod: (originalType === 'expense' && transactionToEdit.category !== "Pagamento de Fatura CC") 
                        ? paymentMethodSelection 
                        : transactionToEdit.paymentMethod,
      };
      onSaveEdit(editedTransaction);
      // onClose(); // O onClose será chamado pela função onSaveEdit no componente pai após salvar
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
    // Se o usuário começa a digitar, remove a categoria selecionada para priorizar o texto digitado
    // A menos que a lista de sugestões esteja aberta e ele vá selecionar outra.
    // Se a intenção é que digitar anule a categoria, então ok.
    if (selectedCategory) {
        setSelectedCategory(null);
    }
  };

  const displayedDescription = selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.name}` : description;
  const descriptionButtonTextColor = description || selectedCategory ? colors.text : colors.placeholder;
  
  const canEditPaymentMethod = originalType === 'expense' && transactionToEdit?.category !== "Pagamento de Fatura CC";

  return (
    <RNModal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex:1}} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} 
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Transação</Text>
            <ScrollView 
              style={styles.formScrollView}
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollViewContent}
            >
              <Text style={styles.infoText}>Tipo: {originalType} (Não editável)</Text>
              <Text style={styles.infoText}>Data Original: {transactionToEdit ? new Date(transactionToEdit.date).toLocaleDateString('pt-BR') : ''} (Não editável)</Text>

              {/* Campo de Descrição / Categoria */}
              {(originalType === 'expense' || originalType === 'investment') && ( // Apenas para despesa e investimento
                <>
                  <TouchableOpacity style={styles.descriptionButton} onPress={() => setShowSuggestions(prev => !prev)}>
                    <Text style={[styles.descriptionButtonText, { color: descriptionButtonTextColor }]}>
                      {displayedDescription || "Selecionar/Digitar Descrição ou Categoria"}
                    </Text>
                  </TouchableOpacity>

                  {showSuggestions && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView nestedScrollEnabled={true}>
                        <TouchableOpacity style={styles.suggestionItem} onPress={() => { 
                          setDescription(transactionToEdit?.description || ''); // Volta para descrição original se limpar categoria
                          setSelectedCategory(null); 
                          setShowSuggestions(false); 
                        }}>
                          <Text style={styles.suggestionTextBold}>-- Digitar Manualmente --</Text>
                        </TouchableOpacity>
                        {availableSuggestions.map((category) => (
                          <TouchableOpacity key={category.key} style={styles.suggestionItem} onPress={() => selectSuggestion(category)}>
                            <Text style={styles.suggestionText}>{category.emoji} {category.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {(!selectedCategory || (selectedCategory && description !== selectedCategory.name)) && !showSuggestions && (
                    <TextInput
                      style={styles.input}
                      placeholder="Descrição da transação"
                      placeholderTextColor={colors.placeholder}
                      value={description} // Usa a descrição do estado que pode ser alterada
                      onChangeText={handleDescriptionTextChange}
                    />
                  )}
                </>
              )}
              {/* Para 'income', a descrição é um input simples */}
              {originalType === 'income' && (
                 <TextInput
                    style={styles.input}
                    placeholder="Descrição da Entrada"
                    placeholderTextColor={colors.placeholder}
                    value={description}
                    onChangeText={setDescription} // Permite edição direta da descrição para income
                />
              )}


              <TextInput
                style={styles.input}
                placeholder="Valor"
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

              {canEditPaymentMethod && (
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
              )}
              
              <View style={styles.buttonContainer}>
                <GradientButton title="Cancelar" onPress={onClose} type="default" style={{ flex: 1, marginRight: styles.buttonSpacer.width }} />
                <GradientButton title="Salvar Alterações" onPress={handleSave} type="primary" style={{ flex: 1, marginLeft: styles.buttonSpacer.width }} />
              </View>
            </ScrollView> 
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

export default EditTransactionModal;