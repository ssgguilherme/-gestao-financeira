import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { store } from '../db/store';

/**
 * Sanitiza valores de texto para evitar CSV Formula Injection (OWASP A03)
 * Se uma célula começar com '=', '+', '-', '@', '\t', '\r', prefixa com apóstrofo (')
 */
function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  
  // Detecção de caracteres executáveis em planilhas (Excel, LibreOffice)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escapa aspas duplas internas
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exporta Backup Seguro Tenant-Scoped (OWASP A01 Corrigido)
 * Contém SOMENTE os dados do usuário autenticado.
 * NUNCA exporta hashes de senha, tokens ou dados de outros usuários!
 */
export async function exportUserBackup(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId || !req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const backupPayload = {
      version: '2.0.0-tenant-scoped',
      exportedAt: new Date().toISOString(),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      },
      accounts: store.getAccountsByUser(userId),
      cards: store.getCardsByUser(userId),
      transactions: store.getTransactionsByUser(userId),
      categories: store.getCategoriesByUser(userId),
      budgets: store.getBudgetsByUser(userId),
      goals: store.getGoalsByUser(userId),
      investments: store.getInvestmentsByUser(userId),
      pixKeys: store.getPixKeysByUser(userId),
      notifications: store.getNotificationsByUser(userId)
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="finanflow-backup-${userId}-${Date.now()}.json"`);
    res.json(backupPayload);
  } catch (err: any) {
    console.error('Erro ao exportar backup:', err);
    res.status(500).json({ error: 'Erro ao gerar backup seguro.' });
  }
}

/**
 * Restaura Backup Seguro Tenant-Scoped (OWASP A01 Corrigido)
 * Substitui estritamente os dados do usuário autenticado (req.userId).
 * Não afeta contas de outros usuários no sistema.
 */
export async function restoreUserBackup(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const backupData = req.body;
    if (!backupData || typeof backupData !== 'object') {
      res.status(400).json({ error: 'Payload de restauração inválido. Envie um JSON válido.' });
      return;
    }

    // Executa a restauração isolada
    store.restoreUserBackup(userId, backupData);

    res.json({
      message: 'Dados restaurados com sucesso com isolamento estrito de conta!',
      restoredAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Erro na restauração:', err);
    res.status(500).json({ error: 'Falha ao restaurar dados do backup.' });
  }
}

/**
 * Exporta Extrato em CSV com Sanitização contra Injeção de Fórmulas (OWASP A03 Corrigido)
 */
export async function exportCsvReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const transactions = store.getTransactionsByUser(userId);
    const accounts = store.getAccountsByUser(userId);
    const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

    const headers = [
      'Data',
      'Descrição',
      'Tipo',
      'Categoria',
      'Valor (R$)',
      'Conta / Origem',
      'Método de Pagamento',
      'Status',
      'Observação'
    ];

    const rows = transactions.map((t) => [
      sanitizeCsvValue(t.date),
      sanitizeCsvValue(t.description),
      sanitizeCsvValue(t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência'),
      sanitizeCsvValue(t.category),
      sanitizeCsvValue(t.amount.toFixed(2)),
      sanitizeCsvValue(t.accountId ? accountMap.get(t.accountId) || 'Conta' : 'Cartão de Crédito'),
      sanitizeCsvValue(t.paymentMethod),
      sanitizeCsvValue(t.status === 'completed' ? 'Concluído' : 'Pendente'),
      sanitizeCsvValue(t.observation || '')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="extrato-financeiro-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    console.error('Erro ao exportar CSV:', err);
    res.status(500).json({ error: 'Erro ao gerar arquivo CSV.' });
  }
}

/**
 * Resumo Analítico de Relatórios
 */
export async function getReportsSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const txs = store.getTransactionsByUser(userId);
    const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalCount: txs.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar relatório.' });
  }
}
