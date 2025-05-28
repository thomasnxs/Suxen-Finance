// GastosApp/app/(tabs)/home.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LinearGradient } from 'expo-linear-gradient'; // Comentado pois GradientButton já usa
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    KeyboardAvoidingView,
    Platform,
    Modal as RNModal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput, // Mantido para os botões no headerControlsContainer
    View
} from 'react-native';

// Caminhos de importação ajustados para ../../
import BalanceDisplay from '../../components/BalanceDisplay';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseList from '../../components/ExpenseList';
import GradientButton from '../../components/GradientButton';
import InitialSetupModal from '../../components/InitialSetupModal';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import { ThemeColors } from '../../constants/colors';
import { ExpenseCategory } from '../../constants/commonExpenses';
import { useTheme } from '../../contexts/ThemeContext';
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
} from '../../services/storage';
import { Transaction } from '../../types';


const IOS_HEADER_OFFSET = 64;

const ASYNC_STORAGE_KEYS_TO_CLEAR = [
  '@GastosApp:initialAccountBalance',
  '@GastosApp:transactions',
  '@GastosApp:creditCardBill',
  '@GastosApp:totalInvested',
  '@GastosApp:creditCardLimit',
  '@SuxenFinance:theme'
];

const AddIncomeModal: React.FC<{visible: boolean, onClose: () => void, onAddIncome: (amount: number, description: string) => void}> =
 ({visible, onClose, onAddIncome}) => {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAmountChange = (text: string) => {
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
    setAmount(cleanedText);
  };

  const handleAdd = () => {
    const numericAmount = parseFloat(amount.replace(',', '.')) || 0; 
    if (description.trim() && numericAmount > 0) {
      onAddIncome(numericAmount, description.trim());
      setAmount('');
      setDescription('');
      onClose();
    } else {
      Alert.alert("Erro", "Por favor, preencha descrição e um valor numérico positivo válido.");
    }
  };

  const themedModalStyles = getModalStyles(colors); // Esta função DEVE estar definida no final do arquivo
  return (
    <RNModal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={themedModalStyles.keyboardAvoidingContainer} >
        <View style={themedModalStyles.centeredView}>
          <View style={[themedModalStyles.modalView, { backgroundColor: colors.card, maxHeight: 'auto' }]}>
            <Text style={[themedModalStyles.modalText, { color: colors.text }]}>Adicionar Entrada 💰</Text>
            <TextInput style={[themedModalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Descrição (Ex: Salário, Freelance)" placeholderTextColor={colors.placeholder} value={description} onChangeText={setDescription} />
            <TextInput 
                style={[themedModalStyles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
                placeholder="Valor do Aporte (Ex: 150,50)" 
                placeholderTextColor={colors.placeholder} 
                keyboardType="numeric" 
                value={amount} 
                onChangeText={handleAmountChange} 
            />
            <View style={themedModalStyles.buttonContainer}>
              <GradientButton title="Cancelar" onPress={onClose} type="danger" style={{flex: 1, marginRight: themedModalStyles.buttonSpacer.width }}/>
              <GradientButton title="Adicionar" onPress={handleAdd} type="primary" style={{flex: 1}}/>
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
    navigation.getParent()?.setOptions({ 
      title: "Nome do App", 
      headerTitleAlign: 'center', 
      headerStyle: { backgroundColor: colors.headerBackground },
      headerTintColor: colors.headerText,
      headerLeft: () => null, 
      headerRight: () => null,
    });
  }, [navigation, colors, theme]); 

  useEffect(() => {
    const clearDevelopmentData = async () => {
      if (__DEV__) {
        console.log("DEV: Limpando dados do AsyncStorage ao iniciar...");
        try {
          for (const key of ASYNC_STORAGE_KEYS_TO_CLEAR) {
            await AsyncStorage.removeItem(key);
          }
        } catch (error) {
          console.error("DEV: Erro ao limpar AsyncStorage:", error);
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
  }, [setTheme]);


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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description, amount, date: new Date().toISOString(), type: 'income', paymentMethod: 'saldo', notes: `Entrada: ${description}`
    };
    setTransactions(prev => [newIncome, ...prev]);
    setCurrentBalance(prev => prev + amount);
  };

  type AddTransactionData = Omit<Transaction, 'id' | 'date' | 'type'> & { categoryDetails?: ExpenseCategory; notes?: string };
  const handleAddTransaction = (transactionData: AddTransactionData) => {
    const isInvestment = transactionData.categoryDetails?.type === 'investment';
    const isCreditCardPayment = transactionData.categoryDetails?.type === 'cc_payment';
    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
    if (!transactionToDelete) {
        console.warn("Deleção: Transação não encontrada com ID:", transactionId);
        Alert.alert("Erro", "Não foi possível encontrar a transação para excluir.");
        return;
    }
    Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja excluir a transação "${transactionToDelete.description}"?`,
        [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: () => {
                    console.log("EXCLUINDO:", transactionToDelete.id); 
                    setTransactions(prevTransactions => 
                        prevTransactions.filter(tr => tr.id !== transactionToDelete.id)
                    );
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
                    if (isTransactionDetailModalVisible) {
                        setIsTransactionDetailModalVisible(false);
                        setSelectedTransactionForDetail(null);
                    }
                }
            }
        ],
        { cancelable: true }
    );
  };

  const handleOpenTransactionDetailModal = (transaction: Transaction) => {
    setSelectedTransactionForDetail(transaction);
    setIsTransactionDetailModalVisible(true);
  };

  const themedAppStyles = getThemedStyles(colors, isDark);
  const listHeader = (
    <>
      <View style={themedAppStyles.headerControlsContainer}>
        <GradientButton 
            title={initialAccountBalance > 0 || totalInvested > 0 || creditCardLimit > 0 ? "Editar Iniciais" : "Config. Inicial"}
            onPress={() => setIsInitialSetupModalVisible(true)}
            type="primary"
            style={themedAppStyles.gradientButtonWrapper}
            textStyle={themedAppStyles.gradientButtonText} 
            disabled={isLoading}
        />
        <GradientButton 
            title="Entrada R$"
            onPress={() => setIsAddIncomeModalVisible(true)}
            type="success"
            style={themedAppStyles.gradientButtonWrapper}
            textStyle={themedAppStyles.gradientButtonText}
            disabled={isLoading}
        />
        <View style={themedAppStyles.themeSwitchGroup}>
          <Text style={[themedAppStyles.themeIcon, {color: colors.icon}]}>☀️</Text>
          <Switch
            trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
            thumbColor={isDark ? colors.primary : colors.switchThumb}
            ios_backgroundColor={colors.border}
            onValueChange={toggleTheme}
            value={isDark}
            style={themedAppStyles.themeSwitch}
            disabled={isLoading}
          />
          <Text style={[themedAppStyles.themeIcon, {color: colors.icon}]}>🌙</Text>
        </View>
      </View>
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
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ExpenseList transactions={transactions} onOpenDetailModal={handleOpenTransactionDetailModal} headerContent={listHeader} />
      </KeyboardAvoidingView>

      <InitialSetupModal visible={isInitialSetupModalVisible} onClose={() => setIsInitialSetupModalVisible(false)} onSaveSetup={handleInitialSetup} currentInitialBalance={initialAccountBalance} currentInitialInvested={totalInvested} currentCreditCardLimit={creditCardLimit} currentCreditCardBill={creditCardBill} />
      <AddIncomeModal visible={isAddIncomeModalVisible} onClose={() => setIsAddIncomeModalVisible(false)} onAddIncome={handleAddIncome} />
      {selectedTransactionForDetail && ( <TransactionDetailModal visible={isTransactionDetailModalVisible} transaction={selectedTransactionForDetail} onClose={() => { setIsTransactionDetailModalVisible(false); setSelectedTransactionForDetail(null); }} onDelete={handleDeleteTransaction} /> )}
    </SafeAreaView>
  );
}

// Estilos (getThemedStyles e getModalStyles) - Mantidos conforme sua última versão enviada
const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
  safeArea: { flex: 1, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 10, fontSize: 16, color: colors.text },
  transactionHistoryTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center', color: colors.text, paddingHorizontal: 15, },
  headerControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 10, 
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 15, 
  },
  gradientButtonWrapper: { 
    flex: 1, 
    marginHorizontal: 4, 
  },
  gradientButtonText: { 
    color: '#ffffff', 
    fontSize: Platform.OS === 'ios' ? 13 : 12, 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  themeSwitchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    flex: 0.8, 
  },
  themeIcon: {
    fontSize: 18, 
    color: colors.icon, 
    marginHorizontal: Platform.OS === 'ios' ? 3 : 2, 
  },
  themeSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], 
  }
});

const getModalStyles = (colors: ThemeColors) => StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  centeredView: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', },
  modalView: { margin: 20, borderRadius: 20, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', backgroundColor: colors.card, maxHeight: '85%' },
  modalText: { marginBottom: 15, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: colors.text },
  input: { height: 45, borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, width: '100%', borderRadius: 5, fontSize: 16, color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  buttonSpacer: { width: 5, }
});