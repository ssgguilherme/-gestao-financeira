import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreditCard, Transaction } from '../../src/types.js';

export const getCards = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  const userCards = data.cards.filter((c) => c.userId === req.userId);
  return res.json(userCards);
};

export const createCard = (req: AuthenticatedRequest, res: Response) => {
  const { name, bank, limit, closingDay, dueDay, color, brand, lastDigits } = req.body;

  if (!name || !limit || !closingDay || !dueDay) {
    return res.status(400).json({ error: 'Nome, limite, dia de fechamento e dia de vencimento são obrigatórios.' });
  }

  const numLimit = Number(limit);
  const newCard: CreditCard = {
    id: `card_${Date.now()}`,
    userId: req.userId!,
    name,
    bank: bank || 'Outros',
    limit: numLimit,
    availableLimit: numLimit,
    closingDay: Number(closingDay),
    dueDay: Number(dueDay),
    color: color || '#1E293B',
    brand: brand || 'mastercard',
    lastDigits: lastDigits || Math.floor(1000 + Math.random() * 9000).toString()
  };

  dbStore.updateData((db) => {
    db.cards.push(newCard);
  });

  return res.status(201).json(newCard);
};

export const updateCard = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, bank, limit, availableLimit, closingDay, dueDay, color, brand } = req.body;

  let updatedCard: CreditCard | null = null;

  dbStore.updateData((db) => {
    const card = db.cards.find((c) => c.id === id && c.userId === req.userId);
    if (card) {
      if (name) card.name = name;
      if (bank) card.bank = bank;
      if (limit !== undefined) card.limit = Number(limit);
      if (availableLimit !== undefined) card.availableLimit = Number(availableLimit);
      if (closingDay) card.closingDay = Number(closingDay);
      if (dueDay) card.dueDay = Number(dueDay);
      if (color) card.color = color;
      if (brand) card.brand = brand;
      updatedCard = card;
    }
  });

  if (!updatedCard) {
    return res.status(404).json({ error: 'Cartão de crédito não encontrado.' });
  }

  return res.json(updatedCard);
};

export const deleteCard = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  let deleted = false;
  dbStore.updateData((db) => {
    const idx = db.cards.findIndex((c) => c.id === id && c.userId === req.userId);
    if (idx !== -1) {
      db.cards.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ error: 'Cartão de crédito não encontrado.' });
  }

  return res.json({ message: 'Cartão removido com sucesso.' });
};

// Pay Credit Card Bill
export const payCardBill = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { accountId, amount } = req.body;

  if (!accountId || !amount) {
    return res.status(400).json({ error: 'Selecione a conta de pagamento e informe o valor da fatura.' });
  }

  let success = false;
  let message = '';

  dbStore.updateData((db) => {
    const card = db.cards.find((c) => c.id === id && c.userId === req.userId);
    const acc = db.accounts.find((a) => a.id === accountId && a.userId === req.userId);

    if (!card) {
      message = 'Cartão não encontrado.';
      return;
    }
    if (!acc) {
      message = 'Conta para débito não encontrada.';
      return;
    }

    const payAmount = Number(amount);
    if (acc.balance < payAmount) {
      message = `Saldo insuficiente na conta ${acc.name}. Saldo atual: R$ ${acc.balance.toFixed(2)}`;
      return;
    }

    // Deduct from bank account
    acc.balance -= payAmount;

    // Restore card available limit
    card.availableLimit = Math.min(card.limit, card.availableLimit + payAmount);

    // Create a transaction record for the bill payment
    const newTx: Transaction = {
      id: `tx_pay_${Date.now()}`,
      userId: req.userId!,
      description: `Pagamento Fatura ${card.name}`,
      amount: payAmount,
      type: 'despesa',
      paymentMethod: 'pix',
      category: 'Outros',
      accountId: acc.id,
      cardId: card.id,
      date: new Date().toISOString().split('T')[0],
      status: 'pago',
      observation: `Pagamento de fatura do cartão de crédito ${card.name}`
    };

    db.transactions.push(newTx);
    success = true;
  });

  if (!success) {
    return res.status(400).json({ error: message || 'Não foi possível pagar a fatura.' });
  }

  return res.json({ message: 'Fatura paga com sucesso e limite liberado!' });
};
