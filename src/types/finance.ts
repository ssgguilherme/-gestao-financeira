export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'wallet';
  balance: number;
  color: string;
  bank: string;
  icon?: string;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  last4: string;
  brand: 'mastercard' | 'visa' | 'elo' | 'amex';
  limit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId?: string;
  cardId?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
  paymentMethod: 'pix' | 'debit' | 'credit' | 'transfer' | 'cash' | 'boleto';
  status: 'completed' | 'pending';
  observation?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: 'cdb' | 'lci_lca' | 'tesouro' | 'stocks' | 'fii' | 'crypto';
  amountInvested: number;
  currentValue: number;
  profitability: number;
  dueDate?: string;
  createdAt: string;
}

export interface PixKey {
  id: string;
  userId: string;
  key: string;
  type: 'cpf' | 'email' | 'phone' | 'random';
  accountId: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  totalCreditLimit: number;
  availableCreditLimit: number;
  usedCreditLimit: number;
  totalInvested: number;
  currentInvestmentsValue: number;
  investmentProfitability: number;
  accountsCount: number;
  cardsCount: number;
  transactionsCount: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentTransactions: Transaction[];
  expensesByCategory: Array<{ category: string; amount: number }>;
  monthlyFlow: Array<{ month: string; income: number; expense: number }>;
  alerts: Array<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'success' }>;
  goalsSummary: Goal[];
}

export type ViewTab =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'investments'
  | 'goals'
  | 'pix'
  | 'reports'
  | 'profile';
