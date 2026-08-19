import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FixedAccount, Transaction } from '../../src/types.js';

export const getFixedAccounts = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  const userFixed = data.fixedAccounts.filter((f) => f.userId === req.userId);
  return res.json(userFixed);
};

export const createFixedAccount = (req: AuthenticatedRequest, res: Response) => {
  const { description, amount, category, accountId, dueDay, autoProcess } = req.body;

  if (!description || !amount || !dueDay) {
    return res.status(400).json({ error: 'Descrição, valor e dia de vencimento são obrigatórios.' });
  }

  const newFixed: FixedAccount = {
    id: `fix_${Date.now()}`,
    userId: req.userId!,
    description,
    amount: Number(amount),
    category: category || 'Outros',
    accountId: accountId || 'acc_1',
    dueDay: Number(dueDay),
    autoProcess: autoProcess ?? true,
    active: true
  };

  dbStore.updateData((db) => {
    db.fixedAccounts.push(newFixed);
  });

  return res.status(201).json(newFixed);
};

export const updateFixedAccount = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { description, amount, category, accountId, dueDay, autoProcess, active } = req.body;

  let updated: FixedAccount | null = null;

  dbStore.updateData((db) => {
    const fix = db.fixedAccounts.find((f) => f.id === id && f.userId === req.userId);
    if (fix) {
      if (description) fix.description = description;
      if (amount !== undefined) fix.amount = Number(amount);
      if (category) fix.category = category;
      if (accountId) fix.accountId = accountId;
      if (dueDay) fix.dueDay = Number(dueDay);
      if (autoProcess !== undefined) fix.autoProcess = autoProcess;
      if (active !== undefined) fix.active = active;
      updated = fix;
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Conta fixa não encontrada.' });
  }

  return res.json(updated);
};

export const deleteFixedAccount = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.fixedAccounts.findIndex((f) => f.id === id && f.userId === req.userId);
    if (idx !== -1) {
      db.fixedAccounts.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Conta fixa não encontrada.' });
  }

  return res.json({ message: 'Conta fixa removida com sucesso.' });
};

// Process current month due fixed accounts into actual transactions automatically
export const processFixedAccounts = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const currentMonth = new Date().toISOString().substring(0, 7);
  let processedCount = 0;

  dbStore.updateData((db) => {
    const userFixed = db.fixedAccounts.filter((f) => f.userId === userId && f.active);

    userFixed.forEach((fixed) => {
      if (fixed.lastProcessedMonth !== currentMonth) {
        const dueDateStr = `${currentMonth}-${fixed.dueDay.toString().padStart(2, '0')}`;

        const newTx: Transaction = {
          id: `tx_fix_${fixed.id}_${Date.now()}`,
          userId: userId!,
          description: `[Conta Recorrente] ${fixed.description}`,
          amount: fixed.amount,
          type: 'despesa',
          paymentMethod: 'pix',
          category: fixed.category,
          accountId: fixed.accountId,
          date: dueDateStr,
          status: 'pendente',
          observation: 'Lançamento gerado automaticamente pelo módulo de contas fixas'
        };

        db.transactions.push(newTx);
        fixed.lastProcessedMonth = currentMonth;
        processedCount++;
      }
    });
  });

  return res.json({
    message: `${processedCount} contas fixas foram processadas para o mês atual (${currentMonth}).`,
    processedCount
  });
};
