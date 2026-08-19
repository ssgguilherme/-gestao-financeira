import {
  User,
  UpdateUserProfilePayload,
  BankAccount,
  CreditCard,
  Transaction,
  Category,
  FixedAccount,
  FinancialGoal,
  Investment,
  Budget,
  DashboardMetrics
} from '../types.js';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('gestao_fin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Erro de conexão com o servidor.' }));
    throw new Error(errorData.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  register: async (data: { name: string; email: string; password: string; avatarUrl?: string }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ user: User; token: string }>(res);
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse<User>(res);
  },

  updateProfile: async (data: UpdateUserProfilePayload) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<User>(res);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse<{ message: string }>(res);
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{
      metrics: DashboardMetrics;
      categoryChart: { category: string; amount: number; color: string }[];
      monthlyHistory: { month: string; monthKey: string; receitas: number; despesas: number; saldo: number }[];
      dailyHistory?: { label: string; dayNumber: number; date: string; receitas: number; despesas: number; saldo: number }[];
      cardSpending: { cardName: string; bank: string; spent: number; limit: number; available: number; color: string }[];
      heatmapData: { date: string; dayNumber: number; amount: number; income?: number; saldo?: number; transactionsCount?: number; transactions?: Transaction[] }[];
      upcomingDues: { id: string; title: string; amount: number; dueDate: string; type: string; category: string }[];
      recentTransactions: Transaction[];
      alerts: { id: string; title: string; message: string; type: 'danger' | 'warning' | 'info' | 'success'; createdAt: string; read: boolean }[];
    }>(res);
  },

  // Bank Accounts
  getAccounts: async () => {
    const res = await fetch(`${API_BASE}/accounts`, { headers: getAuthHeaders() });
    return handleResponse<BankAccount[]>(res);
  },

  createAccount: async (data: Partial<BankAccount>) => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<BankAccount>(res);
  },

  updateAccount: async (id: string, data: Partial<BankAccount>) => {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<BankAccount>(res);
  },

  deleteAccount: async (id: string) => {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Credit Cards
  getCards: async () => {
    const res = await fetch(`${API_BASE}/cards`, { headers: getAuthHeaders() });
    return handleResponse<CreditCard[]>(res);
  },

  createCard: async (data: Partial<CreditCard>) => {
    const res = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<CreditCard>(res);
  },

  updateCard: async (id: string, data: Partial<CreditCard>) => {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<CreditCard>(res);
  },

  deleteCard: async (id: string) => {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  payCardBill: async (cardId: string, accountId: string, amount: number) => {
    const res = await fetch(`${API_BASE}/cards/${cardId}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accountId, amount })
    });
    return handleResponse<{ message: string }>(res);
  },

  // Transactions
  getTransactions: async (filters?: Record<string, string>) => {
    const query = new URLSearchParams(filters || {}).toString();
    const url = `${API_BASE}/transactions${query ? `?${query}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<Transaction[]>(res);
  },

  createTransaction: async (data: Partial<Transaction> & { installmentsCount?: number }) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Transaction>(res);
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Transaction>(res);
  },

  updateTransactionStatus: async (id: string, status: 'pago' | 'pendente' | 'cancelado') => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<Transaction>(res);
  },

  deleteTransaction: async (id: string) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  sendPixTransfer: async (data: { amount: number; description: string; pixKey: string; accountId: string }) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        description: data.description || `PIX para ${data.pixKey}`,
        amount: data.amount,
        type: 'despesa',
        paymentMethod: 'pix',
        category: 'Transferência PIX',
        accountId: data.accountId,
        pixKey: data.pixKey,
        status: 'pago',
        date: new Date().toISOString().split('T')[0]
      })
    });
    return handleResponse<Transaction>(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
    return handleResponse<Category[]>(res);
  },

  createCategory: async (data: Partial<Category>) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Category>(res);
  },

  // Fixed Accounts
  getFixedAccounts: async () => {
    const res = await fetch(`${API_BASE}/fixed-accounts`, { headers: getAuthHeaders() });
    return handleResponse<FixedAccount[]>(res);
  },

  createFixedAccount: async (data: Partial<FixedAccount>) => {
    const res = await fetch(`${API_BASE}/fixed-accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<FixedAccount>(res);
  },

  deleteFixedAccount: async (id: string) => {
    const res = await fetch(`${API_BASE}/fixed-accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  processFixedAccounts: async () => {
    const res = await fetch(`${API_BASE}/fixed-accounts/process`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string; processedCount: number }>(res);
  },

  // Goals
  getGoals: async () => {
    const res = await fetch(`${API_BASE}/goals`, { headers: getAuthHeaders() });
    return handleResponse<FinancialGoal[]>(res);
  },

  createGoal: async (data: Partial<FinancialGoal>) => {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<FinancialGoal>(res);
  },

  depositGoal: async (id: string, amount: number, action: 'add' | 'subtract' = 'add') => {
    const res = await fetch(`${API_BASE}/goals/${id}/deposit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, action })
    });
    return handleResponse<FinancialGoal>(res);
  },

  deleteGoal: async (id: string) => {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Investments
  getInvestments: async () => {
    const res = await fetch(`${API_BASE}/investments`, { headers: getAuthHeaders() });
    return handleResponse<Investment[]>(res);
  },

  createInvestment: async (data: Partial<Investment>) => {
    const res = await fetch(`${API_BASE}/investments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Investment>(res);
  },

  deleteInvestment: async (id: string) => {
    const res = await fetch(`${API_BASE}/investments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${API_BASE}/budgets`, { headers: getAuthHeaders() });
    return handleResponse<Budget[]>(res);
  },

  setBudget: async (category: string, monthlyLimit: number) => {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ category, monthlyLimit })
    });
    return handleResponse<Budget>(res);
  },

  // Import / Export / Backup
  importTransactions: async (transactions: Partial<Transaction>[]) => {
    const res = await fetch(`${API_BASE}/reports/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transactions })
    });
    return handleResponse<{ message: string; importedCount: number }>(res);
  },

  restoreBackup: async (jsonString: string) => {
    const parsed = JSON.parse(jsonString);
    const res = await fetch(`${API_BASE}/reports/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transactions: parsed.transactions || [] })
    });
    return handleResponse<{ message: string }>(res);
  }
};
