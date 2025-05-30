// GastosApp/app/(tabs)/home.tsx
import { FontAwesome } from '@expo/vector-icons';
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
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AddExpenseModal from '../../components/AddExpenseModal';
import AdjustBalanceModal from '../../components/AdjustBalanceModal';
import BalanceDisplay from '../../components/BalanceDisplay';
import CartaoDetailModal from '../../components/CartaoDetailModal';
import EditTransactionModal from '../../components/EditTransactionModal';
import ExpenseList from '../../components/ExpenseList';
import GradientButton from '../../components/GradientButton';
import PagarFaturaModal from '../../components/PagarFaturaModal';
import ResgatarInvestimentoModal from '../../components/ResgatarInvestimentoModal';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import { ThemeColors } from '../../constants/colors';
import { commonExpenseSuggestions, ExpenseCategory } from '../../constants/commonExpenses';
import { useInitialData } from '../../contexts/InitialDataContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  loadTransactions,
  saveCreditCardBill,
  saveTransactions
} from '../../services/storage';
import { Transaction } from '../../types';

const IOS_HEADER_OFFSET = 64;

const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

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
  const contextValues = useInitialData(); 
  
  const initialAccountBalance = contextValues?.initialAccountBalance ?? 0;
  const totalInvested = contextValues?.totalInvested ?? 0;
  const creditCardLimit = contextValues?.creditCardLimit ?? 0;
  const initialCreditCardBill = contextValues?.creditCardBill ?? 0;
  const isLoadingInitialData = contextValues?.isLoadingData ?? true;
  const updateTotalInvestedOnly = contextValues?.updateTotalInvestedOnly || (async () => {}); 
  const userName = contextValues?.userName || '';

  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [currentCreditCardBill, setCurrentCreditCardBill] = useState<number>(0); 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddIncomeModalVisible, setIsAddIncomeModalVisible] = useState<boolean>(false);
  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState<boolean>(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const [selectedTransactionForDetail, setSelectedTransactionForDetail] = useState<Transaction | null>(null);
  const [isTransactionDetailModalVisible, setIsTransactionDetailModalVisible] = useState<boolean>(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isCartaoDetailModalVisible, setIsCartaoDetailModalVisible] = useState<boolean>(false); 
  const [isPagarFaturaModalVisible, setIsPagarFaturaModalVisible] = useState<boolean>(false);
  const [isResgatarInvestimentoModalVisible, setIsResgatarInvestimentoModalVisible] = useState<boolean>(false);
  const [isAdjustBalanceModalVisible, setIsAdjustBalanceModalVisible] = useState<boolean>(false);

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
    const loadInitialScreenData = async () => {
      if (isLoadingInitialData) {
        console.log("HomeScreen Mount: Aguardando dados iniciais do contexto...");
        return; 
      }
      setIsLoadingTransactions(true);
      console.log("HomeScreen Mount: Carregando transações. Dados Iniciais Prontos:", {initialAccountBalance, initialCreditCardBill, totalInvested, creditCardLimit, userName});
      try {
        const loadedTransactions = await loadTransactions();
        setTransactions(loadedTransactions);
      } catch (error) {
        console.error("HomeScreen Mount: Falha ao carregar transações:", error);
        setTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
        console.log("HomeScreen Mount: Carregamento de transações finalizado.");
      }
    };
    loadInitialScreenData();
  }, [isLoadingInitialData]);

  useEffect(() => {
    if (isLoadingInitialData || isLoadingTransactions) {
      return;
    }
    console.log("EFFECT_RECALC: Recalculando. initialBalance:", initialAccountBalance, "initialBill:", initialCreditCardBill, "txCount:", transactions.length);

    let newCurrentBalance = initialAccountBalance;
    transactions.forEach(tr => {
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
    console.log("EFFECT_RECALC: currentBalance SET TO:", newCurrentBalance);

    let newCreditCardBill = initialCreditCardBill; 
    transactions.forEach(tr => {
      if (tr.type === 'expense' && tr.paymentMethod === 'cartao' && tr.category !== "Pagamento de Fatura CC") {
        newCreditCardBill += tr.amount;
      } else if (tr.category === "Pagamento de Fatura CC") {
        newCreditCardBill -= tr.amount;
      }
    });
    const finalNewBill = newCreditCardBill < 0 ? 0 : newCreditCardBill;
    setCurrentCreditCardBill(finalNewBill);
    if (!isLoadingInitialData && !isLoadingTransactions) {
      saveCreditCardBill(finalNewBill); 
    }
    console.log("EFFECT_RECALC: currentCreditCardBill SET TO:", finalNewBill);

  }, [transactions, initialAccountBalance, initialCreditCardBill, isLoadingInitialData, isLoadingTransactions]);


  useEffect(() => { 
    if (!isLoadingTransactions && !isLoadingInitialData) {
      saveTransactions(transactions); 
      console.log("EFFECT_SAVE_TX: Transações salvas.");
    }
  }, [transactions, isLoadingTransactions, isLoadingInitialData]);

  const handleAddIncome = (amount: number, description: string) => {
    console.log("ADD_INCOME: Adicionando:", description, amount);
    const newIncome: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description, amount, date: new Date().toISOString(), type: 'income', paymentMethod: 'saldo', notes: `Entrada: ${description}`
    };
    setTransactions(prev => [newIncome, ...prev]);
  };

  type AddExpenseModalData = Omit<Transaction, 'id' | 'date' | 'type' | 'paymentMethod'> & { categoryDetails?: ExpenseCategory, paymentMethodSelection: 'saldo' | 'cartao' };
  const handleAddExpense = async (data: AddExpenseModalData) => {
    console.log("ADD_EXPENSE: Adicionando:", data.description, data.amount, data.paymentMethodSelection);
    const newExpense: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      description: data.description,
      amount: data.amount,
      type: 'expense', 
      paymentMethod: data.paymentMethodSelection,
      category: data.categoryDetails?.name,
      notes: data.notes,
    };
    setTransactions(prev => [newExpense, ...prev]);
    setIsAddExpenseModalVisible(false); 
  };
  
  type AddTransactionData = Omit<Transaction, 'id' | 'date' | 'type'> & { categoryDetails?: ExpenseCategory; notes?: string };
  const handleAddTransaction = async (transactionData: AddTransactionData, isInvestmentFromFab: boolean = false) => {
    const isInvestmentCategory = transactionData.categoryDetails?.type === 'investment';
    const isCreditCardPayment = transactionData.categoryDetails?.type === 'cc_payment';
    let transactionType: Transaction['type'] = 'expense';
    if (isInvestmentFromFab || isInvestmentCategory) transactionType = 'investment';

    console.log("ADD_TRANSACTION (Invest/CCPayment): Tipo final:", transactionType, "Data:", transactionData);

    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      description: transactionData.description, amount: transactionData.amount, type: transactionType,
      paymentMethod: isCreditCardPayment ? 'saldo' : ( (isInvestmentFromFab || isInvestmentCategory) ? 'para_investimento' : transactionData.paymentMethod!),
      category: transactionData.categoryDetails?.name || (isInvestmentFromFab ? "Investimento (App)" : (isCreditCardPayment ? "Pagamento de Fatura CC" : transactionData.description)),
      notes: transactionData.notes,
    };
    
    setTransactions(prev => [newTransaction, ...prev]); 

    if (newTransaction.type === 'investment' && newTransaction.paymentMethod === 'para_investimento') {
      console.log("ADD_TRANSACTION (INVESTMENT): totalInvested ANTES da atualização:", totalInvested, "Valor a adicionar:", newTransaction.amount);
      const newTotalInvested = totalInvested + newTransaction.amount;
      await updateTotalInvestedOnly(newTotalInvested); 
      console.log("ADD_TRANSACTION (INVESTMENT): totalInvested DEPOIS da atualização (contexto):", newTotalInvested);
    } 
  };

  const handleDeleteTransaction = async (transactionId: string) => { const transactionToDelete = transactions.find(tr => tr.id === transactionId); if (!transactionToDelete) { Alert.alert("Erro", "Transação não encontrada."); return; } Alert.alert( "Confirmar Exclusão", `Excluir "${transactionToDelete.description}"?`, [ { text: "Cancelar", style: "cancel" }, { text: "Excluir", style: "destructive", onPress: async () => { setTransactions(prevTransactions => prevTransactions.filter(tr => tr.id !== transactionToDelete.id) ); if (transactionToDelete.type === 'investment' && transactionToDelete.paymentMethod === 'para_investimento') { const newTotalInvested = totalInvested - transactionToDelete.amount; await updateTotalInvestedOnly(newTotalInvested); } if (isTransactionDetailModalVisible) { setIsTransactionDetailModalVisible(false); setSelectedTransactionForDetail(null); } if (isEditModalVisible) { setIsEditModalVisible(false); setTransactionToEdit(null); } } } ], { cancelable: true } ); };
  const handleOpenTransactionDetailModal = (transaction: Transaction) => { setSelectedTransactionForDetail(transaction); setIsTransactionDetailModalVisible(true); };
  const handleOpenEditModal = (transaction: Transaction) => { setIsTransactionDetailModalVisible(false);  setTransactionToEdit(transaction); setIsEditModalVisible(true); };
  const handleSaveEditedTransaction = async (editedTransaction: Transaction) => { const originalTransaction = transactions.find(t => t.id === editedTransaction.id); if (!originalTransaction) { Alert.alert("Erro", "Transação original não encontrada."); setIsEditModalVisible(false); setTransactionToEdit(null); return; } let tempTotalInvested = totalInvested; if (originalTransaction.type === 'investment' && editedTransaction.type !== 'investment') { tempTotalInvested -= originalTransaction.amount; } else if (originalTransaction.type !== 'investment' && editedTransaction.type === 'investment') { tempTotalInvested += editedTransaction.amount; } else if (originalTransaction.type === 'investment' && editedTransaction.type === 'investment' && originalTransaction.paymentMethod === 'para_investimento' && editedTransaction.paymentMethod === 'para_investimento') { tempTotalInvested = tempTotalInvested - originalTransaction.amount + editedTransaction.amount; } if (totalInvested !== tempTotalInvested) { await updateTotalInvestedOnly(tempTotalInvested); } setTransactions(prev => prev.map(t => t.id === editedTransaction.id ? editedTransaction : t)); setIsEditModalVisible(false); setTransactionToEdit(null); Alert.alert("Sucesso", "Transação atualizada!"); };
  const handleOpenGastoModal = () => { setShowActionButtons(false); setIsAddExpenseModalVisible(true); };
  const handleOpenEntradaModal = () => { setShowActionButtons(false); setIsAddIncomeModalVisible(true); };
  const handleOpenInvestimentoModal = () => { setShowActionButtons(false); Alert.prompt( "Novo Investimento", "Valor do Investimento:", async (text) => { const valorStr = text; if (valorStr) { const valor = parseFloat(valorStr.replace(',', '.')) || 0; if (valor > 0) { await handleAddTransaction({ description: "Investimento (App)", amount: valor, paymentMethod: 'para_investimento' }, true); } else { Alert.alert("Erro", "Valor inválido para investimento.") } } }, 'plain-text', '', 'numeric' ); };
  const handleOpenCartaoDetailModal = () => { setIsCartaoDetailModalVisible(true); };
  const handlePagarFaturaPress = () => { setIsCartaoDetailModalVisible(false); setIsPagarFaturaModalVisible(true); };
  const handleConfirmPagamentoFatura = async (paymentAmount: number) => { if (paymentAmount <= 0) { Alert.alert("Valor Inválido", "O valor do pagamento deve ser positivo."); setIsPagarFaturaModalVisible(false); return; } const categoriaPagamentoFatura = commonExpenseSuggestions.find( cat => cat.type === 'cc_payment' ); if (!categoriaPagamentoFatura) { Alert.alert("Erro de Configuração", "Categoria 'Pagamento de Fatura CC' não encontrada."); setIsPagarFaturaModalVisible(false); return; } await handleAddTransaction({ description: categoriaPagamentoFatura.name, amount: paymentAmount, categoryDetails: categoriaPagamentoFatura, notes: "Pagamento da fatura do cartão", }); setIsPagarFaturaModalVisible(false); Alert.alert("Sucesso", "Pagamento da fatura registrado!"); };
  const handleOpenResgatarInvestimentoModal = () => { setShowActionButtons(false); setIsResgatarInvestimentoModalVisible(true); };
  const handleConfirmResgateInvestimento = async (amountToWithdraw: number) => { if (amountToWithdraw <= 0) { Alert.alert("Valor Inválido", "Resgate positivo."); return; } if (amountToWithdraw > totalInvested) { Alert.alert("Saldo Insuficiente", `Não pode resgatar ${formatCurrency(amountToWithdraw)} de ${formatCurrency(totalInvested)} investidos.`); return; } const newTotalInvested = totalInvested - amountToWithdraw; await updateTotalInvestedOnly(newTotalInvested);  handleAddIncome(amountToWithdraw, "Resgate de Investimento"); setIsResgatarInvestimentoModalVisible(false); Alert.alert("Sucesso", `Resgate de ${formatCurrency(amountToWithdraw)} realizado!`); };
  const handleOpenAdjustBalanceModal = () => { setShowActionButtons(false); setIsAdjustBalanceModalVisible(true); };
  const handleConfirmBalanceAdjustment = (newActualBalance: number) => { const adjustmentAmount = newActualBalance - currentBalance; console.log(`AJUSTE_SALDO: Saldo App: ${currentBalance}, Saldo Correto: ${newActualBalance}, Diferença: ${adjustmentAmount}`); if (adjustmentAmount === 0) { Alert.alert("Sem Mudanças", "O saldo informado é igual ao saldo atual no aplicativo."); setIsAdjustBalanceModalVisible(false); return; } const transactionType: Transaction['type'] = adjustmentAmount > 0 ? 'income' : 'expense'; const transactionAmount = Math.abs(adjustmentAmount); const description = adjustmentAmount > 0 ? "Ajuste de Saldo (Entrada)" : "Ajuste de Saldo (Saída)"; const adjustmentTransaction: Transaction = { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), description: description, amount: transactionAmount, type: transactionType, paymentMethod: 'saldo', category: 'Ajustes', notes: `Saldo anterior no app: ${formatCurrency(currentBalance)}. Saldo ajustado para: ${formatCurrency(newActualBalance)}.`, }; setTransactions(prev => [adjustmentTransaction, ...prev]); setIsAdjustBalanceModalVisible(false); Alert.alert("Sucesso", `Saldo ajustado para ${formatCurrency(newActualBalance)}.`); };


  const themedAppStyles = getThemedStyles(colors, isDark);
  const listHeader = (
    <>
      {/* CORREÇÃO APLICADA AQUI: Usar Boolean(userName) ou ternário */}
      {Boolean(userName) && !isLoadingInitialData && !isLoadingTransactions ? (
        <View style={[themedAppStyles.cardBase, themedAppStyles.welcomeCard, { marginTop: 15 }]}>
          <Text style={themedAppStyles.welcomeText}>Olá, {userName}! 👋</Text>
        </View>
      ) : null}
      <BalanceDisplay 
        currentBalance={currentBalance} 
        creditCardBill={currentCreditCardBill} 
        totalInvested={totalInvested} 
        creditCardLimit={creditCardLimit} 
        initialAccountBalance={initialAccountBalance}
        onOpenCartaoDetail={handleOpenCartaoDetailModal}
        onOpenResgatarInvestimentoModal={handleOpenResgatarInvestimentoModal}
      />
      
      <Text style={themedAppStyles.transactionHistoryTitle}>Histórico de Transações</Text>
    </>
  );

  if (isLoadingInitialData || isLoadingTransactions) {
    return ( <View style={[themedAppStyles.loadingContainer, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[themedAppStyles.loadingText, { color: colors.text }]}>Carregando dados...</Text></View> );
  }

  return (
    <SafeAreaView style={[themedAppStyles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? IOS_HEADER_OFFSET : 0} >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
        <ExpenseList transactions={transactions} onOpenDetailModal={handleOpenTransactionDetailModal} headerContent={listHeader} />
      </KeyboardAvoidingView>
      
      {/* RENDERIZAÇÃO CONDICIONAL DOS BOTÕES FAB - Usando ternário */}
      {showActionButtons ? ( 
        <View style={themedAppStyles.fabActionsContainer}> 
          <TouchableOpacity style={themedAppStyles.fabActionItem} onPress={handleOpenGastoModal}><Text style={[themedAppStyles.fabActionText, {color: colors.text}]}>Gasto</Text><View style={[themedAppStyles.fabActionButton, { backgroundColor: colors.danger }]}><FontAwesome name="shopping-cart" size={20} color="#FFF" /></View></TouchableOpacity>
          <TouchableOpacity style={themedAppStyles.fabActionItem} onPress={handleOpenEntradaModal}><Text style={[themedAppStyles.fabActionText, {color: colors.text}]}>Entrada</Text><View style={[themedAppStyles.fabActionButton, { backgroundColor: colors.success }]}><FontAwesome name="plus" size={20} color="#FFF" /></View></TouchableOpacity>
          <TouchableOpacity style={themedAppStyles.fabActionItem} onPress={handleOpenInvestimentoModal}><Text style={[themedAppStyles.fabActionText, {color: colors.text}]}>Investimento</Text><View style={[themedAppStyles.fabActionButton, { backgroundColor: colors.invested }]}><FontAwesome name="line-chart" size={20} color="#FFF" /></View></TouchableOpacity>
        </View> 
      ) : null}
      <TouchableOpacity style={[themedAppStyles.fabMain, { backgroundColor: colors.primary }]} onPress={() => setShowActionButtons(!showActionButtons)} activeOpacity={0.8} > 
        <FontAwesome name={showActionButtons ? "times" : "plus"} size={24} color="#FFF" /> 
      </TouchableOpacity>


      <AddIncomeModal visible={isAddIncomeModalVisible} onClose={() => setIsAddIncomeModalVisible(false)} onAddIncome={handleAddIncome} />
      <AddExpenseModal visible={isAddExpenseModalVisible} onClose={() => setIsAddExpenseModalVisible(false)} onAddExpense={handleAddExpense} />
      
      {/* RENDERIZAÇÃO CONDICIONAL DOS MODAIS DE DETALHE E EDIÇÃO - Usando ternário */}
      {selectedTransactionForDetail ? ( 
        <TransactionDetailModal 
            visible={isTransactionDetailModalVisible} 
            transaction={selectedTransactionForDetail} 
            onClose={() => { setIsTransactionDetailModalVisible(false); setSelectedTransactionForDetail(null); }} 
            onDelete={handleDeleteTransaction} 
            onEdit={handleOpenEditModal} 
        /> 
      ) : null}
      {transactionToEdit ? ( 
        <EditTransactionModal 
            visible={isEditModalVisible} 
            transactionToEdit={transactionToEdit} 
            onClose={() => { setIsEditModalVisible(false); setTransactionToEdit(null); }} 
            onSaveEdit={handleSaveEditedTransaction} 
        /> 
      ) : null}

      <CartaoDetailModal visible={isCartaoDetailModalVisible} onClose={() => setIsCartaoDetailModalVisible(false)} onPagarFaturaPress={handlePagarFaturaPress} creditCardLimit={creditCardLimit} currentCreditCardBill={currentCreditCardBill} />
      <PagarFaturaModal visible={isPagarFaturaModalVisible} onClose={() => setIsPagarFaturaModalVisible(false)} onConfirmPagamento={handleConfirmPagamentoFatura} currentBill={currentCreditCardBill} />
      <ResgatarInvestimentoModal visible={isResgatarInvestimentoModalVisible} onClose={() => setIsResgatarInvestimentoModalVisible(false)} onConfirmResgate={handleConfirmResgateInvestimento} currentTotalInvested={totalInvested} />
      <AdjustBalanceModal visible={isAdjustBalanceModalVisible} onClose={() => setIsAdjustBalanceModalVisible(false)} onConfirmAdjustment={handleConfirmBalanceAdjustment} currentAppBalance={currentBalance} />
    </SafeAreaView>
  );
}

// Estilos (getThemedStyles e getModalStyles)
const getThemedStyles = (colors: ThemeColors, isDark?: boolean) => StyleSheet.create({
  safeArea: { flex: 1, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 10, fontSize: 16, color: colors.text },
  transactionHistoryTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center', color: colors.text, paddingHorizontal: 15, },
  cardBase: { backgroundColor: colors.card, borderRadius: 12, padding: 18, marginBottom: 15, marginHorizontal: 10, shadowColor: isDark ? '#000' : '#555', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.30 : 0.15, shadowRadius: isDark ? 3.5 : 2.5, elevation: isDark ? 5 : 3, },
  welcomeCard: { paddingVertical: 20, alignItems: 'center', },
  welcomeText: { fontSize: 20, fontWeight: '600', color: colors.text, },
  headerControlsContainer: { minHeight: 1, borderBottomWidth: 0, marginBottom: 0, paddingVertical:0, paddingHorizontal:0 },
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