import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Receipt,
  Tags,
  CalendarDays,
  QrCode,
  Repeat,
  Target,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  User,
  LogOut,
  X,
  PlusCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab?: string) => void;
  onOpenNewTransaction?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeTab,
  onSelectTab = (_tab?: string) => {},
  onOpenNewTransaction = () => {},
  mobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const { user, logout } = useAuth();
  const selectedTab = currentTab || activeTab || 'dashboard';

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas Bancárias', icon: Wallet },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'transactions', label: 'Lançamentos', icon: Receipt },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'installments', label: 'Parcelamentos', icon: CalendarDays },
    { id: 'fixed', label: 'Contas Fixas', icon: Repeat },
    { id: 'goals', label: 'Metas Financeiras', icon: Target },
    { id: 'budgets', label: 'Orçamentos', icon: PieChart },
    { id: 'reports', label: 'Relatórios & Export', icon: FileSpreadsheet }
  ];

  const generalItems = [
    { id: 'profile', label: 'Configurações', icon: Settings }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#182030] border border-slate-300 dark:border-[#2a364f] flex items-center justify-center">
            <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-[#84cc16] dark:border-[#e2f163] transform -rotate-45 translate-x-0.5" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            FinanFlow
          </span>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Fechar Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Transaction Action Button */}
      <div className="px-4 pb-2">
        <button
          onClick={() => {
            onOpenNewTransaction();
            onCloseMobile();
          }}
          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#182030] dark:hover:bg-[#202a3f] text-slate-900 dark:text-[#e2f163] font-semibold rounded-xl border border-slate-300 dark:border-[#26334d] flex items-center justify-center space-x-2 text-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-[#e2f163]" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 custom-scrollbar">
        {/* Main Menu */}
        <div>
          <p className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            MENU
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#e2f163] text-[#0b0e14] shadow-md shadow-[#e2f163]/15'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151c2a]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b0e14]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* General Section */}
        <div>
          <p className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Geral
          </p>
          <nav className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#e2f163] text-[#0b0e14] shadow-md shadow-[#e2f163]/15'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151c2a]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0b0e14]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1a2232] bg-slate-50 dark:bg-[#0b0e14]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-[#141a26]">
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            className="flex items-center space-x-2.5 overflow-hidden text-left cursor-pointer flex-1 min-w-0 group"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user?.name || 'Usuário'}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-[#2a364f] shrink-0 group-hover:border-emerald-500 transition-colors"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-500 transition-colors">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.companyName ? user.companyName : user?.email}
              </p>
            </div>
          </button>
          <button
            onClick={logout}
            title="Sair"
            className="p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-[#1d2738] rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0d111a] border-r border-slate-200 dark:border-[#1a2232] z-50 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0d111a] border-r border-slate-200 dark:border-[#1a2232] z-50 flex flex-col h-full shadow-2xl pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
