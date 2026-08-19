import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  BankAccount,
  CreditCard,
  Category,
  Transaction,
  FixedAccount,
  FinancialGoal,
  Investment,
  Budget,
  Alert
} from '../../src/types.js';

const DB_FILE = path.join(process.cwd(), 'data_store.json');

export interface DbData {
  users: (User & { passwordHash: string })[];
  accounts: BankAccount[];
  cards: CreditCard[];
  categories: Category[];
  transactions: Transaction[];
  fixedAccounts: FixedAccount[];
  goals: FinancialGoal[];
  investments: Investment[];
  budgets: Budget[];
  alerts: Alert[];
}

// Initial seed helper
function getSeedData(): DbData {
  const defaultPasswordHash = bcrypt.hashSync('senha123', 8);
  const demoUserId = 'usr_demo_1';

  const defaultUser: User & { passwordHash: string } = {
    id: demoUserId,
    name: 'Carlos Eduardo',
    email: 'usuario@exemplo.com',
    passwordHash: defaultPasswordHash,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString()
  };

  const accounts: BankAccount[] = [
    {
      id: 'acc_1',
      userId: demoUserId,
      name: 'Nubank Conta',
      bankName: 'Nubank',
      type: 'corrente',
      balance: 4850.30,
      initialBalance: 3000.00,
      color: '#820AD1',
      icon: 'Landmark',
      accountNumber: '1004829-1'
    },
    {
      id: 'acc_2',
      userId: demoUserId,
      name: 'Banco Inter',
      bankName: 'Inter',
      type: 'corrente',
      balance: 2150.00,
      initialBalance: 1500.00,
      color: '#FF7A00',
      icon: 'Building2',
      accountNumber: '883912-0'
    },
    {
      id: 'acc_3',
      userId: demoUserId,
      name: 'Reserva de Emergência (Caixa)',
      bankName: 'Caixa Econômica',
      type: 'poupanca',
      balance: 15000.00,
      initialBalance: 15000.00,
      color: '#005CA9',
      icon: 'PiggyBank',
      accountNumber: '00129384-5'
    }
  ];

  const cards: CreditCard[] = [
    {
      id: 'card_1',
      userId: demoUserId,
      name: 'Nubank Roxinho',
      bank: 'Nubank',
      limit: 8000.00,
      availableLimit: 5640.00,
      closingDay: 15,
      dueDay: 22,
      color: '#820AD1',
      brand: 'mastercard',
      lastDigits: '4928'
    },
    {
      id: 'card_2',
      userId: demoUserId,
      name: 'Inter Black',
      bank: 'Banco Inter',
      limit: 12000.00,
      availableLimit: 9800.00,
      closingDay: 5,
      dueDay: 12,
      color: '#1E293B',
      brand: 'mastercard',
      lastDigits: '8812'
    }
  ];

  const categories: Category[] = [
    { id: 'cat_1', userId: demoUserId, name: 'Mercado', type: 'despesa', color: '#22C55E', icon: 'ShoppingCart', budgetLimit: 1200 },
    { id: 'cat_2', userId: demoUserId, name: 'Combustível', type: 'despesa', color: '#F59E0B', icon: 'Fuel', budgetLimit: 600 },
    { id: 'cat_3', userId: demoUserId, name: 'Aluguel & Casa', type: 'despesa', color: '#EF4444', icon: 'Home', budgetLimit: 2200 },
    { id: 'cat_4', userId: demoUserId, name: 'Lazer & Restaurante', type: 'despesa', color: '#EC4899', icon: 'Utensils', budgetLimit: 500 },
    { id: 'cat_5', userId: demoUserId, name: 'Academia & Saúde', type: 'despesa', color: '#06B6D4', icon: 'Activity', budgetLimit: 300 },
    { id: 'cat_6', userId: demoUserId, name: 'Streaming & Tech', type: 'despesa', color: '#8B5CF6', icon: 'Tv', budgetLimit: 200 },
    { id: 'cat_7', userId: demoUserId, name: 'Salário & Renda', type: 'receita', color: '#10B981', icon: 'Briefcase' },
    { id: 'cat_8', userId: demoUserId, name: 'Freelancer', type: 'receita', color: '#3B82F6', icon: 'Code' },
    { id: 'cat_9', userId: demoUserId, name: 'Investimentos', type: 'ambos', color: '#6366F1', icon: 'TrendingUp' },
    { id: 'cat_10', userId: demoUserId, name: 'Outros', type: 'ambos', color: '#64748B', icon: 'HelpCircle' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const transactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: demoUserId,
      description: 'Salário Mensal - Tech Corp',
      amount: 8500.00,
      type: 'receita',
      paymentMethod: 'ted',
      category: 'Salário & Renda',
      accountId: 'acc_1',
      date: `${currentMonthStr}-01`,
      status: 'pago',
      observation: 'Pagamento de salário mensal referente ao mês atual.'
    },
    {
      id: 'tx_2',
      userId: demoUserId,
      description: 'Supermercado Carrefour',
      amount: 450.80,
      type: 'despesa',
      paymentMethod: 'cartao_credito',
      category: 'Mercado',
      cardId: 'card_1',
      date: `${currentMonthStr}-03`,
      status: 'pago',
      observation: 'Compras do mês'
    },
    {
      id: 'tx_3',
      userId: demoUserId,
      description: 'Aluguel do Apê',
      amount: 2200.00,
      type: 'despesa',
      paymentMethod: 'pix',
      category: 'Aluguel & Casa',
      accountId: 'acc_1',
      date: `${currentMonthStr}-05`,
      status: 'pago',
      pixKey: '098.765.432-10'
    },
    {
      id: 'tx_4',
      userId: demoUserId,
      description: 'Freelance Design de Interface',
      amount: 1800.00,
      type: 'receita',
      paymentMethod: 'pix',
      category: 'Freelancer',
      accountId: 'acc_2',
      date: `${currentMonthStr}-08`,
      status: 'pago',
      pixKey: 'contato@freelance.com'
    },
    {
      id: 'tx_5',
      userId: demoUserId,
      description: 'Posto Shell - Gasolina Aditivada',
      amount: 220.00,
      type: 'despesa',
      paymentMethod: 'cartao_credito',
      category: 'Combustível',
      cardId: 'card_1',
      date: `${currentMonthStr}-10`,
      status: 'pago'
    },
    {
      id: 'tx_6',
      userId: demoUserId,
      description: 'Assinatura Netflix Premium',
      amount: 55.90,
      type: 'despesa',
      paymentMethod: 'cartao_credito',
      category: 'Streaming & Tech',
      cardId: 'card_1',
      date: `${currentMonthStr}-12`,
      status: 'pago'
    },
    {
      id: 'tx_7',
      userId: demoUserId,
      description: 'Jantar Restaurante Outback',
      amount: 189.50,
      type: 'despesa',
      paymentMethod: 'cartao_credito',
      category: 'Lazer & Restaurante',
      cardId: 'card_2',
      date: `${currentMonthStr}-14`,
      status: 'pago'
    },
    {
      id: 'tx_8',
      userId: demoUserId,
      description: 'Notebook Dell XPS (Parcela 2/10)',
      amount: 590.00,
      type: 'despesa',
      paymentMethod: 'cartao_credito',
      category: 'Streaming & Tech',
      cardId: 'card_1',
      date: `${currentMonthStr}-15`,
      status: 'pago',
      installment: {
        totalInstallments: 10,
        currentInstallment: 2,
        installmentAmount: 590.00
      }
    },
    {
      id: 'tx_9',
      userId: demoUserId,
      description: 'Aporte CDB 110% CDI',
      amount: 1000.00,
      type: 'investimento',
      paymentMethod: 'ted',
      category: 'Investimentos',
      accountId: 'acc_1',
      date: `${currentMonthStr}-18`,
      status: 'pago'
    }
  ];

  const fixedAccounts: FixedAccount[] = [
    { id: 'fix_1', userId: demoUserId, description: 'Netflix', amount: 55.90, category: 'Streaming & Tech', accountId: 'acc_1', dueDay: 12, autoProcess: true, active: true },
    { id: 'fix_2', userId: demoUserId, description: 'Spotify Family', amount: 34.90, category: 'Streaming & Tech', accountId: 'acc_1', dueDay: 15, autoProcess: true, active: true },
    { id: 'fix_3', userId: demoUserId, description: 'Internet Fibra 500MB', amount: 129.90, category: 'Aluguel & Casa', accountId: 'acc_1', dueDay: 20, autoProcess: false, active: true },
    { id: 'fix_4', userId: demoUserId, description: 'SmartFit Academia', amount: 119.90, category: 'Academia & Saúde', accountId: 'acc_1', dueDay: 25, autoProcess: true, active: true }
  ];

  const goals: FinancialGoal[] = [
    {
      id: 'goal_1',
      userId: demoUserId,
      title: 'Comprar Carro Novo',
      targetAmount: 45000.00,
      currentAmount: 22500.00,
      deadline: '2027-12-31',
      color: '#3B82F6',
      category: 'Veículo'
    },
    {
      id: 'goal_2',
      userId: demoUserId,
      title: 'Viagem para Europa',
      targetAmount: 18000.00,
      currentAmount: 12400.00,
      deadline: '2027-06-30',
      color: '#8B5CF6',
      category: 'Viagem'
    },
    {
      id: 'goal_3',
      userId: demoUserId,
      title: 'Reserva de Emergência (6 meses)',
      targetAmount: 25000.00,
      currentAmount: 25000.00,
      deadline: '2026-10-15',
      color: '#22C55E',
      category: 'Reserva'
    }
  ];

  const investments: Investment[] = [
    {
      id: 'inv_1',
      userId: demoUserId,
      title: 'Tesouro Selic 2029',
      type: 'tesouro',
      appliedAmount: 10000.00,
      currentAmount: 11250.40,
      yieldRate: 12.5,
      broker: 'XP Investimentos',
      date: '2025-01-15',
      color: '#22C55E'
    },
    {
      id: 'inv_2',
      userId: demoUserId,
      title: 'CDB Banco Inter 110% CDI',
      type: 'cdb',
      appliedAmount: 8000.00,
      currentAmount: 8920.00,
      yieldRate: 11.5,
      broker: 'Banco Inter',
      date: '2025-03-10',
      color: '#FF7A00'
    },
    {
      id: 'inv_3',
      userId: demoUserId,
      title: 'Fundo Imobiliário HGLG11',
      type: 'fiis',
      appliedAmount: 5000.00,
      currentAmount: 5430.00,
      yieldRate: 8.6,
      broker: 'XP Investimentos',
      date: '2025-05-20',
      color: '#3B82F6'
    },
    {
      id: 'inv_4',
      userId: demoUserId,
      title: 'Bitcoin (BTC)',
      type: 'cripto',
      appliedAmount: 3000.00,
      currentAmount: 4120.00,
      yieldRate: 37.3,
      broker: 'Binance',
      date: '2025-08-01',
      color: '#F59E0B'
    }
  ];

  const budgets: Budget[] = [
    { id: 'bud_1', userId: demoUserId, category: 'Mercado', monthlyLimit: 1200, currentSpent: 450.80 },
    { id: 'bud_2', userId: demoUserId, category: 'Combustível', monthlyLimit: 600, currentSpent: 220.00 },
    { id: 'bud_3', userId: demoUserId, category: 'Aluguel & Casa', monthlyLimit: 2500, currentSpent: 2200.00 },
    { id: 'bud_4', userId: demoUserId, category: 'Lazer & Restaurante', monthlyLimit: 500, currentSpent: 189.50 },
    { id: 'bud_5', userId: demoUserId, category: 'Streaming & Tech', monthlyLimit: 800, currentSpent: 645.90 }
  ];

  const alerts: Alert[] = [
    {
      id: 'alt_1',
      title: 'Fatura Próxima do Fechamento',
      message: 'Sua fatura do cartão Nubank fecha no dia 15. Valor atual: R$ 2.360,00.',
      type: 'warning',
      createdAt: new Date().toISOString(),
      read: false
    },
    {
      id: 'alt_2',
      title: 'Meta Atingida!',
      message: 'Parabéns! Sua meta "Reserva de Emergência" foi 100% concluída!',
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    }
  ];

  return {
    users: [defaultUser],
    accounts,
    cards,
    categories,
    transactions,
    fixedAccounts,
    goals,
    investments,
    budgets,
    alerts
  };
}

class Store {
  private data: DbData;

  constructor() {
    this.data = this.load();
  }

  private load(): DbData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Error reading JSON store, initializing fresh seed:', e);
    }
    const seed = getSeedData();
    this.save(seed);
    return seed;
  }

  private save(data?: DbData) {
    if (data) {
      this.data = data;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing JSON store:', e);
    }
  }

  public getData(): DbData {
    return this.data;
  }

  public updateData(updater: (data: DbData) => void) {
    updater(this.data);
    this.save();
  }

  public resetToSeed() {
    this.data = getSeedData();
    this.save();
  }
}

export const dbStore = new Store();
