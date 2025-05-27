// GastosApp/app/index.tsx
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

import BalanceDisplay from '../components/BalanceDisplay';
import CreditCardLimitModal from '../components/CreditCardLimitModal';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import InitialSetupModal from '../components/InitialSetupModal';
import { ExpenseCategory } from '../constants/commonExpenses';
import {
  loadCreditCardBill,
  loadCreditCardLimit,
  loadInitialAccountBalance,
  loadTotalInvested,
  loadTransactions,
  saveCreditCardBill,
  saveCreditCardLimit,
  saveInitialAccountBalance,
  saveTotalInvested,
  saveTransactions
} from '../services/storage';
import { Transaction } from '../types';

const IOS_HEADER_OFFSET = 64;

const AddIncomeModal: React.FC<{visible: boolean, onClose: () => void, onAddIncome: (amount: number, description: string) => void}> =
 ({visible, onClose, onAddIncome}) => {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddIncome(numericAmount, description.trim());
      setAmount('');
      setDescription('');
      onClose();
    } else {
      Alert.alert("Erro", "Por favor, preencha descrição e valor válidos.");
    }
  };

  const themedModalStyles = getModalStyles(colors);

  return (
    <RNModal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={themedModalStyles.keyboardAvoidingContainer}
      >
        <View style={themedModalStyles.centeredView}>
          <View style={[themedModalStyles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[themedModalStyles.modalText, { color: colors.text }]}>Adicionar Entrada 💰</Text>
            <TextInput
              style={[themedModalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Descrição (Ex: Salário, Freelance)"
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={[themedModalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Valor do Aporte"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={themedModalStyles.buttonContainer}>
              <Button title="Cancelar" onPress={onClose} color={colors.danger}/>
              <View style={themedModalStyles.buttonSpacer} />
              <Button title="Adicionar" onPress={handleAdd} color={colors.primary} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};


export default function HomeScreen() {
  const { colors, theme, toggleTheme, isDark } = useTheme();
  const [initialAccountBalance, setInitialAccountBalance] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [creditCardBill, setCreditCardBill] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [creditCardLimit, setCreditCardLimit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState<boolean>(false);
  const [isAddIncomeModalVisible, setIsAddIncomeModalVisible] = useState<boolean>(false);
  const [isCreditCardLimitModalVisible, setIsCreditCardLimitModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.headerBackground },
      headerTintColor: colors.headerText,
      headerLeft: () => (
        <Button
            onPress={() => setIsInitialSetupModalVisible(true)}
            title={initialAccountBalance > 0 || totalInvested > 0 ? "Editar Saldos" : "Saldos Iniciais"}
            color={Platform.OS === 'ios' ? colors.primary : colors.headerText }
        />
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button
            onPress={() => setIsAddIncomeModalVisible(true)}
            title="Entrada R$"
            color={Platform.OS === 'ios' ? colors.success : colors.headerText}
          />
          <View style={{ marginHorizontal: Platform.OS === 'ios' ? 10 : 8 }}>
            <Button
             onPress={() => setIsCreditCardLimitModalVisible(true)}
             title="Limite CC"
             color={Platform.OS === 'ios' ? colors.warning : colors.headerText}
            />
          </View>
          <TouchableOpacity onPress={toggleTheme} style={{ paddingHorizontal: Platform.OS === 'ios' ? 5 : 8, paddingRight: Platform.OS === 'ios' ? 10 : 5 }}>
            <Text style={{ fontSize: 24, color: colors.icon }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, initialAccountBalance, totalInvested, colors, theme, toggleTheme]);


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedInitialBalance = await loadInitialAccountBalance();
        const loadedTransactions = await loadTransactions();
        const loadedCreditCardBill = await loadCreditCardBill();
        const loadedTotalInvested = await loadTotalInvested();
        const loadedCreditCardLimit = await loadCreditCardLimit();

        setInitialAccountBalance(loadedInitialBalance);
        setTransactions(loadedTransactions);
        setCreditCardBill(loadedCreditCardBill);
        setTotalInvested(loadedTotalInvested);
        setCreditCardLimit(loadedCreditCardLimit);

        let newCurrentBalance = loadedInitialBalance;
        loadedTransactions.forEach(tr => {
          if (tr.type === 'income') {
            newCurrentBalance += tr.amount;
          } else if (tr.type === 'expense' && tr.paymentMethod === 'saldo') {
            newCurrentBalance -= tr.amount;
          } else if (tr.type === 'investment' && tr.paymentMethod === 'para_investimento') {
            newCurrentBalance -= tr.amount;
          }
        });
        setCurrentBalance(newCurrentBalance);

        if (loadedInitialBalance === 0 && loadedTransactions.length === 0 && loadedTotalInvested === 0 && !isInitialSetupModalVisible) {
          setTimeout(() => setIsInitialSetupModalVisible(true), 200);
        }
      } catch (error) {
        console.error("Falha ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);


  useEffect(() => { if (!isLoading && initialAccountBalance !== undefined) saveInitialAccountBalance(initialAccountBalance); }, [initialAccountBalance, isLoading]);
  useEffect(() => { if (!isLoading && transactions !== undefined) saveTransactions(transactions); }, [transactions, isLoading]);
  useEffect(() => { if (!isLoading && creditCardBill !== undefined) saveCreditCardBill(creditCardBill); }, [creditCardBill, isLoading]);
  useEffect(() => { if (!isLoading && totalInvested !== undefined) saveTotalInvested(totalInvested); }, [totalInvested, isLoading]);
  useEffect(() => { if (!isLoading && creditCardLimit !== undefined) saveCreditCardLimit(creditCardLimit); }, [creditCardLimit, isLoading]);


  const handleInitialSetup = (data: { balance: number; invested: number }) => {
    setInitialAccountBalance(data.balance);
    setTotalInvested(data.invested);
    let newBalance = data.balance;
    let currentCardBillCalc = 0;

    transactions.forEach(tr => {
      if (tr.type === 'income') {
        newBalance += tr.amount;
      } else if (tr.type === 'expense') {
        if (tr.paymentMethod === 'saldo') {
          newBalance -= tr.amount;
        } else if (tr.paymentMethod === 'cartao') {
          currentCardBillCalc += tr.amount;
        }
      } else if (tr.type === 'investment') {
         if (tr.paymentMethod === 'para_investimento'){
            newBalance -= tr.amount;
        }
      }
    });
    setCurrentBalance(newBalance);
    setCreditCardBill(currentCardBillCalc);
    setIsInitialSetupModalVisible(false);
  };

  const handleAddIncome = (amount: number, description: string) => {
    const newIncome: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      description,
      amount,
      date: new Date().toISOString(),
      type: 'income',
      paymentMethod: 'saldo',
      notes: `Aporte: ${description}`
    };
    setTransactions(prev => [...prev, newIncome]);
    setCurrentBalance(prev => prev + amount);
  };

  const handleAddTransaction = (
    transactionData: Omit<Transaction, 'id' | 'date' | 'type'> & { categoryDetails?: ExpenseCategory; notes?: string }
  ) => {
    const isInvestment = transactionData.categoryDetails?.type === 'investment';

    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      description: transactionData.description,
      amount: transactionData.amount,
      type: isInvestment ? 'investment' : 'expense',
      paymentMethod: transactionData.paymentMethod,
      category: transactionData.categoryDetails?.name,
      notes: transactionData.notes,
    };

    setTransactions(prev => [...prev, newTransaction]);

    if (isInvestment) {
      if (newTransaction.paymentMethod === 'para_investimento') {
          setCurrentBalance(prev => prev - newTransaction.amount);
          setTotalInvested(prev => prev + newTransaction.amount);
      }
    } else {
      if (newTransaction.paymentMethod === 'saldo') {
        setCurrentBalance(prev => prev - newTransaction.amount);
      } else if (newTransaction.paymentMethod === 'cartao') {
        setCreditCardBill(prev => prev + newTransaction.amount);
      }
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const transactionToDelete = transactions.find(tr => tr.id === transactionId);
    if (!transactionToDelete) return;
    setTransactions(prev => prev.filter(tr => tr.id !== transactionId));
    if (transactionToDelete.type === 'income') {
      setCurrentBalance(prev => prev - transactionToDelete.amount);
    } else if (transactionToDelete.type === 'expense') {
      if (transactionToDelete.paymentMethod === 'saldo') {
        setCurrentBalance(prev => prev + transactionToDelete.amount);
      } else if (transactionToDelete.paymentMethod === 'cartao') {
        setCreditCardBill(prev => prev - transactionToDelete.amount);
      }
    } else if (transactionToDelete.type === 'investment') {
      if (transactionToDelete.paymentMethod === 'para_investimento') {
        setCurrentBalance(prev => prev + transactionToDelete.amount);
        setTotalInvested(prev => prev - transactionToDelete.amount);
      }
    }
  };

   const handleSetCreditCardLimit = (limit: number) => {
    setCreditCardLimit(limit);
    setIsCreditCardLimitModalVisible(false);
  };

  const themedAppStyles = getThemedStyles(colors, isDark);

  const listHeader = (
    <>
      <Text style={themedAppStyles.appTitle}>Suxen Finance</Text>
      <BalanceDisplay
        initialAccountBalance={initialAccountBalance}
        currentBalance={currentBalance}
        creditCardBill={creditCardBill}
        totalInvested={totalInvested}
        creditCardLimit={creditCardLimit}
      />
      <ExpenseForm onAddTransaction={handleAddTransaction} />
      <Text style={themedAppStyles.transactionHistoryTitle}>Histórico de Transações 🧾</Text>
    </>
  );

  if (isLoading) {
    return (
      <View style={[themedAppStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[themedAppStyles.loadingText, { color: colors.text }]}>Carregando seus dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[themedAppStyles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? IOS_HEADER_OFFSET : 0}
      >
        <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ExpenseList
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          headerContent={listHeader}
        />
      </KeyboardAvoidingView>

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={handleInitialSetup}
        currentInitialBalance={initialAccountBalance}
        currentInitialInvested={totalInvested}
      />
      <AddIncomeModal
        visible={isAddIncomeModalVisible}
        onClose={() => setIsAddIncomeModalVisible(false)}
        onAddIncome={handleAddIncome}
      />
      <CreditCardLimitModal
        visible={isCreditCardLimitModalVisible}
        currentLimit={creditCardLimit}
        onClose={() => setIsCreditCardLimitModalVisible(false)}
        onSaveLimit={handleSetCreditCardLimit}
      />
    </SafeAreaView>
  );
}

const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    // color: colors.text, // Aplicado dinamicamente no JSX
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginVertical: 15,
  },
  transactionHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: colors.text,
    paddingHorizontal: 15,
  },
});

const getModalStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    // backgroundColor: colors.card, // Aplicado dinamicamente no JSX
    borderRadius: 20,
    padding: 35,
    alignItems: 'stretch',
    shadowColor: '#000', // A sombra pode ser menos visível ou diferente no modo escuro
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
    // color: colors.text, // Aplicado dinamicamente no JSX
  },
  input: { 
    height: 45,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 5,
    fontSize: 16,
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