import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FinancialGoal } from '../../src/types.js';

export const getGoals = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  const userGoals = data.goals.filter((g) => g.userId === req.userId);
  return res.json(userGoals);
};

export const createGoal = (req: AuthenticatedRequest, res: Response) => {
  const { title, targetAmount, currentAmount, deadline, color, category } = req.body;

  if (!title || !targetAmount || !deadline) {
    return res.status(400).json({ error: 'Título, valor alvo e prazo são obrigatórios.' });
  }

  const newGoal: FinancialGoal = {
    id: `goal_${Date.now()}`,
    userId: req.userId!,
    title,
    targetAmount: Number(targetAmount),
    currentAmount: currentAmount ? Number(currentAmount) : 0,
    deadline,
    color: color || '#3B82F6',
    category: category || 'Geral'
  };

  dbStore.updateData((db) => {
    db.goals.push(newGoal);
  });

  return res.status(201).json(newGoal);
};

export const depositGoal = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { amount, action } = req.body; // action: 'add' or 'subtract'

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Informe um valor válido maior que zero.' });
  }

  let updatedGoal: FinancialGoal | null = null;
  const val = Number(amount);

  dbStore.updateData((db) => {
    const goal = db.goals.find((g) => g.id === id && g.userId === req.userId);
    if (goal) {
      if (action === 'subtract') {
        goal.currentAmount = Math.max(0, goal.currentAmount - val);
      } else {
        goal.currentAmount += val;
      }
      updatedGoal = goal;
    }
  });

  if (!updatedGoal) {
    return res.status(404).json({ error: 'Meta não encontrada.' });
  }

  return res.json(updatedGoal);
};

export const deleteGoal = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.goals.findIndex((g) => g.id === id && g.userId === req.userId);
    if (idx !== -1) {
      db.goals.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Meta não encontrada.' });
  }

  return res.json({ message: 'Meta removida com sucesso.' });
};
