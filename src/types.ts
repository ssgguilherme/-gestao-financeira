export type AccountType = 'corrente' | 'poupanca' | 'pagamentos' | 'investimentos' | 'outros';

export type CardBrand = 'mastercard' | 'visa' | 'elo' | 'amex' | 'outros';

export type TransactionType = 'receita' | 'despesa' | 'transferencia' | 'investimento';

export type PaymentMethod = 'pix' | 'ted' | 'doc' | 'dinheiro' | 'cartao_debito' | 'cartao_credito';

export type TransactionStatus = 'pago' | 'pendente' | 'cancelado';

export type InvestmentType = 'tesouro' | 'cdb' | 'lci' | 'lca' | 'fundos' | 'acoes' | 'fiis' | 'cripto';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  companyDocument?: string;
  businessType?: 'pf' | 'pj' | 'mei' | 'autonomo' | string;
  occupation?: string;
  phone?: string;
  cityState?: string;
  address?: string;
  monthlyRevenueTarget?: number;
  financialNotes?: string;
  createdAt: string;
}

export type UpdateUserProfilePayload = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  companyName?: string;
  companyDocument?: string;
  businessType?: string;
  occupation?: string;
  phone?: string;
  cityState?: string;
  address?: string;
  monthlyRevenueTarget?: number;
  financialNotes?: string;
};

export interface BankAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  color: string;
  icon: string;
  accountNumber?: string;
  bankName: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  bank: string;
  limit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  brand: CardBrand;
  lastDigits?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  color: string;
  icon: string;
  budgetLimit?: number;
}

export interface InstallmentInfo {
  totalInstallments: number;
  currentInstallment: number;
  installmentAmount: number;
  parentTransactionId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  category: string; // Category name or ID
  accountId?: string;
  cardId?: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  observation?: string;
  attachmentUrl?: string;
  installment?: InstallmentInfo;
  pixKey?: string;
}

export interface FixedAccount {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  accountId: string;
  dueDay: number;
  autoProcess: boolean;
  active: boolean;
  lastProcessedMonth?: string; // YYYY-MM
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  color: string;
  category?: string;
}

export interface Investment {
  id: string;
  userId: string;
  title: string;
  type: InvestmentType;
  appliedAmount: number;
  currentAmount: number;
  yieldRate: number; // percentage e.g. 10.5
  broker: string;
  date: string; // YYYY-MM-DD
  color: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
}

export type BudgetCategory = Budget;

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  createdAt: string;
  read: boolean;
}

export interface DashboardMetrics {
  totalBalance: number;
  monthIncome: number;
  monthExpenses: number;
  currentCardBill: number;
  totalInvested: number;
  projectedExpenses: number;
  projectedBalance: number;
  monthSavings: number;
  savingsPercentage: number;
  activeCardsCount: number;
  activeAccountsCount: number;
}
