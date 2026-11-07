import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store } from '../db/store';

export async function getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const accounts = store.getAccountsByUser(userId);
    const cards = store.getCardsByUser(userId);
    const transactions = store.getTransactionsByUser(userId);
    const investments = store.getInvestmentsByUser(userId);
    const budgets = store.getBudgetsByUser(userId);
    const goals = store.getGoalsByUser(userId);
    const notifications = store.getNotificationsByUser(userId);

    // 1. Saldo Total em Contas
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // 2. Transações do Mês Atual
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const currentMonthTxs = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
    });

    const monthlyIncome = currentMonthTxs
      .filter((tx) => tx.type === 'income' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const monthlyExpense = currentMonthTxs
      .filter((tx) => tx.type === 'expense' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // 3. Cartões de Crédito
    const totalCreditLimit = cards.reduce((sum, c) => sum + c.limit, 0);
    const availableCreditLimit = cards.reduce((sum, c) => sum + c.availableLimit, 0);
    const usedCreditLimit = totalCreditLimit - availableCreditLimit;

    // 4. Investimentos
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const currentInvestmentsValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const investmentProfitability = totalInvested > 0
      ? ((currentInvestmentsValue - totalInvested) / totalInvested) * 100
      : 0;

    // 5. Despesas por Categoria (para Gráfico Doughnut)
    const categoryMap: Record<string, number> = {};
    currentMonthTxs
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const cat = tx.category || 'Outros';
        categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
      });

    const expensesByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount
    }));

    // 6. Fluxo dos Últimos 6 Meses (para Gráfico de Linha/Barras)
    const monthlyFlow: Array<{ month: string; income: number; expense: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yVal = d.getFullYear();
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });

      const mIncome = transactions
        .filter((tx) => {
          const t = new Date(tx.date);
          return t.getMonth() === mIdx && t.getFullYear() === yVal && tx.type === 'income' && tx.status === 'completed';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      const mExpense = transactions
        .filter((tx) => {
          const t = new Date(tx.date);
          return t.getMonth() === mIdx && t.getFullYear() === yVal && tx.type === 'expense' && tx.status === 'completed';
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      monthlyFlow.push({
        month: monthLabel,
        income: mIncome,
        expense: mExpense
      });
    }

    // 7. Alertas Seguros e Filtrados para o req.userId (sem vazamento de outros usuários)
    const alerts: Array<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'success' }> = [];

    // Checagem de orçamentos estourados
    budgets.forEach((b) => {
      if (b.spent > b.limit) {
        alerts.push({
          id: `alert_budget_${b.id}`,
          title: `Orçamento Excedido: ${b.categoryName}`,
          message: `Você gastou R$ ${b.spent.toFixed(2)} do teto de R$ ${b.limit.toFixed(2)}.`,
          type: 'warning'
        });
      }
    });

    // Notificações do usuário
    notifications.forEach((n) => {
      alerts.push({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type
      });
    });

    res.json({
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlySavings: monthlyIncome - monthlyExpense,
        totalCreditLimit,
        availableCreditLimit,
        usedCreditLimit,
        totalInvested,
        currentInvestmentsValue,
        investmentProfitability: Number(investmentProfitability.toFixed(2)),
        accountsCount: accounts.length,
        cardsCount: cards.length,
        transactionsCount: transactions.length
      },
      recentTransactions: transactions.slice(0, 7),
      expensesByCategory,
      monthlyFlow,
      alerts,
      goalsSummary: goals.slice(0, 3)
    });
  } catch (err: any) {
    console.error('Erro ao obter dashboard:', err);
    res.status(500).json({ error: 'Erro ao gerar dados do painel.' });
  }
}
