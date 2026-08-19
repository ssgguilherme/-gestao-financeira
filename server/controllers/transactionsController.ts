import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Transaction } from '../../src/types.js';

export const getTransactions = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const { search, type, status, category, accountId, cardId, startDate, endDate, paymentMethod } = req.query;

  const data = dbStore.getData();
  let userTx = data.transactions.filter((t) => t.userId === userId);

  if (search) {
    const q = (search as string).toLowerCase();
    userTx = userTx.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.observation && t.observation.toLowerCase().includes(q))
    );
  }

  if (type) {
    userTx = userTx.filter((t) => t.type === type);
  }

  if (status) {
    userTx = userTx.filter((t) => t.status === status);
  }

  if (category) {
    userTx = userTx.filter((t) => t.category === category);
  }

  if (accountId) {
    userTx = userTx.filter((t) => t.accountId === accountId);
  }

  if (cardId) {
    userTx = userTx.filter((t) => t.cardId === cardId);
  }

  if (paymentMethod) {
    userTx = userTx.filter((t) => t.paymentMethod === paymentMethod);
  }

  if (startDate) {
    userTx = userTx.filter((t) => t.date >= (startDate as string));
  }

  if (endDate) {
    userTx = userTx.filter((t) => t.date <= (endDate as string));
  }

  // Sort newest first
  userTx.sort((a, b) => b.date.localeCompare(a.date));

  return res.json(userTx);
};

export const createTransaction = (req: AuthenticatedRequest, res: Response) => {
  const {
    description,
    amount,
    type,
    paymentMethod,
    category,
    accountId,
    cardId,
    date,
    status,
    observation,
    attachmentUrl,
    pixKey,
    installmentsCount
  } = req.body;

  if (!description || amount === undefined || !type || !category || !date) {
    return res.status(400).json({
      error: 'Descrição, Valor, Tipo, Categoria e Data são obrigatórios.'
    });
  }

  const numAmount = Number(amount);
  const numInstallments = installmentsCount ? Number(installmentsCount) : 1;
  const createdTransactions: Transaction[] = [];

  dbStore.updateData((db) => {
    const parentId = `tx_${Date.now()}`;

    if (numInstallments > 1 && type === 'despesa') {
      const installmentAmount = Number((numAmount / numInstallments).toFixed(2));
      const baseDate = new Date(date);

      for (let i = 1; i <= numInstallments; i++) {
        const itemDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + (i - 1), baseDate.getDate());
        const itemDateStr = itemDate.toISOString().split('T')[0];

        const txItem: Transaction = {
          id: i === 1 ? parentId : `${parentId}_p${i}`,
          userId: req.userId!,
          description: `${description} (${i}/${numInstallments})`,
          amount: installmentAmount,
          type: 'despesa',
          paymentMethod: paymentMethod || 'cartao_credito',
          category,
          accountId,
          cardId,
          date: itemDateStr,
          status: i === 1 ? (status || 'pago') : 'pendente',
          observation,
          attachmentUrl,
          installment: {
            totalInstallments: numInstallments,
            currentInstallment: i,
            installmentAmount,
            parentTransactionId: parentId
          }
        };

        db.transactions.push(txItem);
        createdTransactions.push(txItem);

        // Adjust card or account balances if needed
        if (i === 1 && txItem.status === 'pago') {
          if (cardId) {
            const card = db.cards.find((c) => c.id === cardId);
            if (card) {
              card.availableLimit = Math.max(0, card.availableLimit - installmentAmount);
            }
          } else if (accountId) {
            const acc = db.accounts.find((a) => a.id === accountId);
            if (acc) {
              acc.balance -= installmentAmount;
            }
          }
        }
      }
    } else {
      // Single Transaction
      const singleTx: Transaction = {
        id: parentId,
        userId: req.userId!,
        description,
        amount: numAmount,
        type,
        paymentMethod: paymentMethod || 'pix',
        category,
        accountId,
        cardId,
        date,
        status: status || 'pago',
        observation,
        attachmentUrl,
        pixKey
      };

      db.transactions.push(singleTx);
      createdTransactions.push(singleTx);

      // Update account or card balance if paid
      if (singleTx.status === 'pago') {
        if (type === 'receita' && accountId) {
          const acc = db.accounts.find((a) => a.id === accountId);
          if (acc) acc.balance += numAmount;
        } else if (type === 'despesa') {
          if (cardId) {
            const card = db.cards.find((c) => c.id === cardId);
            if (card) card.availableLimit = Math.max(0, card.availableLimit - numAmount);
          } else if (accountId) {
            const acc = db.accounts.find((a) => a.id === accountId);
            if (acc) acc.balance -= numAmount;
          }
        }
      }
    }
  });

  return res.status(201).json(createdTransactions[0]);
};

export const updateTransaction = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { description, amount, type, category, accountId, cardId, date, status, observation } = req.body;

  let updatedTx: Transaction | null = null;

  dbStore.updateData((db) => {
    const tx = db.transactions.find((t) => t.id === id && t.userId === req.userId);
    if (tx) {
      if (description) tx.description = description;
      if (amount !== undefined) tx.amount = Number(amount);
      if (type) tx.type = type;
      if (category) tx.category = category;
      if (accountId !== undefined) tx.accountId = accountId;
      if (cardId !== undefined) tx.cardId = cardId;
      if (date) tx.date = date;
      if (status) tx.status = status;
      if (observation !== undefined) tx.observation = observation;
      updatedTx = tx;
    }
  });

  if (!updatedTx) {
    return res.status(404).json({ error: 'Lançamento não encontrado.' });
  }

  return res.json(updatedTx);
};

export const deleteTransaction = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.transactions.findIndex((t) => t.id === id && t.userId === req.userId);
    if (idx !== -1) {
      db.transactions.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Lançamento não encontrado.' });
  }

  return res.json({ message: 'Lançamento excluído com sucesso.' });
};
