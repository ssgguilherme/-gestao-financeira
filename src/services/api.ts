import {
  User,
  BankAccount,
  CreditCard,
  Transaction,
  Investment,
  Goal,
  Budget,
  PixKey,
  DashboardData
} from '../types/finance';

import { offlineSync } from './offlineSync';

const TOKEN_KEY = 'gestao_fin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  offlineSync.clearAllSnapshots();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  offlineFallback?: {
    description: string;
    createOptimisticResponse: () => T;
    onApplyToSnapshot?: () => void;
  }
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Se for GET: Tenta rede primeiro, se offline serve snapshot local
  if (method === 'GET') {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      if (!response.ok) {
        const snapshot = offlineSync.getSnapshot<T>(endpoint);
        if (snapshot) {
          return snapshot;
        }
        let errorMsg = `Erro na requisição: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      offlineSync.saveSnapshot(endpoint, data);
      return data;
    } catch (err: any) {
      const snapshot = offlineSync.getSnapshot<T>(endpoint);
      if (snapshot) {
        console.log(`[API] Sem conexão. Carregando dados financeiros locais para: ${endpoint}`);
        return snapshot;
      }
      throw err;
    }
  }

  // Se for POST / PUT / DELETE:
  // Se o navegador já souber que está offline, enfileira diretamente
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  if (isOffline && offlineFallback) {
    let parsedBody: any = undefined;
    if (typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch {
        parsedBody = options.body;
      }
    }

    offlineSync.enqueue({
      endpoint,
      method: method as 'POST' | 'PUT' | 'DELETE',
      body: parsedBody,
      description: offlineFallback.description
    });

    if (offlineFallback.onApplyToSnapshot) {
      offlineFallback.onApplyToSnapshot();
    }

    return offlineFallback.createOptimisticResponse();
  }

  // Caso esteja online, tenta disparar para o servidor
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMsg = `Erro na requisição: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (err: any) {
    // Se a requisição falhou por perda repentina de internet (NetworkError / Failed to fetch)
    if (offlineFallback && (err.name === 'TypeError' || err.message?.includes('fetch') || !navigator.onLine)) {
      console.warn(`[API] Conexão falhou durante envio. Salvando alteração na fila offline: ${offlineFallback.description}`);

      let parsedBody: any = undefined;
      if (typeof options.body === 'string') {
        try {
          parsedBody = JSON.parse(options.body);
        } catch {
          parsedBody = options.body;
        }
      }

      offlineSync.enqueue({
        endpoint,
        method: method as 'POST' | 'PUT' | 'DELETE',
        body: parsedBody,
        description: offlineFallback.description
      });

      if (offlineFallback.onApplyToSnapshot) {
        offlineFallback.onApplyToSnapshot();
      }

      return offlineFallback.createOptimisticResponse();
    }
    throw err;
  }
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const data = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const data = await request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setStoredToken(data.token);
    return data;
  },

  async loginDemo(): Promise<{ token: string; user: User; message: string }> {
    const data = await request<{ token: string; user: User; message: string }>('/api/auth/demo', {
      method: 'POST'
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(payload: { name?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>(
      '/api/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      },
      {
        description: 'Atualização de perfil / senha',
        createOptimisticResponse: () => ({
          user: {
            id: 'current',
            name: payload.name || '',
            email: '',
            avatarUrl: payload.avatarUrl,
            createdAt: new Date().toISOString()
          },
          message: 'Alterações salvas localmente no dispositivo. Serão sincronizadas ao reconectar.'
        })
      }
    );
  },

  // --- DASHBOARD ---
  async getDashboard(): Promise<DashboardData> {
    return request<DashboardData>('/api/dashboard');
  },

  // --- TRANSACTIONS ---
  async getTransactions(params?: {
    type?: string;
    category?: string;
    accountId?: string;
    cardId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    const qStr = query.toString();
    return request<{ transactions: Transaction[]; total: number }>(`/api/transactions${qStr ? `?${qStr}` : ''}`);
  },

  async createTransaction(txData: Partial<Transaction>): Promise<{ transaction: Transaction; message: string }> {
    const desc = `Novo lançamento: ${txData.description || 'Transação'}`;
    return request<{ transaction: Transaction; message: string }>(
      '/api/transactions',
      {
        method: 'POST',
        body: JSON.stringify(txData)
      },
      {
        description: desc,
        createOptimisticResponse: () => {
          const fakeTx: Transaction = {
            id: `tx_offline_${Date.now()}`,
            userId: 'current',
            description: txData.description || 'Transação Offline',
            amount: Number(txData.amount) || 0,
            type: txData.type || 'expense',
            category: txData.category || 'Geral',
            date: txData.date || new Date().toISOString(),
            paymentMethod: txData.paymentMethod || 'debit',
            status: 'completed',
            accountId: txData.accountId,
            cardId: txData.cardId,
            createdAt: new Date().toISOString()
          };
          return {
            transaction: fakeTx,
            message: 'Lançamento salvo localmente no dispositivo! Será sincronizado quando a conexão retornar.'
          };
        },
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ transactions: Transaction[]; total: number }>('/api/transactions');
          if (cached) {
            const fakeTx: Transaction = {
              id: `tx_offline_${Date.now()}`,
              userId: 'current',
              description: txData.description || 'Transação Offline',
              amount: Number(txData.amount) || 0,
              type: txData.type || 'expense',
              category: txData.category || 'Geral',
              date: txData.date || new Date().toISOString(),
              paymentMethod: txData.paymentMethod || 'debit',
              status: 'completed',
              accountId: txData.accountId,
              cardId: txData.cardId,
              createdAt: new Date().toISOString()
            };
            offlineSync.saveSnapshot('/api/transactions', {
              transactions: [fakeTx, ...cached.transactions],
              total: (cached.total || 0) + 1
            });
          }
        }
      }
    );
  },

  async deleteTransaction(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `/api/transactions/${id}`,
      {
        method: 'DELETE'
      },
      {
        description: `Exclusão de transação`,
        createOptimisticResponse: () => ({
          message: 'Exclusão registrada localmente. Será sincronizada assim que a internet voltar.'
        }),
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ transactions: Transaction[]; total: number }>('/api/transactions');
          if (cached) {
            offlineSync.saveSnapshot('/api/transactions', {
              transactions: cached.transactions.filter((t) => t.id !== id),
              total: Math.max(0, (cached.total || 1) - 1)
            });
          }
        }
      }
    );
  },

  // --- ACCOUNTS & CARDS ---
  async getAccounts(): Promise<{ accounts: BankAccount[] }> {
    return request<{ accounts: BankAccount[] }>('/api/accounts');
  },

  async createAccount(acc: Partial<BankAccount>): Promise<{ account: BankAccount; message: string }> {
    return request<{ account: BankAccount; message: string }>(
      '/api/accounts',
      {
        method: 'POST',
        body: JSON.stringify(acc)
      },
      {
        description: `Nova conta: ${acc.name || 'Conta bancária'}`,
        createOptimisticResponse: () => {
          const fakeAcc: BankAccount = {
            id: `acc_offline_${Date.now()}`,
            userId: 'current',
            name: acc.name || 'Nova Conta',
            type: acc.type || 'checking',
            balance: Number(acc.balance) || 0,
            color: acc.color || '#10b981',
            bank: acc.bank || 'Outro',
            icon: acc.icon || 'wallet',
            createdAt: new Date().toISOString()
          };
          return {
            account: fakeAcc,
            message: 'Conta cadastrada no dispositivo. Será sincronizada com o servidor.'
          };
        },
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ accounts: BankAccount[] }>('/api/accounts');
          if (cached) {
            const fakeAcc: BankAccount = {
              id: `acc_offline_${Date.now()}`,
              userId: 'current',
              name: acc.name || 'Nova Conta',
              type: acc.type || 'checking',
              balance: Number(acc.balance) || 0,
              color: acc.color || '#10b981',
              bank: acc.bank || 'Outro',
              icon: acc.icon || 'wallet',
              createdAt: new Date().toISOString()
            };
            offlineSync.saveSnapshot('/api/accounts', {
              accounts: [...cached.accounts, fakeAcc]
            });
          }
        }
      }
    );
  },

  async getCards(): Promise<{ cards: CreditCard[] }> {
    return request<{ cards: CreditCard[] }>('/api/cards');
  },

  async createCard(card: Partial<CreditCard>): Promise<{ card: CreditCard; message: string }> {
    return request<{ card: CreditCard; message: string }>(
      '/api/cards',
      {
        method: 'POST',
        body: JSON.stringify(card)
      },
      {
        description: `Novo cartão: ${card.name || 'Cartão de crédito'}`,
        createOptimisticResponse: () => {
          const fakeCard: CreditCard = {
            id: `card_offline_${Date.now()}`,
            userId: 'current',
            name: card.name || 'Novo Cartão',
            last4: card.last4 || '1234',
            brand: (card.brand as any) || 'mastercard',
            limit: Number(card.limit) || 0,
            availableLimit: Number(card.limit) || 0,
            closingDay: card.closingDay || 1,
            dueDay: card.dueDay || 10,
            color: card.color || '#6366f1',
            createdAt: new Date().toISOString()
          };
          return {
            card: fakeCard,
            message: 'Cartão salvo localmente no dispositivo.'
          };
        },
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ cards: CreditCard[] }>('/api/cards');
          if (cached) {
            const fakeCard: CreditCard = {
              id: `card_offline_${Date.now()}`,
              userId: 'current',
              name: card.name || 'Novo Cartão',
              last4: card.last4 || '1234',
              brand: (card.brand as any) || 'mastercard',
              limit: Number(card.limit) || 0,
              availableLimit: Number(card.limit) || 0,
              closingDay: card.closingDay || 1,
              dueDay: card.dueDay || 10,
              color: card.color || '#6366f1',
              createdAt: new Date().toISOString()
            };
            offlineSync.saveSnapshot('/api/cards', {
              cards: [...cached.cards, fakeCard]
            });
          }
        }
      }
    );
  },

  // --- INVESTMENTS ---
  async getInvestments(): Promise<{ investments: Investment[] }> {
    return request<{ investments: Investment[] }>('/api/investments');
  },

  async createInvestment(inv: Partial<Investment>): Promise<{ investment: Investment; message: string }> {
    return request<{ investment: Investment; message: string }>(
      '/api/investments',
      {
        method: 'POST',
        body: JSON.stringify(inv)
      },
      {
        description: `Novo investimento: ${inv.name || 'Aporte'}`,
        createOptimisticResponse: () => {
          const fakeInv: Investment = {
            id: `inv_offline_${Date.now()}`,
            userId: 'current',
            name: inv.name || 'Novo Investimento',
            type: (inv.type as any) || 'cdb',
            amountInvested: Number(inv.amountInvested) || 0,
            currentValue: Number(inv.currentValue) || Number(inv.amountInvested) || 0,
            profitability: inv.profitability || 0,
            dueDate: inv.dueDate,
            createdAt: new Date().toISOString()
          };
          return {
            investment: fakeInv,
            message: 'Investimento registrado localmente no dispositivo.'
          };
        },
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ investments: Investment[] }>('/api/investments');
          if (cached) {
            const fakeInv: Investment = {
              id: `inv_offline_${Date.now()}`,
              userId: 'current',
              name: inv.name || 'Novo Investimento',
              type: (inv.type as any) || 'cdb',
              amountInvested: Number(inv.amountInvested) || 0,
              currentValue: Number(inv.currentValue) || Number(inv.amountInvested) || 0,
              profitability: inv.profitability || 0,
              dueDate: inv.dueDate,
              createdAt: new Date().toISOString()
            };
            offlineSync.saveSnapshot('/api/investments', {
              investments: [...cached.investments, fakeInv]
            });
          }
        }
      }
    );
  },

  // --- GOALS & BUDGETS ---
  async getGoals(): Promise<{ goals: Goal[] }> {
    return request<{ goals: Goal[] }>('/api/goals');
  },

  async createGoal(goal: Partial<Goal>): Promise<{ goal: Goal; message: string }> {
    return request<{ goal: Goal; message: string }>(
      '/api/goals',
      {
        method: 'POST',
        body: JSON.stringify(goal)
      },
      {
        description: `Nova meta: ${goal.title || 'Objetivo'}`,
        createOptimisticResponse: () => {
          const fakeGoal: Goal = {
            id: `goal_offline_${Date.now()}`,
            userId: 'current',
            title: goal.title || 'Meta',
            targetAmount: Number(goal.targetAmount) || 1000,
            currentAmount: Number(goal.currentAmount) || 0,
            deadline: goal.deadline || new Date().toISOString(),
            color: goal.color || '#10b981',
            icon: goal.icon || 'target',
            createdAt: new Date().toISOString()
          };
          return {
            goal: fakeGoal,
            message: 'Meta salva no dispositivo.'
          };
        },
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ goals: Goal[] }>('/api/goals');
          if (cached) {
            const fakeGoal: Goal = {
              id: `goal_offline_${Date.now()}`,
              userId: 'current',
              title: goal.title || 'Meta',
              targetAmount: Number(goal.targetAmount) || 1000,
              currentAmount: Number(goal.currentAmount) || 0,
              deadline: goal.deadline || new Date().toISOString(),
              color: goal.color || '#10b981',
              icon: goal.icon || 'target',
              createdAt: new Date().toISOString()
            };
            offlineSync.saveSnapshot('/api/goals', {
              goals: [...cached.goals, fakeGoal]
            });
          }
        }
      }
    );
  },

  async depositGoal(id: string, amount: number): Promise<{ goal: Goal; message: string }> {
    return request<{ goal: Goal; message: string }>(
      `/api/goals/${id}/deposit`,
      {
        method: 'POST',
        body: JSON.stringify({ amount })
      },
      {
        description: `Aporte em meta: +R$ ${amount}`,
        createOptimisticResponse: () => {
          const cached = offlineSync.getSnapshot<{ goals: Goal[] }>('/api/goals');
          const existing = cached?.goals.find((g) => g.id === id);
          const updated: Goal = existing
            ? { ...existing, currentAmount: existing.currentAmount + amount }
            : {
                id,
                userId: 'current',
                title: 'Meta',
                targetAmount: 1000,
                currentAmount: amount,
                deadline: new Date().toISOString(),
                color: '#10b981',
                icon: 'target',
                createdAt: new Date().toISOString()
              };
          return {
            goal: updated,
            message: 'Depósito registrado localmente.'
          };
        },
        onApplyToSnapshot: () => {
          const cached = offlineSync.getSnapshot<{ goals: Goal[] }>('/api/goals');
          if (cached) {
            offlineSync.saveSnapshot('/api/goals', {
              goals: cached.goals.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))
            });
          }
        }
      }
    );
  },

  async getBudgets(): Promise<{ budgets: Budget[] }> {
    return request<{ budgets: Budget[] }>('/api/budgets');
  },

  async createBudget(categoryName: string, limit: number): Promise<{ budget: Budget; message: string }> {
    return request<{ budget: Budget; message: string }>(
      '/api/budgets',
      {
        method: 'POST',
        body: JSON.stringify({ categoryName, limit })
      },
      {
        description: `Orçamento para ${categoryName}: R$ ${limit}`,
        createOptimisticResponse: () => {
          const fakeBudget: Budget = {
            id: `bud_offline_${Date.now()}`,
            userId: 'current',
            categoryId: 'cat_gen',
            categoryName,
            limit: Number(limit) || 0,
            spent: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          };
          return {
            budget: fakeBudget,
            message: 'Orçamento salvo localmente.'
          };
        }
      }
    );
  },

  // --- PIX ---
  async getPixKeys(): Promise<{ pixKeys: PixKey[] }> {
    return request<{ pixKeys: PixKey[] }>('/api/pix/keys');
  },

  async createPixKey(key: string, type: string, accountId?: string): Promise<{ pixKey: PixKey; message: string }> {
    return request<{ pixKey: PixKey; message: string }>('/api/pix/keys', {
      method: 'POST',
      body: JSON.stringify({ key, type, accountId })
    });
  },

  async transferPix(targetKey: string, amount: number, accountId: string, description?: string): Promise<{ message: string; receipt: any; newBalance: number }> {
    return request<{ message: string; receipt: any; newBalance: number }>('/api/pix/transfer', {
      method: 'POST',
      body: JSON.stringify({ targetKey, amount, accountId, description })
    });
  },

  // --- RELATÓRIOS, BACKUP & RESTAURAÇÃO (OWASP A01 & A03) ---
  async downloadBackupJson(): Promise<Blob> {
    const token = getStoredToken();
    const res = await fetch('/api/reports/backup', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Falha ao exportar backup.');
    return res.blob();
  },

  /**
   * Restauração de Backup Seguro Tenant-Scoped
   * CORREÇÃO: Dispara POST para /api/reports/restore enviando o payload completo
   */
  async restoreBackup(backupData: any): Promise<{ message: string }> {
    return request<{ message: string }>('/api/reports/restore', {
      method: 'POST',
      body: JSON.stringify(backupData)
    });
  },

  async downloadCsv(): Promise<Blob> {
    const token = getStoredToken();
    const res = await fetch('/api/reports/export/csv', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Falha ao baixar CSV.');
    return res.blob();
  },

  async getReportsSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number; totalCount: number }> {
    return request<{ totalIncome: number; totalExpense: number; balance: number; totalCount: number }>('/api/reports/summary');
  }
};
