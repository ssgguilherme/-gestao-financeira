import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Wallet,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  Tags,
  CalendarDays,
  QrCode,
  Repeat,
  Target,
  PieChart,
  FileSpreadsheet,
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Extrato', icon: Receipt },
    // Center button is + Novo
    { id: 'accounts', label: 'Contas', icon: Wallet },
  ];

  const allMenuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: Receipt },
    { id: 'accounts', label: 'Contas Bancárias', icon: Wallet },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'installments', label: 'Parcelamentos', icon: CalendarDays },
    { id: 'fixed', label: 'Contas Fixas', icon: Repeat },
    { id: 'goals', label: 'Metas Financeiras', icon: Target },
    { id: 'budgets', label: 'Orçamentos', icon: PieChart },
    { id: 'reports', label: 'Relatórios & Export', icon: FileSpreadsheet },
    { id: 'profile', label: 'Configurações', icon: Settings },
  ];

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Sheet Menu (Opened when tapping "Mais") */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white dark:bg-[#0d111a] border-t border-slate-200 dark:border-[#1a2232] rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250 pb-[env(safe-area-inset-bottom,0px)]">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-slate-200 dark:border-[#1a2232] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16] dark:bg-[#e2f163]" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Menu de Navegação</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#141a26]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {allMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-center space-x-3 p-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-[#e2f163] text-[#0b0e14] shadow-md shadow-[#e2f163]/15'
                          : 'bg-slate-50 dark:bg-[#141a26] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2232] border border-slate-200 dark:border-[#202a3d]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0b0e14]' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Controls & Account Section */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#1a2232] space-y-3">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#141a26] p-3 rounded-2xl border border-slate-200 dark:border-[#202a3d]">
                  <button
                    type="button"
                    onClick={() => handleSelectTab('profile')}
                    className="flex items-center space-x-3 overflow-hidden text-left cursor-pointer flex-1 min-w-0"
                  >
                    <img
                      src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user?.name || 'Usuário'}
                      className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-[#2a364f] shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Usuário'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.companyName ? user.companyName : user?.email}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-[#1a2232] rounded-xl hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Alternar Tema"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-[#e2f163]" /> : <Moon className="w-4 h-4 text-amber-500" />}
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 transition-colors"
                      title="Sair"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#1a2232] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pl-[calc(0.75rem+env(safe-area-inset-left,0px))] pr-[calc(0.75rem+env(safe-area-inset-right,0px))] lg:hidden shadow-lg transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Tab 1: Início */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              currentTab === 'dashboard'
                ? 'text-[#84cc16] dark:text-[#e2f163]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Início</span>
          </button>

          {/* Tab 2: Extrato */}
          <button
            onClick={() => handleSelectTab('transactions')}
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              currentTab === 'transactions'
                ? 'text-[#84cc16] dark:text-[#e2f163]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Extrato</span>
          </button>

          {/* Center Action: + Novo */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center justify-center w-12 h-12 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] rounded-full shadow-lg shadow-[#e2f163]/25 -mt-5 border-4 border-white dark:border-[#0b0e14] transition-transform active:scale-95"
            title="Novo Lançamento"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Tab 3: Contas */}
          <button
            onClick={() => handleSelectTab('accounts')}
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              currentTab === 'accounts'
                ? 'text-[#84cc16] dark:text-[#e2f163]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Contas</span>
          </button>

          {/* Tab 4: Menu / Mais */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-xl transition-all ${
              menuOpen
                ? 'text-[#84cc16] dark:text-[#e2f163]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
