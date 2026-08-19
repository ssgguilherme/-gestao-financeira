import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PWABanner } from './components/PWABanner';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { CardsView } from './components/CardsView';
import { TransactionsView } from './components/TransactionsView';
import { CategoriesView } from './components/CategoriesView';
import { InstallmentsView } from './components/InstallmentsView';
import { PixView } from './components/PixView';
import { FixedAccountsView } from './components/FixedAccountsView';
import { GoalsView } from './components/GoalsView';
import { InvestmentsView } from './components/InvestmentsView';
import { BudgetsView } from './components/BudgetsView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { AuthView } from './components/AuthView';

// Modals
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { NewAccountModal } from './components/modals/NewAccountModal';
import { NewCardModal } from './components/modals/NewCardModal';
import { PayBillModal } from './components/modals/PayBillModal';
import { NewGoalModal } from './components/modals/NewGoalModal';
import { DepositGoalModal } from './components/modals/DepositGoalModal';
import { NewInvestmentModal } from './components/modals/NewInvestmentModal';
import { NewCategoryModal } from './components/modals/NewCategoryModal';
import { ImportModal } from './components/modals/ImportModal';

import { api } from './services/api';
import {
  DashboardMetrics,
  Transaction,
  BankAccount,
  CreditCard,
  Category,
  FixedAccount,
  FinancialGoal,
  Investment,
  BudgetCategory
} from './types';

