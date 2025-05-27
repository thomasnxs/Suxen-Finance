// GastosApp/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

const INITIAL_BALANCE_KEY = '@GastosApp:initialAccountBalance';
const TRANSACTIONS_KEY = '@GastosApp:transactions';
const CREDIT_CARD_BILL_KEY = '@GastosApp:creditCardBill';
const TOTAL_INVESTED_KEY = '@GastosApp:totalInvested';
const CREDIT_CARD_LIMIT_KEY = '@GastosApp:creditCardLimit'; // NOVA CHAVE

// Salvar e Carregar Saldo Inicial
export const saveInitialAccountBalance = async (balance: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(INITIAL_BALANCE_KEY, JSON.stringify(balance));
  } catch (e) {
    console.error("Erro ao salvar saldo inicial:", e);
  }
};

export const loadInitialAccountBalance = async (): Promise<number> => {
  try {
    const balanceString = await AsyncStorage.getItem(INITIAL_BALANCE_KEY);
    return balanceString != null ? JSON.parse(balanceString) : 0;
  } catch (e) {
    console.error("Erro ao carregar saldo inicial:", e);
    return 0;
  }
};

// Salvar e Carregar Transações
export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error("Erro ao salvar transações:", e);
  }
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactionsString = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return transactionsString != null ? JSON.parse(transactionsString) : [];
  } catch (e) {
    console.error("Erro ao carregar transações:", e);
    return [];
  }
};

// Salvar e Carregar Fatura do Cartão
export const saveCreditCardBill = async (bill: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(CREDIT_CARD_BILL_KEY, JSON.stringify(bill));
  } catch (e) {
    console.error("Erro ao salvar fatura do cartão:", e);
  }
};

export const loadCreditCardBill = async (): Promise<number> => {
  try {
    const billString = await AsyncStorage.getItem(CREDIT_CARD_BILL_KEY);
    return billString != null ? JSON.parse(billString) : 0;
  } catch (e)
{
    console.error("Erro ao carregar fatura do cartão:", e);
    return 0;
  }
};

// Salvar e Carregar Total Investido
export const saveTotalInvested = async (total: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOTAL_INVESTED_KEY, JSON.stringify(total));
  } catch (e) {
    console.error("Erro ao salvar total investido:", e);
  }
};

export const loadTotalInvested = async (): Promise<number> => {
  try {
    const totalString = await AsyncStorage.getItem(TOTAL_INVESTED_KEY);
    return totalString != null ? JSON.parse(totalString) : 0;
  } catch (e) {
    console.error("Erro ao carregar total investido:", e);
    return 0;
  }
};

// NOVAS FUNÇÕES para Limite do Cartão de Crédito
export const saveCreditCardLimit = async (limit: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(CREDIT_CARD_LIMIT_KEY, JSON.stringify(limit));
  } catch (e) {
    console.error("Erro ao salvar limite do cartão:", e);
  }
};

export const loadCreditCardLimit = async (): Promise<number> => {
  try {
    const limitString = await AsyncStorage.getItem(CREDIT_CARD_LIMIT_KEY);
    return limitString != null ? JSON.parse(limitString) : 0;
  } catch (e) {
    console.error("Erro ao carregar limite do cartão:", e);
    return 0;
  }
};