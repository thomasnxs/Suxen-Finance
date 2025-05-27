// GastosApp/components/ExpenseForm.tsx
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { commonExpenseSuggestions, ExpenseCategory } from '../constants/commonExpenses';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';

interface ExpenseFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'type'> & { categoryDetails?: ExpenseCategory; notes?: string }) => void;
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: isDark ? colors.text : '#000', // Sombra pode ser baseada no texto para contraste
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.45 : 0.23, // Sombra mais forte no escuro
    shadowRadius: isDark ? 5.62 : 2.62,
    elevation: isDark ? 7 : 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.text,
  },
  input: {
    height: 45,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  descriptionButton: {
    minHeight: 45,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  descriptionButtonText: {
    // A cor será condicional no JSX para quando houver texto digitado
    fontSize: 16,
  },
  suggestionsContainer: {
    maxHeight: 180,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: colors.card,
  },
  suggestionsScroll: {},
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text,
  },
  suggestionTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    paddingVertical: 10,
  },
  paymentLabel: {
    fontSize: 16,
    // Cor definida por activeText/inactiveText
  },
  activeText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  inactiveText: {
    color: colors.disabled,
  },
  infoText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginBottom: 15,
  }
});

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddTransaction }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'saldo' | 'cartao'>('saldo');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    const finalDescription = selectedCategory ? selectedCategory.name : description;

    if (finalDescription.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddTransaction({
        description: finalDescription.trim(),
        amount: numericAmount,
        paymentMethod: selectedCategory?.type === 'investment' ? 'para_investimento' : paymentMethod,
        categoryDetails: selectedCategory || undefined,
        notes: notes.trim() || undefined,
      });
      setDescription('');
      setSelectedCategory(null);
      setAmount('');
      setNotes('');
      setShowSuggestions(false);
    } else {
      alert('Por favor, preencha descrição e valor válidos.');
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
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Saída / Investimento 💸</Text>

      <TouchableOpacity
        style={styles.descriptionButton}
        onPress={() => setShowSuggestions(prev => !prev)}
      >
        <Text style={[styles.descriptionButtonText, { color: descriptionButtonTextColor }]}>
          {displayedDescription || "Clique para selecionar ou digitar descrição"}
        </Text>
      </TouchableOpacity>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <ScrollView nestedScrollEnabled={true} style={styles.suggestionsScroll}>
            <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                    setDescription('');
                    setSelectedCategory(null);
                    setShowSuggestions(false);
                }}
            >
                <Text style={styles.suggestionTextBold}>-- Digitar Personalizado --</Text>
            </TouchableOpacity>
            {commonExpenseSuggestions.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.suggestionItem}
                onPress={() => selectSuggestion(category)}
              >
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
        placeholder="Valor (Ex: 15.50)"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Observações (Ex: comprei na promoção)"
        placeholderTextColor={colors.placeholder}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      {selectedCategory?.type !== 'investment' && (
        <View style={styles.switchContainer}>
          <Text style={[styles.paymentLabel, paymentMethod === 'saldo' ? styles.activeText : styles.inactiveText]}>
            Saldo
          </Text>
          <Switch
            trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
            thumbColor={paymentMethod === 'cartao' ? colors.accent : colors.switchThumb}
            ios_backgroundColor={colors.border}
            onValueChange={() => setPaymentMethod(prev => prev === 'saldo' ? 'cartao' : 'saldo')}
            value={paymentMethod === 'cartao'}
          />
          <Text style={[styles.paymentLabel, paymentMethod === 'cartao' ? styles.activeText : styles.inactiveText]}>
            Cartão
          </Text>
        </View>
      )}
      {selectedCategory?.type === 'investment' && (
        <Text style={styles.infoText}>Este valor será deduzido do saldo e adicionado aos investimentos.</Text>
      )}

      <Button
        title={selectedCategory?.type === 'investment' ? "Adicionar Investimento 📈" : "Adicionar Gasto"}
        onPress={handleSubmit}
        color={selectedCategory?.type === 'investment' ? colors.invested : colors.primary}
      />
    </View>
  );
};

export default ExpenseForm;