// GastosApp/contexts/InitialDataContext.tsx
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
} from '../services/storage';

export interface InitialData { // Exportando para possível uso externo se necessário
  initialAccountBalance: number;
  totalInvested: number;
  creditCardLimit: number;
  creditCardBill: number; 
}

export interface InitialDataContextType extends InitialData {
  isLoadingData: boolean;
  handleSaveInitialSetup: (data: { balance: number; invested: number; limit: number; initialBill: number }) => Promise<void>;
  updateTotalInvestedOnly: (newTotalInvested: number) => Promise<void>; 
}

const InitialDataContext = createContext<InitialDataContextType | undefined>(undefined);

export const InitialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialAccountBalance, setInitialAccountBalance] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [creditCardLimit, setCreditCardLimit] = useState<number>(0);
  const [creditCardBill, setCreditCardBill] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const loadDataFromStorage = async () => {
      setIsLoadingData(true);
      console.log("InitialDataContext: Carregando dados iniciais...");
      try {
        const [loadedBalance, loadedInvested, loadedLimit, loadedBill] = await Promise.all([
          loadInitialAccountBalance(), loadTotalInvested(),
          loadCreditCardLimit(), loadCreditCardBill()
        ]);
        setInitialAccountBalance(loadedBalance);
        setTotalInvested(loadedInvested);
        setCreditCardLimit(loadedLimit);
        setCreditCardBill(loadedBill);
        console.log("InitialDataContext: Dados carregados com sucesso.");
      } catch (error) {
        console.error("InitialDataContext: Falha ao carregar dados:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadDataFromStorage();
  }, []);

  const handleSaveInitialSetup = async (data: { balance: number; invested: number; limit: number; initialBill: number }) => {
    setIsLoadingData(true); 
    setInitialAccountBalance(data.balance);
    setTotalInvested(data.invested);
    setCreditCardLimit(data.limit);
    setCreditCardBill(data.initialBill);
    try {
      await Promise.all([
        saveInitialAccountBalance(data.balance), saveTotalInvested(data.invested),
        saveCreditCardLimit(data.limit), saveCreditCardBill(data.initialBill)
      ]);
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar setup inicial:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateTotalInvestedOnly = async (newTotalInvested: number) => {
    setTotalInvested(newTotalInvested);
    try {
      await saveTotalInvested(newTotalInvested);
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar totalInvested:", error);
    }
  };

  return (
    <InitialDataContext.Provider value={{
      initialAccountBalance, totalInvested, creditCardLimit, creditCardBill,
      isLoadingData, handleSaveInitialSetup, updateTotalInvestedOnly
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