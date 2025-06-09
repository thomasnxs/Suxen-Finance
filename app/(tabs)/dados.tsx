// GastosApp/app/(tabs)/dados.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Button,
  Dimensions,
  FlatList, Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { ThemeColors } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { loadTransactions } from '../../services/storage';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

// --- Função getTransactionsForPeriod ---
const getTransactionsForPeriod = (
  transactions: Transaction[],
  period: 'all' | 'day' | 'week' | 'month'
): Transaction[] => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  switch (period) {
    case 'all': return transactions;
    case 'day': return transactions.filter(t => { const d = new Date(t.date); return d >= startOfToday && d <= endOfToday; });
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return transactions.filter(t => { const d = new Date(t.date); return d >= startOfMonth && d <= endOfMonth; });
    case 'week':
      const startOfLast7Days = new Date(now);
      startOfLast7Days.setDate(now.getDate() - 6);
      startOfLast7Days.setHours(0, 0, 0, 0);
      return transactions.filter(t => { const d = new Date(t.date); return d >= startOfLast7Days && d <= endOfToday; });
    default: return transactions;
  }
};

// --- Função aggregateExpensesForChart ---
const aggregateExpensesForChart = (transactions: Transaction[], year: number, month: number): Array<{ name: string; amount: number }> => {
  const monthlyExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return t.type === 'expense' &&
           transactionDate.getFullYear() === year &&
           transactionDate.getMonth() === month;
  });
  const expensesByCategory = monthlyExpenses.reduce((acc, transaction) => {
    const category = transaction.category || 'Outros';
    acc[category] = (acc[category] || 0) + transaction.amount;
    return acc;
  }, {} as { [key: string]: number });
   return Object.entries(expensesByCategory).map(([categoryName, totalAmount]) => ({
    name: categoryName,
    amount: totalAmount,
   })).sort((a, b) => b.amount - a.amount);
};

const PIE_CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#E7E9ED', '#F7464A', '#5AD3D1', '#FDB45C', '#A8B3C5', '#616774',
];

const screenWidth = Dimensions.get('window').width;

