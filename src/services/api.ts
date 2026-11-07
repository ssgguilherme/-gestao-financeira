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

const TOKEN_KEY = 'gestao_fin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

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
    return request<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
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
    return request<{ transaction: Transaction; message: string }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
  },

  async deleteTransaction(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  // --- ACCOUNTS & CARDS ---
  async getAccounts(): Promise<{ accounts: BankAccount[] }> {
    return request<{ accounts: BankAccount[] }>('/api/accounts');
  },

  async createAccount(acc: Partial<BankAccount>): Promise<{ account: BankAccount; message: string }> {
    return request<{ account: BankAccount; message: string }>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(acc)
    });
  },

  async getCards(): Promise<{ cards: CreditCard[] }> {
    return request<{ cards: CreditCard[] }>('/api/cards');
  },

  async createCard(card: Partial<CreditCard>): Promise<{ card: CreditCard; message: string }> {
    return request<{ card: CreditCard; message: string }>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(card)
    });
  },

  // --- INVESTMENTS ---
  async getInvestments(): Promise<{ investments: Investment[] }> {
    return request<{ investments: Investment[] }>('/api/investments');
  },

  async createInvestment(inv: Partial<Investment>): Promise<{ investment: Investment; message: string }> {
    return request<{ investment: Investment; message: string }>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(inv)
    });
  },

  // --- GOALS & BUDGETS ---
  async getGoals(): Promise<{ goals: Goal[] }> {
    return request<{ goals: Goal[] }>('/api/goals');
  },

  async createGoal(goal: Partial<Goal>): Promise<{ goal: Goal; message: string }> {
    return request<{ goal: Goal; message: string }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  },

  async depositGoal(id: string, amount: number): Promise<{ goal: Goal; message: string }> {
    return request<{ goal: Goal; message: string }>(`/api/goals/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  },

  async getBudgets(): Promise<{ budgets: Budget[] }> {
    return request<{ budgets: Budget[] }>('/api/budgets');
  },

  async createBudget(categoryName: string, limit: number): Promise<{ budget: Budget; message: string }> {
    return request<{ budget: Budget; message: string }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ categoryName, limit })
    });
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
