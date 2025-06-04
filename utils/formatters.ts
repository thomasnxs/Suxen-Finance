// GastosApp/utils/formatters.ts
export const formatCurrency = (value: number | undefined | null): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('[formatCurrency] Recebeu valor inválido:', value, typeof value);
    return 'R$ --,--'; // String segura para valores inválidos
  }
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

// No futuro, você pode adicionar outras funções de formatação aqui.
// export const formatDate = (date: Date): string => { ... };