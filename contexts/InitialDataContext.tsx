// GastosApp/contexts/InitialDataContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  saveCreditCardLimit,
  saveInitialAccountBalance,
  saveInitialCreditCardBill,
  saveTotalInvested
} from '../services/storage';

const USER_NAME_KEY = '@GasteiApp:userName'; // <-- CHAVE PADRONIZADA AQUI
const INITIAL_ACCOUNT_BALANCE_KEY = '@GasteiApp:initialAccountBalance';
const TOTAL_INVESTED_KEY = '@GasteiApp:totalInvested';
const CREDIT_CARD_LIMIT_KEY = '@GasteiApp:creditCardLimit';
const INITIAL_CREDIT_CARD_BILL_KEY = '@GasteiApp:initialCreditCardBill';

export interface InitialDataContextType {
  initialAccountBalance: number;
  totalInvested: number;
  creditCardLimit: number;
  creditCardBill: number;
  userName: string;
  isLoadingData: boolean;
  setUserNameInContext: (name: string) => void;
  updateTotalInvestedOnly: (newTotal: number) => Promise<void>;
  handleSaveInitialSetup: (data: { balance: number, invested: number, limit: number, initialBill: number }) => Promise<void>;
  forceReloadAllInitialData: () => Promise<void>;
}

const InitialDataContext = createContext<InitialDataContextType | undefined>(undefined);

export const InitialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialAccountBalance, setInitialAccountBalance] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [creditCardLimit, setCreditCardLimit] = useState<number>(0);
  const [creditCardBill, setCreditCardBill] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const loadDataFromStorage = async () => {
    console.log("InitialDataContext: Iniciando loadDataFromStorage...");
    setIsLoadingData(true);
    try {
      const storedUserName = await AsyncStorage.getItem(USER_NAME_KEY); // Usa a nova constante
      setUserName(storedUserName || '');
      console.log(`InitialDataContext: userName carregado: ${storedUserName || 'nenhum'}`);
      
      const storedData = await AsyncStorage.multiGet([
        INITIAL_ACCOUNT_BALANCE_KEY,
        TOTAL_INVESTED_KEY,
        CREDIT_CARD_LIMIT_KEY,
        INITIAL_CREDIT_CARD_BILL_KEY,
      ]);

      const balance = storedData[0][1] ? JSON.parse(storedData[0][1]) : 0;
      const invested = storedData[1][1] ? JSON.parse(storedData[1][1]) : 0;
      const limit = storedData[2][1] ? JSON.parse(storedData[2][1]) : 0;
      const bill = storedData[3][1] ? JSON.parse(storedData[3][1]) : 0;
      
      setInitialAccountBalance(balance);
      setTotalInvested(invested);
      setCreditCardLimit(limit);
      setCreditCardBill(bill);

      console.log("InitialDataContext: Dados financeiros carregados:", { loadedBalance: balance, loadedInvested: invested, loadedLimit: limit, loadedBill: bill });
      
    } catch (error) {
      console.error('InitialDataContext: Falha ao carregar dados do AsyncStorage', error);
    } finally {
      setIsLoadingData(false);
      console.log("InitialDataContext: Carregamento de dados finalizado.");
    }
  };

  useEffect(() => {
    loadDataFromStorage();
  }, []);
  
  const setUserNameInContext = async (name: string) => {
    setUserName(name);
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name); // Usa a nova constante
      console.log(`InitialDataContext: userName '${name}' salvo com sucesso.`);
    } catch (error) {
      console.error("InitialDataContext: Erro ao salvar userName", error);
    }
  };

  const updateTotalInvestedOnly = async (newTotal: number) => {
    console.log("InitialDataContext: Atualizando totalInvested para:", newTotal);
    setTotalInvested(newTotal);
    await saveTotalInvested(newTotal);
    console.log("InitialDataContext: totalInvested salvo com sucesso.");
  };

  const handleSaveInitialSetup = async (data: { balance: number, invested: number, limit: number, initialBill: number }) => {
    console.log("InitialDataContext: Salvando setup inicial:", data);
    setInitialAccountBalance(data.balance);
    setTotalInvested(data.invested);
    setCreditCardLimit(data.limit);
    setCreditCardBill(data.initialBill);

    await saveInitialAccountBalance(data.balance);
    await saveTotalInvested(data.invested);
    await saveCreditCardLimit(data.limit);
    await saveInitialCreditCardBill(data.initialBill);
    console.log("InitialDataContext: Setup inicial salvo no AsyncStorage.");
  };

  const forceReloadAllInitialData = async () => {
    console.log("InitialDataContext: Forçando recarregamento de todos os dados...");
    await loadDataFromStorage();
  };

  const value = {
    initialAccountBalance,
    totalInvested,
    creditCardLimit,
    creditCardBill,
    userName,
    isLoadingData,
    setUserNameInContext,
    updateTotalInvestedOnly,
    handleSaveInitialSetup,
    forceReloadAllInitialData
  };

  return (
    <InitialDataContext.Provider value={value}>
      {children}
    </InitialDataContext.Provider>
  );
};

export const useInitialData = (): InitialDataContextType | undefined => {
  return useContext(InitialDataContext);
};