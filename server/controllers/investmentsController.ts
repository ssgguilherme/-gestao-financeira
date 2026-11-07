import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store, Investment } from '../db/store';

export async function getInvestments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const investments = store.getInvestmentsByUser(userId);
    res.json({ investments });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar investimentos.' });
  }
}

export async function createInvestment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { name, type, amountInvested, currentValue, profitability, dueDate } = req.body;
    if (!name || amountInvested === undefined) {
      res.status(400).json({ error: 'Nome e valor investido são obrigatórios.' });
      return;
    }

    const parsedInvested = Math.abs(Number(amountInvested));
    const parsedCurrent = currentValue !== undefined ? Number(currentValue) : parsedInvested;
    const calcProfit = parsedInvested > 0 ? ((parsedCurrent - parsedInvested) / parsedInvested) * 100 : 0;

    const newInv: Investment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: String(name).trim(),
      type: type || 'cdb',
      amountInvested: parsedInvested,
      currentValue: parsedCurrent,
      profitability: profitability !== undefined ? Number(profitability) : Number(calcProfit.toFixed(2)),
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString()
    };

    store.getData().investments.push(newInv);
    store.save();

    res.status(201).json({ message: 'Investimento adicionado com sucesso!', investment: newInv });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar investimento.' });
  }
}
