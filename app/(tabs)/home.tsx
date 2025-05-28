// GastosApp/app/(tabs)/home.tsx
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  SafeAreaView,
  StatusBar,
  StyleSheet, // Ainda importado, pode ser usado por algum componente que você mantenha ou se o tema voltar para cá
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AddExpenseModal from '../../components/AddExpenseModal'; // Importado o novo modal de gasto
import BalanceDisplay from '../../components/BalanceDisplay';
import ExpenseList from '../../components/ExpenseList';
import GradientButton from '../../components/GradientButton';
// InitialSetupModal não é mais renderizado/controlado aqui
import TransactionDetailModal from '../../components/TransactionDetailModal';
import { ThemeColors } from '../../constants/colors';
import { ExpenseCategory } from '../../constants/commonExpenses';
import { InitialDataContextType, useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  loadTransactions,
  saveCreditCardBill,
  saveTransactions
} from '../../services/storage';
import { Transaction } from '../../types';


const IOS_HEADER_OFFSET = 64;

const ASYNC_STORAGE_KEYS_TO_CLEAR_DEV_HOME = [
  '@GastosApp:transactions',
  '@SuxenFinance:theme',
];

// AddIncomeModal (usa GradientButton)
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

  const themedModalStyles = getModalStyles(colors);
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
  const { colors, isDark } = useTheme(); 
  const { 
    initialAccountBalance, 
    totalInvested, 
    creditCardLimit, 
    creditCardBill: initialCreditCardBill, 
    isLoadingData: isLoadingInitialData,
    updateTotalInvestedOnly 
  } = useInitialData() as InitialDataContextType; 

  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currentCreditCardBill, setCurrentCreditCardBill] = useState<number>(0); 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddIncomeModalVisible, setIsAddIncomeModalVisible] = useState<boolean>(false);
  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState<boolean>(false); // Estado para o novo modal de despesa
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const [selectedTransactionForDetail, setSelectedTransactionForDetail] = useState<Transaction | null>(null);
  const [isTransactionDetailModalVisible, setIsTransactionDetailModalVisible] = useState<boolean>(false);
  const [showActionButtons, setShowActionButtons] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()?.setOptions({ 
      headerStyle: { backgroundColor: colors.headerBackground },
      headerTintColor: colors.headerText,
      headerLeft: () => null, 
      headerRight: () => null,
    });
  }, [navigation, colors]); 

  useEffect(() => {
    const clearDevelopmentData = async () => {
      if (__DEV__) {
        console.log("DEV HOME: Limpando chaves (transações, tema) do AsyncStorage...");
        try {
          for (const key of ASYNC_STORAGE_KEYS_TO_CLEAR_DEV_HOME) {
            await AsyncStorage.removeItem(key);
          }
        } catch (error) {
          console.error("DEV HOME: Erro ao limpar AsyncStorage:", error);
        }
      }
    };

    const loadScreenData = async () => {
      if (isLoadingInitialData) {
        console.log("HomeScreen: Aguardando dados iniciais do contexto...");
        return; 
      }
      setIsLoadingTransactions(true);
      console.log("HomeScreen: Carregando dados da tela. Dados Iniciais Prontos:", {initialAccountBalance, initialCreditCardBill, totalInvested, creditCardLimit});
      try {
        await clearDevelopmentData();

        const loadedTransactions = await loadTransactions();
        setTransactions(loadedTransactions);
        
        let runningBill = initialCreditCardBill; 
        loadedTransactions.forEach(tr => {
          if (tr.type === 'expense' && tr.paymentMethod === 'cartao' && tr.category !== "Pagamento de Fatura CC") {
            runningBill += tr.amount;
          } else if (tr.category === "Pagamento de Fatura CC") {
            runningBill -= tr.amount;
          }
        });
        setCurrentCreditCardBill(runningBill < 0 ? 0 : runningBill);
        await saveCreditCardBill(runningBill < 0 ? 0 : runningBill);

        let newCurrentBalance = initialAccountBalance;
        loadedTransactions.forEach(tr => {
          if (tr.type === 'income') {
            newCurrentBalance += tr.amount;
          } else if (tr.category === "Pagamento de Fatura CC" && tr.paymentMethod === 'saldo') {
            newCurrentBalance -= tr.amount; 
          } else if (tr.type === 'expense' && tr.paymentMethod === 'saldo') { 
            newCurrentBalance -= tr.amount;
          } else if (tr.type === 'investment' && tr.paymentMethod === 'para_investimento') {
            newCurrentBalance -= tr.amount;
          }
        });
        setCurrentBalance(newCurrentBalance);

      } catch (error) {
        console.error("HomeScreen: Falha ao carregar dados da tela:", error);
      } finally {
        setIsLoadingTransactions(false);
        console.log("HomeScreen: Carregamento de dados da tela finalizado.");
      }
    };
    loadScreenData();
  }, [isLoadingInitialData, initialAccountBalance, initialCreditCardBill]);


  useEffect(() => { 
    if (!isLoadingTransactions && !isLoadingInitialData) {
      saveTransactions(transactions); 
    }
  }, [transactions, isLoadingTransactions, isLoadingInitialData]);


  const handleAddIncome = (amount: number, description: string) => {
    const newIncome: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description, amount, date: new Date().toISOString(), type: 'income', paymentMethod: 'saldo', notes: `Entrada: ${description}`
    };
    setTransactions(prev => [newIncome, ...prev]);
    setCurrentBalance(prev => prev + amount);
  };

  // Nova função para adicionar despesa (vinda do AddExpenseModal)
  type AddExpenseModalData = Omit<Transaction, 'id' | 'date' | 'type' | 'paymentMethod'> & { categoryDetails?: ExpenseCategory, paymentMethodSelection: 'saldo' | 'cartao' };
  const handleAddExpense = async (data: AddExpenseModalData) => {
    const newExpense: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      description: data.description,
      amount: data.amount,
      type: 'expense', // Tipo é sempre 'expense'
      paymentMethod: data.paymentMethodSelection,
      category: data.categoryDetails?.name,
      notes: data.notes,
    };
    
    setTransactions(prev => [newExpense, ...prev]);

    if (newExpense.paymentMethod === 'saldo') {
      setCurrentBalance(prev => prev - newExpense.amount);
    } else if (newExpense.paymentMethod === 'cartao') {
      const newBill = currentCreditCardBill + newExpense.amount;
      setCurrentCreditCardBill(newBill);
      await saveCreditCardBill(newBill);
    }
    setIsAddExpenseModalVisible(false); // Fecha o modal de despesa
  };

  // handleAddTransaction: ajustada para ser chamada principalmente por investimentos ou pagamentos de fatura (se reintegrado)
  type AddTransactionData = Omit<Transaction, 'id' | 'date' | 'type'> & { categoryDetails?: ExpenseCategory; notes?: string };
  const handleAddTransaction = async (transactionData: AddTransactionData, isInvestmentFromFab: boolean = false) => {
    const isInvestmentCategory = transactionData.categoryDetails?.type === 'investment';
    const isCreditCardPayment = transactionData.categoryDetails?.type === 'cc_payment'; // Lógica de Pagamento de Fatura CC mantida aqui
    
    let transactionType: Transaction['type'] = 'expense'; // Default para despesa
    if (isInvestmentFromFab || isInvestmentCategory) {
        transactionType = 'investment';
    }
    // Se for cc_payment, o tipo ainda é 'expense', mas com tratamento especial de paymentMethod e lógica de saldo/fatura

    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionType,
      paymentMethod: isCreditCardPayment 
                       ? 'saldo' 
                       : ( (isInvestmentFromFab || isInvestmentCategory) 
                           ? 'para_investimento' 
                           : transactionData.paymentMethod!), // Non-null assertion se transactionData.paymentMethod é esperado aqui
      category: transactionData.categoryDetails?.name || 
                  (isInvestmentFromFab ? "Investimento (App)" : 
                  (isCreditCardPayment ? "Pagamento de Fatura CC" : transactionData.description)),
      notes: transactionData.notes,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);

    if (newTransaction.type === 'investment') {
      if (newTransaction.paymentMethod === 'para_investimento') {
        setCurrentBalance(prev => prev - newTransaction.amount);
        const newTotalInvested = totalInvested + newTransaction.amount;
        await updateTotalInvestedOnly(newTotalInvested); 
      }
    } else if (isCreditCardPayment) { // Transação do tipo 'expense', categoria 'Pagamento de Fatura CC'
      setCurrentBalance(prev => prev - newTransaction.amount); // Deduz do saldo
      const newBill = currentCreditCardBill - newTransaction.amount; // Reduz a fatura
      setCurrentCreditCardBill(newBill < 0 ? 0 : newBill);
      await saveCreditCardBill(newBill < 0 ? 0 : newBill); 
    } 
    // A lógica para despesas normais (não investimento, não pagamento de fatura) foi movida para handleAddExpense
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const transactionToDelete = transactions.find(tr => tr.id === transactionId);
    if (!transactionToDelete) {
        console.warn("Deleção: Transação não encontrada com ID:", transactionId);
        Alert.alert("Erro", "Não foi possível encontrar a transação para excluir.");
        return;
    }
    Alert.alert( "Confirmar Exclusão", `Tem certeza que deseja excluir a transação "${transactionToDelete.description}"?`, [ { text: "Cancelar", style: "cancel" }, { text: "Excluir", style: "destructive", onPress: async () => { setTransactions(prevTransactions => prevTransactions.filter(tr => tr.id !== transactionToDelete.id) ); let billNeedsUpdate = false; let newBill = currentCreditCardBill; if (transactionToDelete.type === 'income') { setCurrentBalance(prev => prev - transactionToDelete.amount); } else if (transactionToDelete.category === "Pagamento de Fatura CC" && transactionToDelete.type === 'expense') { setCurrentBalance(prev => prev + transactionToDelete.amount); newBill = currentCreditCardBill + transactionToDelete.amount; billNeedsUpdate = true; } else if (transactionToDelete.type === 'expense') { if (transactionToDelete.paymentMethod === 'saldo') { setCurrentBalance(prev => prev + transactionToDelete.amount); } else if (transactionToDelete.paymentMethod === 'cartao') { newBill = currentCreditCardBill - transactionToDelete.amount; billNeedsUpdate = true; } } else if (transactionToDelete.type === 'investment') { if (transactionToDelete.paymentMethod === 'para_investimento') { setCurrentBalance(prev => prev + transactionToDelete.amount); const newTotalInvested = totalInvested - transactionToDelete.amount; await updateTotalInvestedOnly(newTotalInvested); } } if(billNeedsUpdate) { setCurrentCreditCardBill(newBill < 0 ? 0 : newBill); await saveCreditCardBill(newBill < 0 ? 0 : newBill); } if (isTransactionDetailModalVisible) { setIsTransactionDetailModalVisible(false); setSelectedTransactionForDetail(null); } } } ], { cancelable: true } );
  };

  const handleOpenTransactionDetailModal = (transaction: Transaction) => {
    setSelectedTransactionForDetail(transaction);
    setIsTransactionDetailModalVisible(true);
  };

  // Funções para os botões de ação do FAB
  const handleOpenGastoModal = () => {
    setShowActionButtons(false); 
    setIsAddExpenseModalVisible(true); // ABRE O MODAL DE DESPESA
  };

  const handleOpenEntradaModal = () => {
    setShowActionButtons(false);
    setIsAddIncomeModalVisible(true);
  };

  const handleOpenInvestimentoModal = () => {
    setShowActionButtons(false);
    // Temporariamente usando Alert.prompt (funciona melhor no nativo)
    // O ideal seria um modal customizado para descrição e valor.
    Alert.prompt(
        "Novo Investimento",
        "Valor do Investimento:",
        async (text) => { // O callback recebe o texto digitado
            const valorStr = text;
            if (valorStr) {
                const valor = parseFloat(valorStr.replace(',', '.')) || 0;
                if (valor > 0) {
                    // Para descrição, podemos usar um valor padrão ou abrir outro prompt/modal
                    // Por agora, vamos usar uma descrição padrão.
                    await handleAddTransaction({
                        description: "Investimento (App)", 
                        amount: valor,
                        // paymentMethod e category são inferidos ou definidos em handleAddTransaction
                        // quando isInvestmentFromFab é true
                    }, true); // true indica que é um investimento do FAB
                } else {
                    Alert.alert("Erro", "Valor inválido para investimento.");
                }
            }
        },
        'plain-text', // Tipo de input para o prompt
        '',           // Valor default no input
        'numeric'     // Tipo de teclado
    );
  };

  const themedAppStyles = getThemedStyles(colors, isDark);
  const listHeader = (
    <>
      {/* headerControlsContainer foi efetivamente removido, pois não tem mais conteúdo */}
      <BalanceDisplay 
        currentBalance={currentBalance} 
        creditCardBill={currentCreditCardBill} 
        initialAccountBalance={initialAccountBalance} 
        totalInvested={totalInvested} 
        creditCardLimit={creditCardLimit} 
      />
      <Text style={themedAppStyles.transactionHistoryTitle}>Histórico de Transações</Text>
    </>
  );

  if (isLoadingInitialData || isLoadingTransactions) {
    return (
      <View style={[themedAppStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[themedAppStyles.loadingText, { color: colors.text }]}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[themedAppStyles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? IOS_HEADER_OFFSET : 0} >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ExpenseList transactions={transactions} onOpenDetailModal={handleOpenTransactionDetailModal} headerContent={listHeader} />
      </KeyboardAvoidingView>

      <TouchableOpacity
        style={[themedAppStyles.fabMain, { backgroundColor: colors.primary }]}
        onPress={() => setShowActionButtons(!showActionButtons)}
        activeOpacity={0.8}
      >
        <FontAwesome name={showActionButtons ? "times" : "plus"} size={24} color="#FFF" />
      </TouchableOpacity>

      {showActionButtons && (
        <View style={themedAppStyles.fabActionsContainer}>
          <TouchableOpacity style={themedAppStyles.fabActionItem} onPress={handleOpenGastoModal}>
            <Text style={[themedAppStyles.fabActionText, {color: colors.text}]}>Gasto</Text>
            <View style={[themedAppStyles.fabActionButton, { backgroundColor: colors.danger }]}>
              <FontAwesome name="shopping-cart" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={themedAppStyles.fabActionItem} onPress={handleOpenEntradaModal}>
             <Text style={[themedAppStyles.fabActionText, {color: colors.text}]}>Entrada</Text>
            <View style={[themedAppStyles.fabActionButton, { backgroundColor: colors.success }]}>
              <FontAwesome name="plus" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={themedAppStyles.fabActionItem} onPress={handleOpenInvestimentoModal}>
            <Text style={[themedAppStyles.fabActionText, {color: colors.text}]}>Investimento</Text>
            <View style={[themedAppStyles.fabActionButton, { backgroundColor: colors.invested }]}>
              <FontAwesome name="line-chart" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <AddIncomeModal visible={isAddIncomeModalVisible} onClose={() => setIsAddIncomeModalVisible(false)} onAddIncome={handleAddIncome} />
      <AddExpenseModal 
        visible={isAddExpenseModalVisible}
        onClose={() => setIsAddExpenseModalVisible(false)}
        onAddExpense={handleAddExpense}
      />
      {selectedTransactionForDetail && ( <TransactionDetailModal visible={isTransactionDetailModalVisible} transaction={selectedTransactionForDetail} onClose={() => { setIsTransactionDetailModalVisible(false); setSelectedTransactionForDetail(null); }} onDelete={handleDeleteTransaction} /> )}
    </SafeAreaView>
  );
}

// Estilos
const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
  safeArea: { flex: 1, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 10, fontSize: 16, color: colors.text },
  transactionHistoryTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center', color: colors.text, paddingHorizontal: 15, },
  headerControlsContainer: { minHeight: 1, borderBottomWidth: 0, marginBottom: 0, paddingVertical:0, paddingHorizontal:0 }, // Esvaziado
  fabMain: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, zIndex: 10 },
  fabActionsContainer: { position: 'absolute', right: 25, bottom: 95, alignItems: 'flex-end', zIndex: 9 },
  fabActionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, },
  fabActionText: { marginRight: 12, backgroundColor: colors.card, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, fontSize: 14, fontWeight: '500' },
  fabActionButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 2, },
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