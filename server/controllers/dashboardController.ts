import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getDashboardSummary = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const data = dbStore.getData();

  const userAccounts = data.accounts.filter((a) => a.userId === userId);
  const userCards = data.cards.filter((c) => c.userId === userId);
  const userTransactions = data.transactions.filter((t) => t.userId === userId);
  const userInvestments = data.investments.filter((i) => i.userId === userId);
  const userFixed = data.fixedAccounts.filter((f) => f.userId === userId && f.active);

  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM

  // Total balance in bank accounts
  const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Filter transactions for current month
  const monthTransactions = userTransactions.filter((t) => t.date.startsWith(currentMonth));

  // Paid month income and expenses
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0);

  // Credit card current bill (expenses on cards in current month)
  const currentCardBill = userTransactions
    .filter((t) => t.cardId && t.date.startsWith(currentMonth) && t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total invested
  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.currentAmount, 0);

  // Pending expenses for remainder of month + active fixed accounts not yet paid
  const pendingMonthExpenses = monthTransactions
    .filter((t) => t.type === 'despesa' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.amount, 0);

  const fixedAccountsPending = userFixed
    .filter((f) => f.lastProcessedMonth !== currentMonth)
    .reduce((sum, f) => sum + f.amount, 0);

  const projectedExpenses = monthExpenses + pendingMonthExpenses + fixedAccountsPending;
  const projectedBalance = totalBalance - (pendingMonthExpenses + fixedAccountsPending);

  const monthSavings = Math.max(0, monthIncome - monthExpenses);
  const savingsPercentage = monthIncome > 0 ? Math.round((monthSavings / monthIncome) * 100) : 0;

  // Category breakdown for current month expenses
  const categoryMap: { [key: string]: number } = {};
  monthTransactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryChart = Object.keys(categoryMap).map((catName) => {
    const categoryObj = data.categories.find((c) => c.name === catName);
    return {
      category: catName,
      amount: categoryMap[catName],
      color: categoryObj?.color || '#3B82F6'
    };
  });

  // Recent 6 months history (Receitas x Despesas x Saldo)
  const monthlyHistory = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = d.toISOString().substring(0, 7);
    const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    const mTx = userTransactions.filter((t) => t.date.startsWith(mStr) && t.status === 'pago');
    const inc = mTx.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
    const exp = mTx.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);

    monthlyHistory.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      monthKey: mStr,
      receitas: inc,
      despesas: exp,
      saldo: inc - exp
    });
  }

  // Cards spending breakdown
  const cardSpending = userCards.map((card) => {
    const cardExpenses = monthTransactions
      .filter((t) => t.cardId === card.id && t.type === 'despesa')
      .reduce((s, t) => s + t.amount, 0);
    return {
      cardName: card.name,
      bank: card.bank,
      spent: cardExpenses,
      limit: card.limit,
      available: card.availableLimit,
      color: card.color
    };
  });

  // Heatmap and Daily History data for the current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const heatmapData = [];
  const dailyHistory = [];
  let runningBalance = totalBalance; // Starting or tracking cumulative balance

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${currentMonth}-${day.toString().padStart(2, '0')}`;
    const dayTxs = userTransactions.filter((t) => t.date === dayStr);
    
    const dayIncome = dayTxs
      .filter((t) => t.type === 'receita' && t.status === 'pago')
      .reduce((s, t) => s + t.amount, 0);

    const daySpent = dayTxs
      .filter((t) => t.type === 'despesa' && t.status === 'pago')
      .reduce((s, t) => s + t.amount, 0);

    const dayNet = dayIncome - daySpent;

    heatmapData.push({
      date: dayStr,
      dayNumber: day,
      amount: daySpent,
      income: dayIncome,
      saldo: dayNet,
      transactionsCount: dayTxs.length,
      transactions: dayTxs
    });

    dailyHistory.push({
      label: `Dia ${day}`,
      dayNumber: day,
      date: dayStr,
      receitas: dayIncome,
      despesas: daySpent,
      saldo: dayNet
    });
  }

  // Upcoming due items (transactions or fixed bills)
  const upcomingDues = [
    ...userTransactions
      .filter((t) => t.status === 'pendente' && t.type === 'despesa')
      .map((t) => ({
        id: t.id,
        title: t.description,
        amount: t.amount,
        dueDate: t.date,
        type: 'Lançamento',
        category: t.category
      })),
    ...userFixed
      .filter((f) => f.lastProcessedMonth !== currentMonth)
      .map((f) => ({
        id: f.id,
        title: f.description,
        amount: f.amount,
        dueDate: `${currentMonth}-${f.dueDay.toString().padStart(2, '0')}`,
        type: 'Conta Fixa',
        category: f.category
      }))
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  return res.json({
    metrics: {
      totalBalance,
      monthIncome,
      monthExpenses,
      currentCardBill,
      totalInvested,
      projectedExpenses,
      projectedBalance,
      monthSavings,
      savingsPercentage,
      activeCardsCount: userCards.length,
      activeAccountsCount: userAccounts.length
    },
    categoryChart,
    monthlyHistory,
    dailyHistory,
    cardSpending,
    heatmapData,
    upcomingDues,
    recentTransactions: userTransactions.slice(-6).reverse(),
    alerts: data.alerts.filter((a) => !a.read).slice(0, 5)
  });
};
