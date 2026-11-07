import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  ViewTab,
  DashboardData,
  Transaction,
  BankAccount,
  CreditCard,
  Investment,
  Goal,
  Budget,
  PixKey
} from './types/finance';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsCardsView } from './components/AccountsCardsView';
import { InvestmentsView } from './components/InvestmentsView';
import { GoalsBudgetsView } from './components/GoalsBudgetsView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import {
  Menu,
  Sparkles,
  Plus,
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

function FinanFlowApp() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // App Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load All User Data (Tenant-Scoped)
  const refreshAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      const [
        dashRes,
        txsRes,
        accsRes,
        cardsRes,
        invsRes,
        goalsRes,
        budgetsRes,
        pixRes
      ] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getTransactions().catch(() => ({ transactions: [] })),
        api.getAccounts().catch(() => ({ accounts: [] })),
        api.getCards().catch(() => ({ cards: [] })),
        api.getInvestments().catch(() => ({ investments: [] })),
        api.getGoals().catch(() => ({ goals: [] })),
        api.getBudgets().catch(() => ({ budgets: [] })),
        api.getPixKeys().catch(() => ({ pixKeys: [] }))
      ]);

      if (dashRes) setDashboardData(dashRes);
      if (txsRes?.transactions) setTransactions(txsRes.transactions);
      if (accsRes?.accounts) setAccounts(accsRes.accounts);
      if (cardsRes?.cards) setCards(cardsRes.cards);
      if (invsRes?.investments) setInvestments(invsRes.investments);
      if (goalsRes?.goals) setGoals(goalsRes.goals);
      if (budgetsRes?.budgets) setBudgets(budgetsRes.budgets);
      if (pixRes?.pixKeys) setPixKeys(pixRes.pixKeys);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  // Se estiver carregando sessão
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xl animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Iniciando sessão segura FinanFlow...</p>
      </div>
    );
  }

  // Se não autenticado -> Tela de Login / Cadastro
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div
      className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-white flex ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Offline & Sync Notification Banner */}
        <OfflineSyncBanner onRefreshData={refreshAllData} />

        {/* Mobile Navbar Header */}
        <header className="md:hidden sticky top-0 z-30 p-4 border-b border-slate-800/20 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              <span>FinanFlow</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAllData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </header>

        {/* Viewport View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              isLoading={isLoadingData}
              onNavigate={setCurrentTab}
              onOpenNewTransaction={() => setCurrentTab('transactions')}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              accounts={accounts}
              cards={cards}
              onRefresh={refreshAllData}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsCardsView
              accounts={accounts}
              cards={cards}
              onRefresh={refreshAllData}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'investments' && (
            <InvestmentsView
              investments={investments}
              onRefresh={refreshAllData}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsBudgetsView
              goals={goals}
              budgets={budgets}
              onRefresh={refreshAllData}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              onRefreshAll={refreshAllData}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView isDarkMode={isDarkMode} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanFlowApp />
    </AuthProvider>
  );
}
