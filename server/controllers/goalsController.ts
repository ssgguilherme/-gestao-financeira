import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store, Goal, Budget } from '../db/store';

// --- METAS FINANCEIRAS ---
export async function getGoals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const goals = store.getGoalsByUser(userId);
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar metas.' });
  }
}

export async function createGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { title, targetAmount, currentAmount, deadline, color, icon } = req.body;
    if (!title || !targetAmount) {
      res.status(400).json({ error: 'Título e valor alvo são obrigatórios.' });
      return;
    }

    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: String(title).trim(),
      targetAmount: Math.abs(Number(targetAmount)),
      currentAmount: Math.abs(Number(currentAmount)) || 0,
      deadline: deadline || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: color || '#10b981',
      icon: icon || 'Target',
      createdAt: new Date().toISOString()
    };

    store.getData().goals.push(newGoal);
    store.save();

    res.status(201).json({ message: 'Meta criada com sucesso!', goal: newGoal });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar meta.' });
  }
}

export async function updateGoalDeposit(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const goal = store.getGoalsByUser(userId).find((g) => g.id === id);
    if (!goal) {
      res.status(404).json({ error: 'Meta não encontrada.' });
      return;
    }

    const deposit = Number(amount);
    if (isNaN(deposit) || deposit <= 0) {
      res.status(400).json({ error: 'Informe um valor de aporte positivo.' });
      return;
    }

    goal.currentAmount += deposit;
    store.save();

    res.json({ message: 'Aporte realizado com sucesso!', goal });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar aporte na meta.' });
  }
}

// --- ORÇAMENTOS POR CATEGORIA ---
export async function getBudgets(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const budgets = store.getBudgetsByUser(userId);
    res.json({ budgets });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar orçamentos.' });
  }
}

export async function createBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { categoryName, limit } = req.body;
    if (!categoryName || !limit) {
      res.status(400).json({ error: 'Nome da categoria e limite são obrigatórios.' });
      return;
    }

    const now = new Date();
    const newBudget: Budget = {
      id: `bdg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      categoryId: `cat_${Date.now()}`,
      categoryName: String(categoryName).trim(),
      limit: Math.abs(Number(limit)),
      spent: 0,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };

    store.getData().budgets.push(newBudget);
    store.save();

    res.status(201).json({ message: 'Orçamento definido com sucesso!', budget: newBudget });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao definir orçamento.' });
  }
}
