import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  accounts: BankAccount[];
  cards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
  pixKeys: PixKey[];
  notifications: UserNotification[];
}

const DB_FILE = path.join(process.cwd(), 'data_store.json');
const BACKUP_FILE = path.join(process.cwd(), 'data_store.backup.json');

export const DEMO_USER_ID = 'usr_demo_1';
export const DEMO_EMAIL = 'demo@finanflow.com';
export const DEMO_SECONDARY_EMAIL = 'usuario@exemplo.com';

function getSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const demoHash = bcrypt.hashSync('demo123', salt);

  const defaultCategories: Category[] = [
    { id: 'cat_salario', userId: DEMO_USER_ID, name: 'Salário & Renda', type: 'income', color: '#10b981', icon: 'Briefcase' },
    { id: 'cat_invest', userId: DEMO_USER_ID, name: 'Rendimentos', type: 'income', color: '#06b6d4', icon: 'TrendingUp' },
    { id: 'cat_extra', userId: DEMO_USER_ID, name: 'Freelance & Extras', type: 'income', color: '#8b5cf6', icon: 'Zap' },
    { id: 'cat_moradia', userId: DEMO_USER_ID, name: 'Moradia & Contas', type: 'expense', color: '#f59e0b', icon: 'Home' },
    { id: 'cat_alimentacao', userId: DEMO_USER_ID, name: 'Alimentação & Supermercado', type: 'expense', color: '#ef4444', icon: 'Utensils' },
    { id: 'cat_transporte', userId: DEMO_USER_ID, name: 'Transporte & Combustível', type: 'expense', color: '#3b82f6', icon: 'Car' },
    { id: 'cat_saude', userId: DEMO_USER_ID, name: 'Saúde & Farmácia', type: 'expense', color: '#ec4899', icon: 'Heart' },
    { id: 'cat_lazer', userId: DEMO_USER_ID, name: 'Lazer & Viagens', type: 'expense', color: '#a855f7', icon: 'Smile' },
    { id: 'cat_educacao', userId: DEMO_USER_ID, name: 'Educação & Cursos', type: 'expense', color: '#14b8a6', icon: 'GraduationCap' },
    { id: 'cat_compras', userId: DEMO_USER_ID, name: 'Compras & Assinaturas', type: 'expense', color: '#f97316', icon: 'ShoppingBag' }
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const todayStr = now.toISOString().split('T')[0];

  return {
    users: [
      {
        id: DEMO_USER_ID,
        name: 'Usuário Demonstração',
        email: DEMO_EMAIL,
        passwordHash: demoHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    accounts: [
      {
        id: 'acc_nubank',
        userId: DEMO_USER_ID,
        name: 'Nubank Conta Digital',
        type: 'checking',
        balance: 4850.75,
        color: '#820ad1',
        bank: 'Nubank',
        icon: 'CreditCard',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'acc_itau',
        userId: DEMO_USER_ID,
        name: 'Itaú Unibanco',
        type: 'checking',
        balance: 12430.50,
        color: '#ec7000',
        bank: 'Itaú',
        icon: 'Building2',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'acc_wallet',
        userId: DEMO_USER_ID,
        name: 'Carteira Física',
        type: 'wallet',
        balance: 380.00,
        color: '#10b981',
        bank: 'Dinheiro',
        icon: 'Wallet',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    cards: [
      {
        id: 'crd_nubank',
        userId: DEMO_USER_ID,
        name: 'Nubank Ultravioleta',
        last4: '8842',
        brand: 'mastercard',
        limit: 15000.00,
        availableLimit: 11840.30,
        closingDay: 5,
        dueDay: 12,
        color: '#5b108e',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'crd_inter',
        userId: DEMO_USER_ID,
        name: 'Inter Black Mastercard',
        last4: '1094',
        brand: 'mastercard',
        limit: 22000.00,
        availableLimit: 19540.00,
        closingDay: 18,
        dueDay: 25,
        color: '#ff7a00',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    transactions: [
      {
        id: 'tx_1',
        userId: DEMO_USER_ID,
        accountId: 'acc_itau',
        description: 'Salário Mensal Tech Lead',
        amount: 14500.00,
        type: 'income',
        category: 'Salário & Renda',
        date: todayStr,
        paymentMethod: 'transfer',
        status: 'completed',
        observation: 'Depósito em conta corrente referente ao mês vigente',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_2',
        userId: DEMO_USER_ID,
        accountId: 'acc_nubank',
        description: 'Supermercado Pão de Açúcar',
        amount: 845.60,
        type: 'expense',
        category: 'Alimentação & Supermercado',
        date: todayStr,
        paymentMethod: 'debit',
        status: 'completed',
        observation: 'Compras do mês da despensa',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_3',
        userId: DEMO_USER_ID,
        cardId: 'crd_nubank',
        description: 'Posto Shell Combustível',
        amount: 280.00,
        type: 'expense',
        category: 'Transporte & Combustível',
        date: todayStr,
        paymentMethod: 'credit',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_4',
        userId: DEMO_USER_ID,
        accountId: 'acc_itau',
        description: 'Aluguel do Apartamento',
        amount: 3200.00,
        type: 'expense',
        category: 'Moradia & Contas',
        date: todayStr,
        paymentMethod: 'pix',
        status: 'completed',
        observation: 'Comprovante PIX enviado ao proprietário',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_5',
        userId: DEMO_USER_ID,
        cardId: 'crd_nubank',
        description: 'Assinatura Netflix & Spotify',
        amount: 94.80,
        type: 'expense',
        category: 'Compras & Assinaturas',
        date: todayStr,
        paymentMethod: 'credit',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_6',
        userId: DEMO_USER_ID,
        accountId: 'acc_nubank',
        description: 'Rendimento CDB 110% CDI',
        amount: 215.40,
        type: 'income',
        category: 'Rendimentos',
        date: todayStr,
        paymentMethod: 'transfer',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_7',
        userId: DEMO_USER_ID,
        accountId: 'acc_itau',
        description: 'Jantar Restaurante Fogo de Chão',
        amount: 420.00,
        type: 'expense',
        category: 'Lazer & Viagens',
        date: todayStr,
        paymentMethod: 'pix',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_8',
        userId: DEMO_USER_ID,
        accountId: 'acc_itau',
        description: 'Consultoria Externa Software',
        amount: 2800.00,
        type: 'income',
        category: 'Freelance & Extras',
        date: todayStr,
        paymentMethod: 'pix',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx_9',
        userId: DEMO_USER_ID,
        cardId: 'crd_inter',
        description: 'Farmácia Drogasil Medicamentos',
        amount: 154.30,
        type: 'expense',
        category: 'Saúde & Farmácia',
        date: todayStr,
        paymentMethod: 'credit',
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    ],
    categories: defaultCategories,
    budgets: [
      {
        id: 'bdg_alimentacao',
        userId: DEMO_USER_ID,
        categoryId: 'cat_alimentacao',
        categoryName: 'Alimentação & Supermercado',
        limit: 1500.00,
        spent: 845.60,
        month: currentMonth,
        year: currentYear
      },
      {
        id: 'bdg_moradia',
        userId: DEMO_USER_ID,
        categoryId: 'cat_moradia',
        categoryName: 'Moradia & Contas',
        limit: 4000.00,
        spent: 3200.00,
        month: currentMonth,
        year: currentYear
      },
      {
        id: 'bdg_lazer',
        userId: DEMO_USER_ID,
        categoryId: 'cat_lazer',
        categoryName: 'Lazer & Viagens',
        limit: 1000.00,
        spent: 420.00,
        month: currentMonth,
        year: currentYear
      },
      {
        id: 'bdg_transporte',
        userId: DEMO_USER_ID,
        categoryId: 'cat_transporte',
        categoryName: 'Transporte & Combustível',
        limit: 600.00,
        spent: 280.00,
        month: currentMonth,
        year: currentYear
      }
    ],
    goals: [
      {
        id: 'goal_reserva',
        userId: DEMO_USER_ID,
        title: 'Reserva de Emergência 6 Meses',
        targetAmount: 50000.00,
        currentAmount: 35000.00,
        deadline: '2026-12-31',
        color: '#10b981',
        icon: 'ShieldCheck',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'goal_viagem',
        userId: DEMO_USER_ID,
        title: 'Viagem de Férias Europa',
        targetAmount: 20000.00,
        currentAmount: 11500.00,
        deadline: '2026-09-15',
        color: '#3b82f6',
        icon: 'Plane',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'goal_carro',
        userId: DEMO_USER_ID,
        title: 'Entrada Carro Novo',
        targetAmount: 40000.00,
        currentAmount: 18200.00,
        deadline: '2027-04-30',
        color: '#8b5cf6',
        icon: 'Car',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    investments: [
      {
        id: 'inv_cdb',
        userId: DEMO_USER_ID,
        name: 'CDB Banco Inter 112% CDI',
        type: 'cdb',
        amountInvested: 25000.00,
        currentValue: 27850.40,
        profitability: 11.4,
        dueDate: '2027-06-30',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inv_tesouro',
        userId: DEMO_USER_ID,
        name: 'Tesouro IPCA+ 2035',
        type: 'tesouro',
        amountInvested: 18000.00,
        currentValue: 19420.00,
        profitability: 7.89,
        dueDate: '2035-05-15',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inv_fii',
        userId: DEMO_USER_ID,
        name: 'FIIs Imobiliários (HGLG11 / KNCR11)',
        type: 'fii',
        amountInvested: 15000.00,
        currentValue: 16180.50,
        profitability: 7.87,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inv_stocks',
        userId: DEMO_USER_ID,
        name: 'Carteira Ações Dividendos (VALE3, ITUB4)',
        type: 'stocks',
        amountInvested: 12000.00,
        currentValue: 13950.00,
        profitability: 16.25,
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    pixKeys: [
      {
        id: 'pix_1',
        userId: DEMO_USER_ID,
        key: 'usuario@exemplo.com',
        type: 'email',
        accountId: 'acc_itau',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'pix_2',
        userId: DEMO_USER_ID,
        key: '11999887766',
        type: 'phone',
        accountId: 'acc_nubank',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: DEMO_USER_ID,
        title: 'Fatura Próxima do Fechamento',
        message: 'A fatura do seu cartão Nubank fecha em 5 dias.',
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif_2',
        userId: DEMO_USER_ID,
        title: 'Meta Quase Alcançada',
        message: 'Você atingiu 70% da sua Reserva de Emergência!',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]
  };
}

class Store {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Basic schema integrity check
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.transactions)) {
          this.ensureDemoUserConsistency(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('⚠️ [Store] Erro ao carregar data_store.json, tentando backup...', err);
      try {
        if (fs.existsSync(BACKUP_FILE)) {
          const backupContent = fs.readFileSync(BACKUP_FILE, 'utf-8');
          const parsedBackup = JSON.parse(backupContent);
          if (parsedBackup && Array.isArray(parsedBackup.users)) {
            console.log('✅ [Store] Restaurado com sucesso do backup data_store.backup.json');
            this.ensureDemoUserConsistency(parsedBackup);
            return parsedBackup;
          }
        }
      } catch (backupErr) {
        console.error('⚠️ [Store] Falha também ao carregar backup:', backupErr);
      }
    }

    // Fallback to fresh seed
    console.log('🌱 [Store] Inicializando banco de dados com dados de seed...');
    const seed = getSeedData();
    this.saveDirect(seed);
    return seed;
  }

  /**
   * Garante que o usuário demo existe e que tanto demo@finanflow.com
   * quanto usuario@exemplo.com apontem consistentemente para usr_demo_1.
   */
  private ensureDemoUserConsistency(data: DatabaseSchema): void {
    let demoUser = data.users.find(
      (u) => u.id === DEMO_USER_ID || u.email.toLowerCase() === DEMO_EMAIL.toLowerCase() || u.email.toLowerCase() === DEMO_SECONDARY_EMAIL.toLowerCase()
    );

    if (!demoUser) {
      const salt = bcrypt.genSaltSync(10);
      demoUser = {
        id: DEMO_USER_ID,
        name: 'Usuário Demonstração',
        email: DEMO_EMAIL,
        passwordHash: bcrypt.hashSync('demo123', salt),
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T00:00:00.000Z'
      };
      data.users.push(demoUser);
    } else {
      // Normaliza id para DEMO_USER_ID para integridade
      demoUser.id = DEMO_USER_ID;
    }
  }

  /**
   * Salva com escrita atômica (atomic write: temp file + rename)
   * e cria cópia de segurança antes de sobrescrever.
   */
  public save(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    try {
      this.saveDirect(this.data);
    } catch (err) {
      console.error('❌ [Store] Erro ao gravar dados no disco:', err);
    } finally {
      this.isSaving = false;
    }
  }

  private saveDirect(data: DatabaseSchema): void {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    const serialized = JSON.stringify(data, null, 2);

    // 1. Grava no arquivo temporário
    fs.writeFileSync(tempFile, serialized, 'utf-8');

    // 2. Se o arquivo principal já existe, cria cópia em backup
    try {
      if (fs.existsSync(DB_FILE)) {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      }
    } catch (e) {
      // Ignora erro menor de backup
    }

    // 3. Renomeia atomicamente o arquivo temporário para o destino final
    fs.renameSync(tempFile, DB_FILE);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- MÉTODOS DE USUÁRIO ---
  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    // Suporte aos dois apelidos da conta demo
    if (normalized === DEMO_EMAIL || normalized === DEMO_SECONDARY_EMAIL) {
      return this.data.users.find(
        (u) => u.id === DEMO_USER_ID || u.email.toLowerCase() === DEMO_EMAIL || u.email.toLowerCase() === DEMO_SECONDARY_EMAIL
      );
    }
    return this.data.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: User): void {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // --- CATEGORIAS PADRÃO PARA NOVOS USUÁRIOS ---
  public initUserCategories(userId: string): void {
    const defaultCategories: Category[] = [
      { id: `cat_${userId}_1`, userId, name: 'Salário & Renda', type: 'income', color: '#10b981', icon: 'Briefcase' },
      { id: `cat_${userId}_2`, userId, name: 'Rendimentos', type: 'income', color: '#06b6d4', icon: 'TrendingUp' },
      { id: `cat_${userId}_3`, userId, name: 'Freelance & Extras', type: 'income', color: '#8b5cf6', icon: 'Zap' },
      { id: `cat_${userId}_4`, userId, name: 'Moradia & Contas', type: 'expense', color: '#f59e0b', icon: 'Home' },
      { id: `cat_${userId}_5`, userId, name: 'Alimentação & Supermercado', type: 'expense', color: '#ef4444', icon: 'Utensils' },
      { id: `cat_${userId}_6`, userId, name: 'Transporte & Combustível', type: 'expense', color: '#3b82f6', icon: 'Car' },
      { id: `cat_${userId}_7`, userId, name: 'Saúde & Farmácia', type: 'expense', color: '#ec4899', icon: 'Heart' },
      { id: `cat_${userId}_8`, userId, name: 'Lazer & Viagens', type: 'expense', color: '#a855f7', icon: 'Smile' },
      { id: `cat_${userId}_9`, userId, name: 'Compras & Assinaturas', type: 'expense', color: '#f97316', icon: 'ShoppingBag' }
    ];
    this.data.categories.push(...defaultCategories);

    // Cria conta inicial com saldo inicial zerado
    const defaultAccount: BankAccount = {
      id: `acc_${userId}_1`,
      userId,
      name: 'Conta Corrente Principal',
      type: 'checking',
      balance: 0,
      color: '#3b82f6',
      bank: 'Banco Principal',
      icon: 'Building2',
      createdAt: new Date().toISOString()
    };
    this.data.accounts.push(defaultAccount);

    this.save();
  }

  // --- CONSULTAS MULTI-TENANT ISOLADAS POR USER_ID ---
  public getAccountsByUser(userId: string): BankAccount[] {
    return this.data.accounts.filter((a) => a.userId === userId);
  }

  public getCardsByUser(userId: string): CreditCard[] {
    return this.data.cards.filter((c) => c.userId === userId);
  }

  public getTransactionsByUser(userId: string): Transaction[] {
    return this.data.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getCategoriesByUser(userId: string): Category[] {
    return this.data.categories.filter((c) => c.userId === userId);
  }

  public getBudgetsByUser(userId: string): Budget[] {
    return this.data.budgets.filter((b) => b.userId === userId);
  }

  public getGoalsByUser(userId: string): Goal[] {
    return this.data.goals.filter((g) => g.userId === userId);
  }

  public getInvestmentsByUser(userId: string): Investment[] {
    return this.data.investments.filter((i) => i.userId === userId);
  }

  public getPixKeysByUser(userId: string): PixKey[] {
    return this.data.pixKeys.filter((p) => p.userId === userId);
  }

  public getNotificationsByUser(userId: string): UserNotification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- MUTATION HELPERS ---
  public addTransaction(tx: Transaction): void {
    this.data.transactions.unshift(tx);
    this.save();
  }

  public updateTransaction(id: string, userId: string, updates: Partial<Transaction>): Transaction | null {
    const tx = this.data.transactions.find((t) => t.id === id && t.userId === userId);
    if (!tx) return null;
    Object.assign(tx, updates);
    this.save();
    return tx;
  }

  public deleteTransaction(id: string, userId: string): boolean {
    const index = this.data.transactions.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return false;
    this.data.transactions.splice(index, 1);
    this.save();
    return true;
  }

  // --- RESTORE TENANT ISOLATED ---
  public restoreUserBackup(userId: string, backupData: Partial<DatabaseSchema>): void {
    // 1. Remove apenas os dados do usuário autenticado
    this.data.accounts = this.data.accounts.filter((a) => a.userId !== userId);
    this.data.cards = this.data.cards.filter((c) => c.userId !== userId);
    this.data.transactions = this.data.transactions.filter((t) => t.userId !== userId);
    this.data.categories = this.data.categories.filter((c) => c.userId !== userId);
    this.data.budgets = this.data.budgets.filter((b) => b.userId !== userId);
    this.data.goals = this.data.goals.filter((g) => g.userId !== userId);
    this.data.investments = this.data.investments.filter((i) => i.userId !== userId);
    this.data.pixKeys = this.data.pixKeys.filter((p) => p.userId !== userId);
    this.data.notifications = this.data.notifications.filter((n) => n.userId !== userId);

    // 2. Insere os novos dados associando estritamente a este userId
    if (Array.isArray(backupData.accounts)) {
      this.data.accounts.push(...backupData.accounts.map((a) => ({ ...a, userId })));
    }
    if (Array.isArray(backupData.cards)) {
      this.data.cards.push(...backupData.cards.map((c) => ({ ...c, userId })));
    }
    if (Array.isArray(backupData.transactions)) {
      this.data.transactions.push(...backupData.transactions.map((t) => ({ ...t, userId })));
    }
    if (Array.isArray(backupData.categories)) {
      this.data.categories.push(...backupData.categories.map((c) => ({ ...c, userId })));
    }
    if (Array.isArray(backupData.budgets)) {
      this.data.budgets.push(...backupData.budgets.map((b) => ({ ...b, userId })));
    }
    if (Array.isArray(backupData.goals)) {
      this.data.goals.push(...backupData.goals.map((g) => ({ ...g, userId })));
    }
    if (Array.isArray(backupData.investments)) {
      this.data.investments.push(...backupData.investments.map((i) => ({ ...i, userId })));
    }
    if (Array.isArray(backupData.pixKeys)) {
      this.data.pixKeys.push(...backupData.pixKeys.map((p) => ({ ...p, userId })));
    }
    if (Array.isArray(backupData.notifications)) {
      this.data.notifications.push(...backupData.notifications.map((n) => ({ ...n, userId })));
    }

    this.save();
  }
}

export const store = new Store();
