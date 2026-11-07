import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store, PixKey, Transaction } from '../db/store';

export async function getPixKeys(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const pixKeys = store.getPixKeysByUser(userId);
    res.json({ pixKeys });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar chaves Pix.' });
  }
}

export async function createPixKey(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { key, type, accountId } = req.body;
    if (!key || !type) {
      res.status(400).json({ error: 'Chave e tipo são obrigatórios.' });
      return;
    }

    // Se accountId for fornecido, valida IDOR
    let targetAccId = accountId;
    const userAccounts = store.getAccountsByUser(userId);
    if (targetAccId) {
      const owns = userAccounts.some((a) => a.id === targetAccId);
      if (!owns) {
        res.status(403).json({ error: 'A conta bancária informada não pertence ao usuário.' });
        return;
      }
    } else if (userAccounts.length > 0) {
      targetAccId = userAccounts[0].id;
    } else {
      res.status(400).json({ error: 'Nenhuma conta bancária vinculada disponível.' });
      return;
    }

    const newPixKey: PixKey = {
      id: `pix_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      key: String(key).trim(),
      type: type || 'random',
      accountId: targetAccId,
      createdAt: new Date().toISOString()
    };

    store.getData().pixKeys.push(newPixKey);
    store.save();

    res.status(201).json({ message: 'Chave Pix cadastrada com sucesso!', pixKey: newPixKey });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar chave Pix.' });
  }
}

export async function transferPix(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { targetKey, amount, accountId, description } = req.body;
    if (!targetKey || !amount || !accountId) {
      res.status(400).json({ error: 'Chave de destino, valor e conta de origem são obrigatórios.' });
      return;
    }

    const parsedAmount = Math.abs(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'O valor da transferência Pix deve ser maior que zero.' });
      return;
    }

    // Valida se a conta de origem pertence ao usuário (IDOR check)
    const account = store.getAccountsByUser(userId).find((a) => a.id === accountId);
    if (!account) {
      res.status(403).json({ error: 'Conta de origem inválida ou não pertence a você.' });
      return;
    }

    if (account.balance < parsedAmount) {
      res.status(400).json({
        error: 'Saldo insuficiente',
        message: `Saldo atual na conta ${account.name}: R$ ${account.balance.toFixed(2)}.`
      });
      return;
    }

    // Debita da conta
    account.balance -= parsedAmount;

    // Registra transação
    const tx: Transaction = {
      id: `tx_pix_${Date.now()}`,
      userId,
      accountId,
      description: `Transferência PIX para ${targetKey} ${description ? `- ${description}` : ''}`,
      amount: parsedAmount,
      type: 'expense',
      category: 'Transferências & Pix',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      status: 'completed',
      observation: `Chave Pix: ${targetKey}`,
      createdAt: new Date().toISOString()
    };

    store.addTransaction(tx);

    res.json({
      message: 'PIX enviado com sucesso!',
      receipt: {
        id: `comprovante_${Date.now()}`,
        targetKey,
        amount: parsedAmount,
        accountName: account.name,
        date: new Date().toISOString(),
        authCode: `E${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`
      },
      newBalance: account.balance
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar transferência Pix.' });
  }
}
