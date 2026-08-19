import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { BankAccount } from '../../src/types.js';

export const getAccounts = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  let userAccounts = data.accounts.filter((a) => a.userId === req.userId);

  if (userAccounts.length === 0 && req.userId) {
    const defaultAcc: BankAccount = {
      id: `acc_${Date.now()}`,
      userId: req.userId,
      name: 'Conta Principal',
      bankName: 'Banco Principal',
      type: 'corrente',
      balance: 0,
      initialBalance: 0,
      color: '#10B981',
      icon: 'Landmark'
    };

    dbStore.updateData((db) => {
      db.accounts.push(defaultAcc);
    });
    userAccounts = [defaultAcc];
  }

  return res.json(userAccounts);
};

export const createAccount = (req: AuthenticatedRequest, res: Response) => {
  const { name, bankName, type, balance, initialBalance, color, icon, accountNumber } = req.body;

  if (!name || balance === undefined) {
    return res.status(400).json({ error: 'Nome e Saldo são obrigatórios.' });
  }

  const newAccount: BankAccount = {
    id: `acc_${Date.now()}`,
    userId: req.userId!,
    name,
    bankName: bankName || name,
    type: type || 'corrente',
    balance: Number(balance),
    initialBalance: initialBalance !== undefined ? Number(initialBalance) : Number(balance),
    color: color || '#820AD1',
    icon: icon || 'Landmark',
    accountNumber
  };

  dbStore.updateData((db) => {
    db.accounts.push(newAccount);
  });

  return res.status(201).json(newAccount);
};

export const updateAccount = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, bankName, type, balance, color, icon, accountNumber } = req.body;

  let updatedAccount: BankAccount | null = null;

  dbStore.updateData((db) => {
    const acc = db.accounts.find((a) => a.id === id && a.userId === req.userId);
    if (acc) {
      if (name) acc.name = name;
      if (bankName) acc.bankName = bankName;
      if (type) acc.type = type;
      if (balance !== undefined) acc.balance = Number(balance);
      if (color) acc.color = color;
      if (icon) acc.icon = icon;
      if (accountNumber !== undefined) acc.accountNumber = accountNumber;
      updatedAccount = acc;
    }
  });

  if (!updatedAccount) {
    return res.status(404).json({ error: 'Conta bancária não encontrada.' });
  }

  return res.json(updatedAccount);
};

export const deleteAccount = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.accounts.findIndex((a) => a.id === id && a.userId === req.userId);
    if (idx !== -1) {
      db.accounts.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Conta bancária não encontrada.' });
  }

  return res.json({ message: 'Conta bancária removida com sucesso.' });
};
