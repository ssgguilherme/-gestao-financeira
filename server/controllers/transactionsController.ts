import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store, Transaction } from '../db/store';

export async function getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    let txs = store.getTransactionsByUser(userId);

    const { type, category, accountId, cardId, search, startDate, endDate } = req.query;

    if (type && typeof type === 'string' && type !== 'all') {
      txs = txs.filter((t) => t.type === type);
    }

    if (category && typeof category === 'string' && category !== 'all') {
      txs = txs.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (accountId && typeof accountId === 'string' && accountId !== 'all') {
      txs = txs.filter((t) => t.accountId === accountId);
    }

    if (cardId && typeof cardId === 'string' && cardId !== 'all') {
      txs = txs.filter((t) => t.cardId === cardId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      txs = txs.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        (t.observation && t.observation.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (startDate && typeof startDate === 'string') {
      txs = txs.filter((t) => t.date >= startDate);
    }

    if (endDate && typeof endDate === 'string') {
      txs = txs.filter((t) => t.date <= endDate);
    }

    res.json({
      transactions: txs,
      total: txs.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
}

export async function createTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const {
      description,
      amount,
      type,
      category,
      date,
      paymentMethod,
      accountId,
      cardId,
      status,
      observation
    } = req.body;

    if (!description || amount === undefined || !type || !category) {
      res.status(400).json({ error: 'Campos obrigatórios: descrição, valor, tipo e categoria.' });
      return;
    }

    const parsedAmount = Math.abs(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'O valor da transação deve ser positivo e maior que zero.' });
      return;
    }

    // --- PROTEÇÃO CONTRA IDOR (OWASP A01) ---
    // Se accountId foi fornecido, verifica se a conta realmente pertence ao req.userId!
    if (accountId) {
      const userAccounts = store.getAccountsByUser(userId);
      const ownsAccount = userAccounts.some((a) => a.id === accountId);
      if (!ownsAccount) {
        res.status(403).json({
          error: 'Acesso negado (IDOR)',
          message: 'A conta bancária informada não pertence ao usuário autenticado.'
        });
        return;
      }
    }

    // Se cardId foi fornecido, verifica se o cartão realmente pertence ao req.userId!
    if (cardId) {
      const userCards = store.getCardsByUser(userId);
      const ownsCard = userCards.some((c) => c.id === cardId);
      if (!ownsCard) {
        res.status(403).json({
          error: 'Acesso negado (IDOR)',
          message: 'O cartão de crédito informado não pertence ao usuário autenticado.'
        });
        return;
      }
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      accountId,
      cardId,
      description: String(description).trim(),
      amount: parsedAmount,
      type,
      category: String(category).trim(),
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod || 'pix',
      status: status || 'completed',
      observation: observation ? String(observation).trim() : undefined,
      createdAt: new Date().toISOString()
    };

    // Atualiza saldo da conta se a transação estiver completada
    if (newTx.status === 'completed' && accountId) {
      const account = store.getAccountsByUser(userId).find((a) => a.id === accountId);
      if (account) {
        if (newTx.type === 'income') {
          account.balance += parsedAmount;
        } else if (newTx.type === 'expense') {
          account.balance -= parsedAmount;
        }
      }
    }

    // Atualiza limite do cartão de crédito se for despesa no cartão
    if (newTx.status === 'completed' && cardId && newTx.type === 'expense') {
      const card = store.getCardsByUser(userId).find((c) => c.id === cardId);
      if (card) {
        card.availableLimit = Math.max(0, card.availableLimit - parsedAmount);
      }
    }

    // Atualiza gasto no orçamento da categoria se houver
    const budget = store.getBudgetsByUser(userId).find(
      (b) => b.categoryName.toLowerCase() === newTx.category.toLowerCase()
    );
    if (budget && newTx.type === 'expense') {
      budget.spent += parsedAmount;
    }

    store.addTransaction(newTx);

    res.status(201).json({
      message: 'Transação adicionada com sucesso!',
      transaction: newTx
    });
  } catch (err: any) {
    console.error('Erro ao criar transação:', err);
    res.status(500).json({ error: 'Erro ao cadastrar transação.' });
  }
}

export async function deleteTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const success = store.deleteTransaction(id, userId);
    if (!success) {
      res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
      return;
    }

    res.json({ message: 'Transação excluída com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao excluir transação.' });
  }
}
