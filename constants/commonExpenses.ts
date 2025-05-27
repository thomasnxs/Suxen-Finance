// GastosApp/constants/commonExpenses.ts

export interface ExpenseCategory {
  key: string; // Um identificador único se necessário, ou usar o nome
  name: string;
  emoji: string;
  type?: 'investment'; // Para identificar categorias especiais
}

export const commonExpenseSuggestions: ExpenseCategory[] = [
  { key: 'supermercado', name: "Alimentação (Supermercado)", emoji: "🛒" },
  { key: 'restaurante', name: "Alimentação (Restaurante/Lanche)", emoji: "🍔" },
  { key: 'combustivel', name: "Transporte (Combustível)", emoji: "⛽" },
  { key: 'transporte_publico', name: "Transporte (Público/App)", emoji: "🚌" },
  { key: 'contas', name: "Contas (Água, Luz, Gás)", emoji: "💡" },
  { key: 'internet', name: "Internet/Telefone", emoji: "💻" },
  { key: 'farmacia', name: "Saúde (Farmácia)", emoji: "💊" },
  { key: 'consulta_medica', name: "Saúde (Consulta)", emoji: "🩺" },
  { key: 'lazer', name: "Lazer (Cinema, Show)", emoji: "🎉" },
  { key: 'educacao', name: "Educação (Curso, Livro)", emoji: "📚" },
  { key: 'vestuario', name: "Vestuário", emoji: "👕" },
  { key: 'aluguel_prestacao', name: "Casa (Aluguel/Prestação)", emoji: "🏠" },
  { key: 'manutencao_casa', name: "Casa (Manutenção)", emoji: "🛠️" },
  { key: 'investimento', name: "Investimento (Aporte)", emoji: "📈", type: 'investment' }, // Nova categoria
];