export default function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categoryChart, setCategoryChart] = useState<any[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>([]);
  const [dailyHistory, setDailyHistory] = useState<any[]>([]);
  const [cardSpending, setCardSpending] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [upcomingDues, setUpcomingDues] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fixedAccounts, setFixedAccounts] = useState<FixedAccount[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);

  // Modal visibility states
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isNewCardOpen, setIsNewCardOpen] = useState(false);
  const [payBillCard, setPayBillCard] = useState<CreditCard | null>(null);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Load all user data from API
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataLoading(true);

    try {
      const [
        dashRes,
        txRes,
        accRes,
        cardRes,
        catRes,
        fixedRes,
        goalRes,
        invRes,
        budRes
      ] = await Promise.all([
        api.getDashboard(),
        api.getTransactions(),
        api.getAccounts(),
        api.getCards(),
        api.getCategories(),
        api.getFixedAccounts(),
        api.getGoals(),
        api.getInvestments(),
        api.getBudgets()
      ]);

      setMetrics(dashRes?.metrics || null);
      setCategoryChart(Array.isArray(dashRes?.categoryChart) ? dashRes.categoryChart : []);
      setMonthlyHistory(Array.isArray(dashRes?.monthlyHistory) ? dashRes.monthlyHistory : []);
      setDailyHistory(Array.isArray(dashRes?.dailyHistory) ? dashRes.dailyHistory : []);
      setCardSpending(Array.isArray(dashRes?.cardSpending) ? dashRes.cardSpending : []);
      setHeatmapData(Array.isArray(dashRes?.heatmapData) ? dashRes.heatmapData : []);
      setUpcomingDues(Array.isArray(dashRes?.upcomingDues) ? dashRes.upcomingDues : []);
      setRecentTransactions(Array.isArray(dashRes?.recentTransactions) ? dashRes.recentTransactions : []);

      setTransactions(Array.isArray(txRes) ? txRes : []);
      setAccounts(Array.isArray(accRes) ? accRes : []);
      setCards(Array.isArray(cardRes) ? cardRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setFixedAccounts(Array.isArray(fixedRes) ? fixedRes : []);
      setGoals(Array.isArray(goalRes) ? goalRes : []);
      setInvestments(Array.isArray(invRes) ? invRes : []);
      setBudgets(Array.isArray(budRes) ? budRes : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  // Handler implementations
  const handleCreateTransaction = async (data: any) => {
    await api.createTransaction(data);
    await loadAllData();
  };

  const handleCreateCategory = async (data: any) => {
    await api.createCategory(data);
    await loadAllData();
  };

  const handleCreateAccount = async (data: any) => {
    await api.createAccount(data);
    await loadAllData();
  };

  const handleCreateCard = async (data: any) => {
    await api.createCard(data);
    await loadAllData();
  };

  const handlePayCardBill = async (cardId: string, accountId: string, amount: number) => {
    await api.payCardBill(cardId, accountId, amount);
    await loadAllData();
  };

  const handleCreateGoal = async (data: any) => {
    await api.createGoal(data);
    await loadAllData();
  };

  const handleDepositGoal = async (goalId: string, amount: number, action: 'add' | 'subtract') => {
    await api.depositGoal(goalId, amount, action);
    await loadAllData();
  };

  const handleCreateInvestment = async (data: any) => {
    await api.createInvestment(data);
    await loadAllData();
  };

  const handleSendPix = async (amount: number, description: string, key: string, accountId: string) => {
    await api.sendPixTransfer({ amount, description, pixKey: key, accountId });
    await loadAllData();
  };

  const handleProcessFixed = async () => {
    await api.processFixedAccounts();
    await loadAllData();
    alert('Contas fixas do mês atual processadas!');
  };

  const handleImportTransactions = async (parsedItems: any[]) => {
    await api.importTransactions(parsedItems);
    await loadAllData();
  };

  const handleRestoreBackup = async (jsonString: string) => {
    await api.restoreBackup(jsonString);
    await loadAllData();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Nenhum lançamento para exportar.');
      return;
    }

    const headers = ['ID', 'Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Status', 'Método'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.status,
      t.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_finanflow_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      transactions,
      accounts,
      cards,
      categories,
      fixedAccounts,
      goals,
      investments,
      exportedAt: new Date().toISOString()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_finanflow_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Delete handlers
  const handleDeleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    await loadAllData();
  };

  const handleDeleteAccount = async (id: string) => {
    await api.deleteAccount(id);
    await loadAllData();
  };

  const handleDeleteCard = async (id: string) => {
    await api.deleteCard(id);
    await loadAllData();
  };

  const handleDeleteFixed = async (id: string) => {
    await api.deleteFixedAccount(id);
    await loadAllData();
  };

  const handleDeleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    await loadAllData();
  };

  const handleDeleteInvestment = async (id: string) => {
    await api.deleteInvestment(id);
    await loadAllData();
  };

  const handleUpdateTransactionStatus = async (id: string, newStatus: 'pago' | 'pendente' | 'cancelado') => {
    await api.updateTransactionStatus(id, newStatus);
    await loadAllData();
  };

  if (authLoading || (isAuthenticated && dataLoading && !metrics)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center space-y-5 z-10 text-center max-w-sm w-full">
          {/* Logo with Animation */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
                <Wallet className="w-10 h-10 animate-bounce" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950">
              <div className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest">
              <span>Gestão Financeira Pessoal</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight pt-1">
              {user?.name ? `Iniciando sessão, ${user.name.split(' ')[0]}!` : 'Entrando no FinanFlow...'}
            </h2>
            <p className="text-xs text-slate-400">
              Carregando seu saldo, cartões e relatórios de investimentos...
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
            <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 h-full w-3/4 rounded-full animate-pulse" />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium pt-1">
            <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Sincronizando dados com segurança...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans flex antialiased selection:bg-[#e2f163] selection:text-[#0b0e14] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={activeTab}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewTransaction={() => setIsNewTxOpen(true)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header Bar */}
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenNewTransaction={() => setIsNewTxOpen(true)}
          onSelectTab={setActiveTab}
          alerts={metrics?.alerts || []}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* PWA Status and Install Banner */}
        <PWABanner />

        {/* Dynamic Main View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-8 overflow-hidden">
          {dataLoading && !metrics ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Atualizando dados financeiros...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {activeTab === 'dashboard' && metrics && (
                  <DashboardView
                    metrics={metrics}
                    categoryChart={categoryChart}
                    monthlyHistory={monthlyHistory}
                    dailyHistory={dailyHistory}
                    cardSpending={cardSpending}
                    heatmapData={heatmapData}
                    upcomingDues={upcomingDues}
                    recentTransactions={recentTransactions}
                    accounts={accounts}
                    investments={investments}
                    onSelectTab={setActiveTab}
                    onOpenNewTransaction={() => setIsNewTxOpen(true)}
                  />
                )}

                {activeTab === 'accounts' && (
                  <AccountsView
                    accounts={accounts}
                    onOpenNewAccount={() => setIsNewAccountOpen(true)}
                    onDeleteAccount={handleDeleteAccount}
                  />
                )}

                {activeTab === 'cards' && (
                  <CardsView
                    cards={cards}
                    accounts={accounts}
                    onOpenNewCard={() => setIsNewCardOpen(true)}
                    onOpenPayBill={(card) => setPayBillCard(card)}
                    onDeleteCard={handleDeleteCard}
                  />
                )}

                {activeTab === 'transactions' && (
                  <TransactionsView
                    transactions={transactions}
                    categories={categories}
                    accounts={accounts}
                    cards={cards}
                    onOpenNewTransaction={() => setIsNewTxOpen(true)}
                    onUpdateTransactionStatus={handleUpdateTransactionStatus}
                    onDeleteTransaction={handleDeleteTransaction}
                    onExportCSV={handleExportCSV}
                    searchTerm={globalSearch}
                    onSearchChange={setGlobalSearch}
                  />
                )}

                {activeTab === 'categories' && (
                  <CategoriesView
                    categories={categories}
                    onOpenNewCategory={() => setIsNewCategoryOpen(true)}
                  />
                )}

                {activeTab === 'installments' && (
                  <InstallmentsView transactions={transactions} />
                )}

                {activeTab === 'fixed' && (
                  <FixedAccountsView
                    fixedAccounts={fixedAccounts}
                    onOpenNewFixed={() => setIsNewTxOpen(true)}
                    onProcessFixed={handleProcessFixed}
                    onDeleteFixed={handleDeleteFixed}
                  />
                )}

                {activeTab === 'goals' && (
                  <GoalsView
                    goals={goals}
                    onOpenNewGoal={() => setIsNewGoalOpen(true)}
                    onOpenDepositGoal={(goal) => setDepositGoal(goal)}
                    onDeleteGoal={handleDeleteGoal}
                  />
                )}

                {activeTab === 'investments' && (
                  <InvestmentsView
                    investments={investments}
                    onOpenNewInvestment={() => setIsNewInvestmentOpen(true)}
                    onDeleteInvestment={handleDeleteInvestment}
                  />
                )}

                {activeTab === 'budgets' && (
                  <BudgetsView
                    categories={categories}
                    transactions={transactions}
                    onOpenNewCategory={() => setIsNewCategoryOpen(true)}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsView
                    onExportCSV={handleExportCSV}
                    onOpenImportModal={() => setIsImportModalOpen(true)}
                    onDownloadBackup={handleDownloadBackup}
                    onRestoreBackup={handleRestoreBackup}
                  />
                )}

                {activeTab === 'profile' && <ProfileView />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewTransaction={() => setIsNewTxOpen(true)}
      />

      {/* Global Modals */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        categories={categories}
        accounts={accounts}
        cards={cards}
        onSubmit={handleCreateTransaction}
      />

      <NewAccountModal
        isOpen={isNewAccountOpen}
        onClose={() => setIsNewAccountOpen(false)}
        onSubmit={handleCreateAccount}
      />

      <NewCardModal
        isOpen={isNewCardOpen}
        onClose={() => setIsNewCardOpen(false)}
        onSubmit={handleCreateCard}
      />

      <PayBillModal
        isOpen={!!payBillCard}
        onClose={() => setPayBillCard(null)}
        card={payBillCard}
        accounts={accounts}
        onSubmit={handlePayCardBill}
      />

      <NewGoalModal
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
        onSubmit={handleCreateGoal}
      />

      <DepositGoalModal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
        onSubmit={handleDepositGoal}
      />

      <NewInvestmentModal
        isOpen={isNewInvestmentOpen}
        onClose={() => setIsNewInvestmentOpen(false)}
        onSubmit={handleCreateInvestment}
      />

      <NewCategoryModal
        isOpen={isNewCategoryOpen}
        onClose={() => setIsNewCategoryOpen(false)}
        onSubmit={handleCreateCategory}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportTransactions}
      />
    </div>
  );
}
