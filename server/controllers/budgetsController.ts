import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Budget } from '../../src/types.js';

export const getBudgets = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const data = dbStore.getData();

  const userBudgets = data.budgets.filter((b) => b.userId === userId);
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Recalculate spent amounts from current month paid transactions
  const monthExpenses = data.transactions.filter(
    (t) => t.userId === userId && t.date.startsWith(currentMonth) && t.type === 'despesa' && t.status === 'pago'
  );

  const updatedBudgets = userBudgets.map((b) => {
    const spent = monthExpenses
      .filter((t) => t.category === b.category)
      .reduce((s, t) => s + t.amount, 0);
    return {
      ...b,
      currentSpent: spent
    };
  });

  return res.json(updatedBudgets);
};

export const setBudget = (req: AuthenticatedRequest, res: Response) => {
  const { category, monthlyLimit } = req.body;

  if (!category || monthlyLimit === undefined) {
    return res.status(400).json({ error: 'Categoria e limite mensal são obrigatórios.' });
  }

  let savedBudget: Budget | null = null;

  dbStore.updateData((db) => {
    let budget = db.budgets.find((b) => b.userId === req.userId && b.category === category);
    if (budget) {
      budget.monthlyLimit = Number(monthlyLimit);
    } else {
      budget = {
        id: `bud_${Date.now()}`,
        userId: req.userId!,
        category,
        monthlyLimit: Number(monthlyLimit),
        currentSpent: 0
      };
      db.budgets.push(budget);
    }
    savedBudget = budget;
  });

  return res.json(savedBudget);
};

export const deleteBudget = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.budgets.findIndex((b) => b.id === id && b.userId === req.userId);
    if (idx !== -1) {
      db.budgets.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Orçamento não encontrado.' });
  }

  return res.json({ message: 'Orçamento removido com sucesso.' });
};
