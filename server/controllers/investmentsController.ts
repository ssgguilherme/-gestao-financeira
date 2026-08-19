import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Investment } from '../../src/types.js';

export const getInvestments = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  const userInvestments = data.investments.filter((i) => i.userId === req.userId);
  return res.json(userInvestments);
};

export const createInvestment = (req: AuthenticatedRequest, res: Response) => {
  const { title, type, appliedAmount, currentAmount, yieldRate, broker, date, color } = req.body;

  if (!title || !type || appliedAmount === undefined) {
    return res.status(400).json({ error: 'Título, Tipo e Valor Aplicado são obrigatórios.' });
  }

  const appVal = Number(appliedAmount);
  const curVal = currentAmount !== undefined ? Number(currentAmount) : appVal;

  const newInv: Investment = {
    id: `inv_${Date.now()}`,
    userId: req.userId!,
    title,
    type,
    appliedAmount: appVal,
    currentAmount: curVal,
    yieldRate: yieldRate ? Number(yieldRate) : 0,
    broker: broker || 'Outros',
    date: date || new Date().toISOString().split('T')[0],
    color: color || '#22C55E'
  };

  dbStore.updateData((db) => {
    db.investments.push(newInv);
  });

  return res.status(201).json(newInv);
};

export const updateInvestment = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, currentAmount, yieldRate, broker } = req.body;

  let updated: Investment | null = null;

  dbStore.updateData((db) => {
    const inv = db.investments.find((i) => i.id === id && i.userId === req.userId);
    if (inv) {
      if (title) inv.title = title;
      if (currentAmount !== undefined) inv.currentAmount = Number(currentAmount);
      if (yieldRate !== undefined) inv.yieldRate = Number(yieldRate);
      if (broker) inv.broker = broker;
      updated = inv;
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Investimento não encontrado.' });
  }

  return res.json(updated);
};

export const deleteInvestment = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.investments.findIndex((i) => i.id === id && i.userId === req.userId);
    if (idx !== -1) {
      db.investments.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Investimento não encontrado.' });
  }

  return res.json({ message: 'Investimento removido com sucesso.' });
};
