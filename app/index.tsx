// GastosApp/app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import InitialSetupModal from '../components/InitialSetupModal';
import TransactionDetailModal from '../components/TransactionDetailModal'; // Importa o novo modal
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

const ASYNC_STORAGE_KEYS_TO_CLEAR = [
  '@GastosApp:initialAccountBalance',
  '@GastosApp:transactions',
  '@GastosApp:creditCardBill',
  '@GastosApp:totalInvested',
  '@GastosApp:creditCardLimit',
  '@SuxenFinance:theme'
];

// AddIncomeModal (sem alterações)
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
  const themedModalStyles = getModalStyles(colors); // Assume que getModalStyles está definida no final
  return (
    <RNModal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={themedModalStyles.keyboardAvoidingContainer} >
        <View style={themedModalStyles.centeredView}>
          <View style={[themedModalStyles.modalView, { backgroundColor: colors.card, maxHeight: 'auto' /* Para este modal menor */ }]}>
            <Text style={[themedModalStyles.modalText, { color: colors.text }]}>Adicionar Entrada 💰</Text>
            <TextInput style={[themedModalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Descrição (Ex: Salário, Freelance)" placeholderTextColor={colors.placeholder} value={description} onChangeText={setDescription} />
            <TextInput style={[themedModalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Valor do Aporte" placeholderTextColor={colors.placeholder} keyboardType="numeric" value={amount} onChangeText={setAmount} />
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
  const { colors, theme, toggleTheme, isDark, setTheme } = useTheme();
  const [initialAccountBalance, setInitialAccountBalance] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [creditCardBill, setCreditCardBill] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [creditCardLimit, setCreditCardLimit] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialSetupModalVisible, setIsInitialSetupModalVisible] = useState<boolean>(false);
  const [isAddIncomeModalVisible, setIsAddIncomeModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTransactionForDetail, setSelectedTransactionForDetail] = useState<Transaction | null>(null);
  const [isTransactionDetailModalVisible, setIsTransactionDetailModalVisible] = useState<boolean>(false);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.headerBackground },
      headerTintColor: colors.headerText,
      headerLeft: () => (
        <Button
            onPress={() => setIsInitialSetupModalVisible(true)}
            title={initialAccountBalance > 0 || totalInvested > 0 || creditCardLimit > 0 ? "Editar Iniciais" : "Config. Inicial"}
            color={Platform.OS === 'ios' ? colors.primary : colors.headerText }
        />
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button onPress={() => setIsAddIncomeModalVisible(true)} title="Entrada R$" color={Platform.OS === 'ios' ? colors.success : colors.headerText} />
          <TouchableOpacity onPress={toggleTheme} style={{ paddingLeft: Platform.OS === 'ios' ? 15 : 12, paddingRight: Platform.OS === 'ios' ? 10 : 8 }} >
            <Text style={{ fontSize: 24, color: colors.icon }}>{theme === 'light' ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, initialAccountBalance, totalInvested, creditCardLimit, colors, theme, toggleTheme]);

  useEffect(() => {
    const clearDevelopmentData = async () => {
      if (__DEV__) {
        console.log("Modo DEV: Limpando dados do AsyncStorage...");
        try {
          for (const key of ASYNC_STORAGE_KEYS_TO_CLEAR) {
            await AsyncStorage.removeItem(key);
          }
          // setTheme('light'); // Opcional: Forçar tema após limpar
          console.log("Dados do AsyncStorage limpos para desenvolvimento.");
        } catch (error) {
          console.error("Erro ao limpar dados do AsyncStorage em desenvolvimento:", error);
        }
      }
    };

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await clearDevelopmentData();

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
          } else if (tr.type === 'expense' && tr.category !== "Pagamento de Fatura CC" && tr.paymentMethod === 'saldo') { 
            newCurrentBalance -= tr.amount;
          } else if (tr.type === 'investment' && tr.paymentMethod === 'para_investimento') {
            newCurrentBalance -= tr.amount;
          }
        });
        setCurrentBalance(newCurrentBalance);

        if (loadedInitialBalance === 0 && loadedTransactions.length === 0 && loadedTotalInvested === 0 && loadedCreditCardLimit === 0 && !isInitialSetupModalVisible) {
          setTimeout(() => setIsInitialSetupModalVisible(true), 200);
        }
      } catch (error) {
        console.error("Falha ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, [setTheme]); // Adicionado setTheme à dependência se for usado em clearDevelopmentData


  useEffect(() => { if (!isLoading && initialAccountBalance !== undefined) saveInitialAccountBalance(initialAccountBalance); }, [initialAccountBalance, isLoading]);
  useEffect(() => { if (!isLoading && transactions !== undefined) saveTransactions(transactions); }, [transactions, isLoading]);
  useEffect(() => { if (!isLoading && creditCardBill !== undefined) saveCreditCardBill(creditCardBill); }, [creditCardBill, isLoading]);
  useEffect(() => { if (!isLoading && totalInvested !== undefined) saveTotalInvested(totalInvested); }, [totalInvested, isLoading]);
  useEffect(() => { if (!isLoading && creditCardLimit !== undefined) saveCreditCardLimit(creditCardLimit); }, [creditCardLimit, isLoading]);

  const handleInitialSetup = (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    setInitialAccountBalance(data.balance);
    setTotalInvested(data.invested);
    setCreditCardLimit(data.limit);
    setCreditCardBill(data.initialBill);
    setCurrentBalance(data.balance); 
    setIsInitialSetupModalVisible(false);
  };

  const handleAddIncome = (amount: number, description: string) => {
    const newIncome: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      description, amount, date: new Date().toISOString(), type: 'income', paymentMethod: 'saldo', notes: `Entrada: ${description}`
    };
    setTransactions(prev => [newIncome, ...prev]);
    setCurrentBalance(prev => prev + amount);
  };

  const handleAddTransaction = (
    transactionData: Omit<Transaction, 'id' | 'date' | 'type'> & { categoryDetails?: ExpenseCategory; notes?: string }
  ) => {
    const isInvestment = transactionData.categoryDetails?.type === 'investment';
    const isCreditCardPayment = transactionData.categoryDetails?.type === 'cc_payment';
    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      description: transactionData.description,
      amount: transactionData.amount,
      type: isInvestment ? 'investment' : 'expense',
      paymentMethod: isCreditCardPayment ? 'saldo' : (isInvestment ? 'para_investimento' : transactionData.paymentMethod),
      category: transactionData.categoryDetails?.name,
      notes: transactionData.notes,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    if (isInvestment) {
      if (newTransaction.paymentMethod === 'para_investimento') {
        setCurrentBalance(prev => prev - newTransaction.amount);
        setTotalInvested(prev => prev + newTransaction.amount);
      }
    } else if (isCreditCardPayment) {
      setCurrentBalance(prev => prev - newTransaction.amount);
      setCreditCardBill(prev => prev - newTransaction.amount);
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
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a transação "${transactionToDelete.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => {
            setTransactions(prev => prev.filter(tr => tr.id !== transactionId));
            if (transactionToDelete.type === 'income') {
              setCurrentBalance(prev => prev - transactionToDelete.amount);
            } else if (transactionToDelete.category === "Pagamento de Fatura CC" && transactionToDelete.type === 'expense') {
              setCurrentBalance(prev => prev + transactionToDelete.amount);
              setCreditCardBill(prev => prev + transactionToDelete.amount);
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
            // Fecha o modal de detalhes após a exclusão ser confirmada e processada
            if (isTransactionDetailModalVisible) {
                setIsTransactionDetailModalVisible(false);
                setSelectedTransactionForDetail(null);
            }
          } }
      ]
    );
  };

  const handleOpenTransactionDetailModal = (transaction: Transaction) => {
    setSelectedTransactionForDetail(transaction);
    setIsTransactionDetailModalVisible(true);
  };

  const themedAppStyles = getThemedStyles(colors, isDark);
  const listHeader = (
    <>
      <Text style={themedAppStyles.appTitle}>Suxen Finance</Text>
      <BalanceDisplay currentBalance={currentBalance} creditCardBill={creditCardBill} initialAccountBalance={initialAccountBalance} totalInvested={totalInvested} creditCardLimit={creditCardLimit} />
      <ExpenseForm onAddTransaction={handleAddTransaction} />
      <Text style={themedAppStyles.transactionHistoryTitle}>Histórico de Transações</Text>
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? IOS_HEADER_OFFSET : 0} >
        <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ExpenseList
          transactions={transactions}
          onOpenDetailModal={handleOpenTransactionDetailModal}
          headerContent={listHeader}
        />
      </KeyboardAvoidingView>

      <InitialSetupModal
        visible={isInitialSetupModalVisible}
        onClose={() => setIsInitialSetupModalVisible(false)}
        onSaveSetup={handleInitialSetup}
        currentInitialBalance={initialAccountBalance}
        currentInitialInvested={totalInvested}
        currentCreditCardLimit={creditCardLimit}
        currentCreditCardBill={creditCardBill}
      />
      <AddIncomeModal visible={isAddIncomeModalVisible} onClose={() => setIsAddIncomeModalVisible(false)} onAddIncome={handleAddIncome} />
      
      {selectedTransactionForDetail && (
        <TransactionDetailModal
          visible={isTransactionDetailModalVisible}
          transaction={selectedTransactionForDetail}
          onClose={() => {
            setIsTransactionDetailModalVisible(false);
            setSelectedTransactionForDetail(null);
          }}
          onDelete={handleDeleteTransaction}
        />
      )}
    </SafeAreaView>
  );
}

// Estilos (getThemedStyles, getModalStyles)
const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
  safeArea: { flex: 1, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 10, fontSize: 16, color: colors.text }, // Adicionado color aqui
  appTitle: { fontSize: 26, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginVertical: 15, },
  transactionHistoryTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center', color: colors.text, paddingHorizontal: 15, },
});
const getModalStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  centeredView: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', },
  // Ajuste para maxHeight do modal de AddIncome, que é menor
  modalView: { margin: 20, borderRadius: 20, padding: 35, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '85%', backgroundColor: colors.card, maxHeight: '80%' /* Padrão para modais maiores como o InitialSetup */ },
  modalText: { marginBottom: 20, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.text }, // Adicionado color aqui
  input: { height: 45, borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, width: '100%', borderRadius: 5, fontSize: 16, color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, },
  buttonSpacer: { width: 10, }
});