export default function DadosScreen() {
  const { colors, isDark } = useTheme();
  const styles = getThemedStyles(colors);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChartData, setIsLoadingChartData] = useState(true); 

  const [chartDisplayDate, setChartDisplayDate] = useState(new Date());
  const [aggregatedChartData, setAggregatedChartData] = useState<Array<{name: string, amount: number}>>([]);

  const fetchData = useCallback(async () => {
    try {
      const loadedTxs = await loadTransactions();
      setAllTransactions(loadedTxs);
    } catch (error) {
      console.error("[DadosScreen] Erro ao carregar transações:", error);
      setAllTransactions([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setIsLoadingChartData(true);
      fetchData().finally(() => setIsLoading(false));
    }, [fetchData])
  );

  useEffect(() => {
    if (!isLoading) {
      setFilteredTransactions(getTransactionsForPeriod(allTransactions, selectedPeriod));
    }
  }, [selectedPeriod, allTransactions, isLoading]);

  useEffect(() => {
    if (!isLoading && allTransactions.length >= 0) {
      setIsLoadingChartData(true);
      const year = chartDisplayDate.getFullYear();
      const month = chartDisplayDate.getMonth();
      const aggData = aggregateExpensesForChart(allTransactions, year, month);
      setAggregatedChartData(aggData);
      setIsLoadingChartData(false);
    } else if (!isLoading) {
        setAggregatedChartData([]);
        setIsLoadingChartData(false);
    }
  }, [chartDisplayDate, allTransactions, isLoading]);

  const summaryData = useMemo(() => {
    const initialSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      totalSpentOnCard: 0,
      totalSpentFromBalance: 0,
      expensesByCategory: {} as { [key: string]: number },
    };
    return filteredTransactions.reduce((acc, transaction) => {
        if (transaction.type === 'expense') {
            acc.totalExpenses += transaction.amount;
            if (transaction.paymentMethod === 'cartao') {
                acc.totalSpentOnCard += transaction.amount;
            } else if (transaction.paymentMethod === 'saldo') {
                acc.totalSpentFromBalance += transaction.amount;
            }
            const category = transaction.category || 'Outros';
            acc.expensesByCategory[category] = (acc.expensesByCategory[category] || 0) + transaction.amount;
        } else if (transaction.type === 'income') {
            acc.totalIncome += transaction.amount;
        } else if (transaction.type === 'investment') {
            acc.totalInvestments += transaction.amount;
        }
        return acc;
    }, initialSummary);
  }, [filteredTransactions]);

  const chartKitData = useMemo(() => {
    return aggregatedChartData
      .filter(slice => slice.amount > 0)
      .map((slice, index) => ({
        name: slice.name.split(' ')[0],
        amount: slice.amount,
        color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        legendFontColor: colors.text,
        legendFontSize: 13,
      }));
  }, [aggregatedChartData, colors.text]);

  const handleChangeChartMonth = (increment: number) => {
    setChartDisplayDate(prevDate => {
      return new Date(prevDate.getFullYear(), prevDate.getMonth() + increment, 1);
    });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={{flex: 1}}>
        <Text style={styles.itemDescription} numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'})} - {item.category || item.type}</Text>
      </View>
      <Text style={[ styles.itemAmount, item.type === 'income' ? styles.incomeAmount : (item.type === 'expense' ? styles.expenseAmount : styles.investmentAmount) ]}>
        {item.type === 'income' ? '+' : (item.type === 'expense' ? '-' : '')} {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  if (isLoading && allTransactions.length === 0 && selectedPeriod === 'all') {
     return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Dados e Relatórios' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
  };

  const PeriodSelectorButtons = () => (
    <View style={styles.periodSelector}>
      <View style={styles.buttonWrapper}><Button title="Todas" onPress={() => setSelectedPeriod('all')} disabled={selectedPeriod === 'all' || isLoading} color={Platform.OS === 'ios' ? colors.primary : undefined} /></View>
      <View style={styles.buttonWrapper}><Button title="Dia" onPress={() => setSelectedPeriod('day')} disabled={selectedPeriod === 'day' || isLoading} color={Platform.OS === 'ios' ? colors.primary : undefined} /></View>
      <View style={styles.buttonWrapper}><Button title="Semana" onPress={() => setSelectedPeriod('week')} disabled={selectedPeriod === 'week' || isLoading} color={Platform.OS === 'ios' ? colors.primary : undefined} /></View>
      <View style={styles.buttonWrapper}><Button title="Mês" onPress={() => setSelectedPeriod('month')} disabled={selectedPeriod === 'month' || isLoading} color={Platform.OS === 'ios' ? colors.primary : undefined} /></View>
    </View>
  );

  return (
    <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollContentContainer}>
      <Stack.Screen options={{ title: 'Dados e Relatórios' }} />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Resumo do Período</Text>
        <PeriodSelectorButtons />
        <View>
          <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entradas:</Text>
              <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                  {formatCurrency(summaryData.totalIncome)}
              </Text>
          </View>
          <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gastos Totais:</Text>
              <Text style={[styles.summaryAmount, styles.expenseAmount]}>
                  {formatCurrency(summaryData.totalExpenses)}
              </Text>
          </View>
          {summaryData.totalSpentFromBalance > 0 && (
            <View style={styles.summaryDetailRow}>
                <Text style={styles.summaryDetailLabel}>↪ Gastos do Saldo:</Text>
                <Text style={[styles.summaryDetailAmount, styles.expenseAmount]}>
                    {formatCurrency(summaryData.totalSpentFromBalance)}
                </Text>
            </View>
          )}
          {summaryData.totalSpentOnCard > 0 && (
            <View style={styles.summaryDetailRow}>
                <Text style={styles.summaryDetailLabel}>↪ Gastos no Cartão:</Text>
                <Text style={[styles.summaryDetailAmount, styles.expenseAmount]}>
                    {formatCurrency(summaryData.totalSpentOnCard)}
                </Text>
            </View>
          )}

          {summaryData.totalExpenses > 0 && Object.keys(summaryData.expensesByCategory).length > 0 && (
            <View style={styles.categoryExpensesContainer}>
              <Text style={styles.categoryExpensesTitle}>Por Categoria:</Text>
              {Object.entries(summaryData.expensesByCategory)
                .sort(([, a], [, b]) => b - a) 
                .map(([category, total]) => (
                  <View key={category} style={styles.summaryDetailRow}>
                    <Text style={styles.summaryCategoryLabel}>↪ {category}:</Text>
                    <Text style={[styles.summaryCategoryAmount, styles.expenseAmount]}>
                      {formatCurrency(total)}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}> 
              <Text style={styles.summaryLabel}>Investimentos:</Text>
              <Text style={[styles.summaryAmount, styles.investmentAmount]}>
                  {formatCurrency(summaryData.totalInvestments)}
              </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Gastos Mensais por Categoria</Text>
        <View style={styles.monthSelectorContainer}>
          <TouchableOpacity onPress={() => handleChangeChartMonth(-1)} style={styles.monthArrowButton} disabled={isLoadingChartData}>
            <FontAwesome name="chevron-left" size={20} color={isLoadingChartData ? colors.disabled : colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthDisplayText}>
            {chartDisplayDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
          </Text>
          <TouchableOpacity onPress={() => handleChangeChartMonth(1)} style={styles.monthArrowButton} disabled={isLoadingChartData}>
            <FontAwesome name="chevron-right" size={20} color={isLoadingChartData ? colors.disabled : colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.chartRealPlaceholder}>
          {isLoadingChartData ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : chartKitData.length === 0 ? (
            <Text style={styles.placeholderText}>Sem dados de gastos para este mês.</Text>
          ) : (
            <>
              <PieChart
                data={chartKitData}
                width={screenWidth - (styles.sectionCard.padding * 2) - 20}
                height={220}
                chartConfig={chartConfig}
                accessor={"amount"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                hasLegend={false} // Desabilitamos a legenda padrão para criar a nossa
              />
              {/* NOSSA LEGENDA CUSTOMIZADA */}
              <View style={styles.legendContainer}>
                {chartKitData.map((item) => (
                  <View key={item.name} style={styles.legendItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.name} ({formatCurrency(item.amount)})</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Histórico de Transações ({selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})</Text>
        <PeriodSelectorButtons />
        {filteredTransactions.length === 0 && !isLoading ? (
          <View style={styles.centeredMessageContainerList}><Text style={styles.emptyListText}>Nenhuma transação para este período.</Text></View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
            ListFooterComponent={isLoading && filteredTransactions.length > 0 ? <ActivityIndicator style={{marginTop:10}} size="small" color={colors.primary} /> : null}
            scrollEnabled={false} 
          />
        )}
      </View>
    </ScrollView>
  );
}

// --- Função getThemedStyles (COMPLETA) ---
const getThemedStyles = (colors: ThemeColors) => StyleSheet.create({
  scrollViewContainer: { flex: 1, backgroundColor: colors.background },
  scrollContentContainer: { padding: 10, paddingBottom: 30 },
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex:1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  centeredMessageContainerList: { paddingVertical: 20, alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.text, fontSize: 16 },
  sectionCard: { backgroundColor: colors.card, borderRadius: 12, padding: 15, marginBottom: 20, elevation: 3, shadowColor: colors.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' },
  periodSelector: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginVertical: 10, paddingHorizontal: 5, marginBottom: 15 },
  buttonWrapper: { marginHorizontal: Platform.OS === 'android' ? 2 : 0, flex: 1 },
  transactionItem: { paddingVertical: 12, paddingHorizontal: 15, marginVertical: 5, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  itemDescription: { fontSize: 15, color: colors.text, fontWeight: '500' },
  itemDate: { fontSize: 11, color: colors.secondaryText, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  incomeAmount: { color: colors.success },
  expenseAmount: { color: colors.danger },
  investmentAmount: { color: colors.invested },
  emptyListText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: colors.secondaryText },
  listContentContainer: { paddingBottom: 10 },
  monthSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 15 },
  monthArrowButton: { padding: 10 },
  monthDisplayText: { fontSize: 16, fontWeight: 'bold', color: colors.primary, textAlign: 'center', flex: 1 },
  chartRealPlaceholder: { minHeight: 220 + 20, justifyContent: 'center', alignItems: 'center', borderRadius: 8, paddingVertical: 10, overflow: 'hidden' },
  placeholderText: { color: colors.secondaryText, fontSize: 14, textAlign: 'center', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLabel: { fontSize: 16, color: colors.secondaryText },
  summaryAmount: { fontSize: 16, fontWeight: 'bold' },
  summaryDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingLeft: 15, borderBottomWidth: 1, borderBottomColor: colors.border, },
  summaryDetailLabel: { fontSize: 14, color: colors.secondaryText },
  summaryDetailAmount: { fontSize: 14, fontWeight: '500' },
  categoryExpensesContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  categoryExpensesTitle: { fontSize: 14, fontWeight: '600', color: colors.secondaryText, marginBottom: 4, paddingLeft: 15 },
  summaryCategoryLabel: { fontSize: 14, color: colors.secondaryText, flex: 1 },
  summaryCategoryAmount: { fontSize: 14, fontWeight: '500' },
  // --- NOVOS ESTILOS PARA A LEGENDA DO GRÁFICO ---
  legendContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: colors.text,
  },
});