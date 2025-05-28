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
} from '../services/storage'; // Certifique-se que o caminho para storage.ts está correto

interface InitialData {
  initialAccountBalance: number;
  totalInvested: number;
  creditCardLimit: number;
  creditCardBill: number; // Representa a fatura que foi definida no setup inicial
}

export interface InitialDataContextType extends InitialData { // Exportado para uso em home.tsx se necessário para type casting
  isLoadingData: boolean;
  handleSaveInitialSetup: (data: { balance: number; invested: number; limit: number; initialBill: number }) => Promise<void>;
  // Esta função foi adicionada para atualizar o total investido de forma isolada
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
      console.log("InitialDataContext: Carregando dados iniciais do AsyncStorage...");
      try {
        const [loadedBalance, loadedInvested, loadedLimit, loadedBill] = await Promise.all([
          loadInitialAccountBalance(),
          loadTotalInvested(),
          loadCreditCardLimit(),
          loadCreditCardBill()
        ]);
        
        console.log("InitialDataContext: Dados carregados:", { loadedBalance, loadedInvested, loadedLimit, loadedBill });
        setInitialAccountBalance(loadedBalance);
        setTotalInvested(loadedInvested);
        setCreditCardLimit(loadedLimit);
        setCreditCardBill(loadedBill);
      } catch (error) {
        console.error("InitialDataContext: Falha ao carregar dados financeiros:", error);
        setInitialAccountBalance(0);
        setTotalInvested(0);
        setCreditCardLimit(0);
        setCreditCardBill(0);
      } finally {
        setIsLoadingData(false);
        console.log("InitialDataContext: Carregamento de dados finalizado.");
      }
    };
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
      console.log("InitialDataContext: Dados do setup inicial salvos com sucesso.");
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar dados do setup inicial:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateTotalInvestedOnly = async (newTotalInvested: number) => {
    console.log("InitialDataContext: Atualizando totalInvested para:", newTotalInvested);
    setTotalInvested(newTotalInvested); // Atualiza o estado
    try {
      await saveTotalInvested(newTotalInvested); // Salva no AsyncStorage
      console.log("InitialDataContext: totalInvested salvo com sucesso.");
    } catch (error) {
      console.error("InitialDataContext: Falha ao salvar totalInvested:", error);
    }
  };

  return (
    <InitialDataContext.Provider value={{
      initialAccountBalance,
      totalInvested,
      creditCardLimit,
      creditCardBill,
      isLoadingData,
      handleSaveInitialSetup,
      updateTotalInvestedOnly // Expondo a nova função
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