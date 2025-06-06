// GastosApp/contexts/InitialDataContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
  loadCreditCardBill,
  loadCreditCardLimit,
  loadInitialAccountBalance,
  loadTotalInvested,
  saveCreditCardBill,
  saveCreditCardLimit,
  saveInitialAccountBalance,
  saveTotalInvested
} from '../services/storage'; // Ajuste o caminho se 'services' estiver em outro lugar

const USER_NAME_KEY = '@SuxenFinance:userName';

export interface InitialData {
  initialAccountBalance: number;
  totalInvested: number;
  creditCardLimit: number;
  creditCardBill: number; 
  userName: string; 
}

export interface InitialDataContextType extends InitialData {
  isLoadingData: boolean;
  handleSaveInitialSetup: (data: { balance: number; invested: number; limit: number; initialBill: number }) => Promise<void>;
  updateTotalInvestedOnly: (newTotalInvested: number) => Promise<void>; 
  forceReloadAllInitialData: () => Promise<void>;
  setUserNameInContext: (name: string) => Promise<void>; // NOVA FUNÇÃO NA INTERFACE
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
    setIsLoadingData(true);
    console.log("InitialDataContext: Iniciando loadDataFromStorage...");
    try {
      const storedUserName = await AsyncStorage.getItem(USER_NAME_KEY);
      setUserName(storedUserName || ''); 
      console.log("InitialDataContext: userName carregado:", storedUserName || '');
      
      const [loadedBalance, loadedInvested, loadedLimit, loadedBill] = await Promise.all([
        loadInitialAccountBalance(),
        loadTotalInvested(),
        loadCreditCardLimit(),
        loadCreditCardBill()
      ]);
      
      console.log("InitialDataContext: Dados financeiros carregados:", { loadedBalance, loadedInvested, loadedLimit, loadedBill });
      setInitialAccountBalance(loadedBalance);
      setTotalInvested(loadedInvested);
      setCreditCardLimit(loadedLimit);
      setCreditCardBill(loadedBill);
    } catch (error) {
      console.error("InitialDataContext: Falha ao carregar dados:", error);
      setUserName(''); 
      setInitialAccountBalance(0); setTotalInvested(0);
      setCreditCardLimit(0); setCreditCardBill(0);
    } finally {
      setIsLoadingData(false);
      console.log("InitialDataContext: Carregamento de dados finalizado.");
    }
  };

  useEffect(() => {
    loadDataFromStorage(); 
  }, []); 

  const handleSaveInitialSetup = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    console.log("InitialDataContext: Salvando dados do setup inicial:", data);
    setIsLoadingData(true); 
    setInitialAccountBalance(data.balance);
    setTotalInvested(data.invested);
    setCreditCardLimit(data.limit);
    setCreditCardBill(data.initialBill);
    try {
      await Promise.all([
        saveInitialAccountBalance(data.balance),
        saveTotalInvested(data.invested),
        saveCreditCardLimit(data.limit),
        saveCreditCardBill(data.initialBill)
      ]);
      console.log("InitialDataContext: Dados do setup inicial financeiros salvos com sucesso.");
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar dados do setup inicial financeiros:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateTotalInvestedOnly = async (newTotalInvested: number) => {
    console.log("InitialDataContext: Atualizando totalInvested para:", newTotalInvested);
    setTotalInvested(newTotalInvested); 
    try {
      await saveTotalInvested(newTotalInvested); 
      console.log("InitialDataContext: totalInvested salvo com sucesso.");
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar totalInvested:", error);
    }
  };

  const forceReloadAllInitialData = async () => {
    console.log("InitialDataContext: Forçando recarregamento de todos os dados iniciais...");
    await loadDataFromStorage(); 
  };

  // NOVA FUNÇÃO PARA ATUALIZAR E SALVAR O NOME
  const setUserNameInContext = async (name: string) => {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name);
      setUserName(name); // Atualiza o estado do contexto
      console.log("InitialDataContext: userName atualizado e salvo:", name);
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar userName:", error);
    }
  };

  return (
    <InitialDataContext.Provider value={{
      initialAccountBalance,
      totalInvested,
      creditCardLimit,
      creditCardBill,
      userName, 
      isLoadingData,
      handleSaveInitialSetup,
      updateTotalInvestedOnly,
      forceReloadAllInitialData,
      setUserNameInContext // EXPONDO A NOVA FUNÇÃO
    }}>
      {children}
    </InitialDataContext.Provider>
  );
};

export const useInitialData = (): InitialDataContextType => {
  const context = useContext(InitialDataContext);
  if (context === undefined) {
    throw new Error('useInitialData deve ser usado dentro de um InitialDataProvider');
  }
  return context;
};