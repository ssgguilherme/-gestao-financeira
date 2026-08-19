import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Transaction } from '../../src/types.js';

export const exportTransactionsCSV = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  const data = dbStore.getData();
  const userTx = data.transactions.filter((t) => t.userId === userId);

  let csvContent = 'ID,Data,Descrição,Tipo,Categoria,Valor,Forma de Pagamento,Status,Observação\n';

  userTx.forEach((t) => {
    const desc = `"${t.description.replace(/"/g, '""')}"`;
    const obs = t.observation ? `"${t.observation.replace(/"/g, '""')}"` : '""';
    csvContent += `${t.id},${t.date},${desc},${t.type},${t.category},${t.amount.toFixed(2)},${t.paymentMethod},${t.status},${obs}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="extrato_financeiro.csv"');
  return res.send(csvContent);
};

export const exportDatabaseBackup = (req: AuthenticatedRequest, res: Response) => {
  const data = dbStore.getData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="backup_financeiro_${new Date().toISOString().split('T')[0]}.json"`);
  return res.json(data);
};

export const importTransactions = (req: AuthenticatedRequest, res: Response) => {
  const { transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: 'Nenhum lançamento válido enviado para importação.' });
  }

  let importedCount = 0;

  dbStore.updateData((db) => {
    transactions.forEach((tx: Partial<Transaction>) => {
      if (tx.description && tx.amount) {
        const newTx: Transaction = {
          id: `tx_imp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          userId: req.userId!,
          description: tx.description,
          amount: Math.abs(Number(tx.amount)),
          type: tx.type || (Number(tx.amount) >= 0 ? 'receita' : 'despesa'),
          paymentMethod: tx.paymentMethod || 'pix',
          category: tx.category || 'Outros',
          date: tx.date || new Date().toISOString().split('T')[0],
          status: tx.status || 'pago',
          observation: 'Importado de extrato bancário (CSV/OFX)'
        };
        db.transactions.push(newTx);
        importedCount++;
      }
    });
  });

  return res.json({
    message: `${importedCount} lançamentos importados com sucesso!`,
    importedCount
  });
};

export const restoreDatabaseBackup = (req: AuthenticatedRequest, res: Response) => {
  const { backupData } = req.body;

  if (!backupData || !backupData.transactions || !backupData.accounts) {
    return res.status(400).json({ error: 'Arquivo de backup inválido.' });
  }

  dbStore.updateData((db) => {
    if (backupData.accounts) db.accounts = backupData.accounts;
    if (backupData.cards) db.cards = backupData.cards;
    if (backupData.categories) db.categories = backupData.categories;
    if (backupData.transactions) db.transactions = backupData.transactions;
    if (backupData.fixedAccounts) db.fixedAccounts = backupData.fixedAccounts;
    if (backupData.goals) db.goals = backupData.goals;
    if (backupData.investments) db.investments = backupData.investments;
    if (backupData.budgets) db.budgets = backupData.budgets;
  });

  return res.json({ message: 'Backup restaurado com sucesso!' });
};
