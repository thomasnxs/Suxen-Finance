// GastosApp/types.ts
export type TransactionType = 'expense' | 'income' | 'investment';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string date
  type: TransactionType;
  paymentMethod?: 'saldo' | 'cartao' | 'para_investimento';
  category?: string;
  notes?: string;
}

// A interface ExpenseCategory é definida em constants/commonExpenses.ts
// e importada onde necessário. Não precisa estar duplicada aqui.
// export interface ExpenseCategory {
//   key: string;
//   name: string;
//   emoji: string;
//   type?: 'investment';
// }