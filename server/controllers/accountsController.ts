import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store, BankAccount, CreditCard } from '../db/store';

// --- CONTAS BANCÁRIAS ---
export async function getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const accounts = store.getAccountsByUser(userId);
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar contas.' });
  }
}

export async function createAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { name, type, balance, bank, color } = req.body;
    if (!name || !bank) {
      res.status(400).json({ error: 'Nome da conta e instituição bancária são obrigatórios.' });
      return;
    }

    const newAccount: BankAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: String(name).trim(),
      type: type || 'checking',
      balance: Number(balance) || 0,
      bank: String(bank).trim(),
      color: color || '#3b82f6',
      icon: 'Building2',
      createdAt: new Date().toISOString()
    };

    store.getData().accounts.push(newAccount);
    store.save();

    res.status(201).json({ message: 'Conta criada com sucesso!', account: newAccount });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar conta bancária.' });
  }
}

// --- CARTÕES DE CRÉDITO ---
export async function getCards(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const cards = store.getCardsByUser(userId);
    res.json({ cards });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar cartões.' });
  }
}

export async function createCard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { name, last4, brand, limit, closingDay, dueDay, color } = req.body;
    if (!name || !last4 || !limit) {
      res.status(400).json({ error: 'Nome, últimos 4 dígitos e limite são obrigatórios.' });
      return;
    }

    const parsedLimit = Math.abs(Number(limit));

    const newCard: CreditCard = {
      id: `crd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: String(name).trim(),
      last4: String(last4).slice(-4),
      brand: brand || 'mastercard',
      limit: parsedLimit,
      availableLimit: parsedLimit,
      closingDay: Number(closingDay) || 5,
      dueDay: Number(dueDay) || 12,
      color: color || '#820ad1',
      createdAt: new Date().toISOString()
    };

    store.getData().cards.push(newCard);
    store.save();

    res.status(201).json({ message: 'Cartão cadastrado com sucesso!', card: newCard });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar cartão de crédito.' });
  }
}
