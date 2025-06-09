// GastosApp/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

// CHAVES PADRONIZADAS
const TRANSACTIONS_KEY = '@GasteiApp:transactions';
const INITIAL_SETUP_KEY = '@GasteiApp:initialSetup';
const INITIAL_ACCOUNT_BALANCE_KEY = '@GasteiApp:initialAccountBalance';
const TOTAL_INVESTED_KEY = '@GasteiApp:totalInvested';
const CREDIT_CARD_LIMIT_KEY = '@GasteiApp:creditCardLimit';
const INITIAL_CREDIT_CARD_BILL_KEY = '@GasteiApp:creditCardBill'; // Mantido para consistência
const CURRENT_CREDIT_CARD_BILL_KEY = '@GasteiApp:currentCreditCardBill'; // Chave para fatura atual

// Função para salvar as transações
export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, jsonValue);
  } catch (e) {
    console.error("Erro ao salvar transações no AsyncStorage", e);
  }
};

// Função para carregar as transações
export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch(e) {
    console.error("Erro ao carregar transações do AsyncStorage", e);
    return [];
  }
};

// Salva apenas o valor do saldo inicial
export const saveInitialAccountBalance = async (balance: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(INITIAL_ACCOUNT_BALANCE_KEY, JSON.stringify(balance));
  } catch (e) {
    console.error("Erro ao salvar saldo inicial", e);
  }
};

// Salva apenas o valor do total investido
export const saveTotalInvested = async (invested: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOTAL_INVESTED_KEY, JSON.stringify(invested));
    } catch (e) {
        console.error("Erro ao salvar total investido", e);
    }
};

// Salva apenas o valor do limite do cartão
export const saveCreditCardLimit = async (limit: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(CREDIT_CARD_LIMIT_KEY, JSON.stringify(limit));
    } catch (e) {
        console.error("Erro ao salvar limite do cartão", e);
    }
};

// Salva apenas o valor da fatura inicial do cartão
export const saveInitialCreditCardBill = async (bill: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(INITIAL_CREDIT_CARD_BILL_KEY, JSON.stringify(bill));
    } catch (e) {
        console.error("Erro ao salvar fatura inicial do cartão", e);
    }
};

// Salva o valor calculado da fatura atual
export const saveCreditCardBill = async (bill: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(CURRENT_CREDIT_CARD_BILL_KEY, JSON.stringify(bill));
    } catch (e) {
        console.error("Erro ao salvar fatura atual do cartão", e);
    }
};