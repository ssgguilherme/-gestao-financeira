import React from 'react';
import { ViewTab } from '../types/finance';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  Target,
  QrCode,
  FileSpreadsheet,
  ShieldAlert,
  UserCheck,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Sparkles,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{ tab: ViewTab; label: string; icon: React.ElementType; badge?: string }> = [
    { tab: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { tab: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { tab: 'accounts', label: 'Contas & Cartões', icon: CreditCard },
    { tab: 'investments', label: 'Investimentos', icon: TrendingUp },
    { tab: 'goals', label: 'Metas & Orçamentos', icon: Target },
    { tab: 'pix', label: 'Área Pix', icon: QrCode },
    { tab: 'reports', label: 'Relatórios & Backup', icon: FileSpreadsheet },
    { tab: 'profile', label: 'Configurações', icon: Settings }
  ];

  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const isDemo = user?.email.includes('demo') || user?.email.includes('exemplo');

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/20 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                <span>FinanFlow</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <div className="text-xs text-slate-400">Gestão Financeira Pessoal</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              title="Clique para gerenciar perfil, nome e alterar senha"
              className={`w-full p-3 rounded-2xl flex items-center gap-3 border text-left transition-all hover:scale-[1.01] ${
                currentTab === 'profile'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isDarkMode
                  ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate leading-tight flex items-center gap-1.5">
                  <span className="truncate">{user.name}</span>
                  <Settings className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user.email}
                </div>
              </div>
              {isDemo && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  DEMO
                </span>
              )}
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;

            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-bold'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/20 dark:border-slate-800 space-y-2">
          {/* Botão de Configurações (Alterar Senha e Nome) */}
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              currentTab === 'profile'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/25'
                : isDarkMode
                ? 'bg-slate-800/90 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${currentTab === 'profile' ? 'text-white' : 'text-emerald-400'}`} />
              <span>Configurações</span>
            </div>
            <span className="text-[10px] font-semibold opacity-70">Senha & Nome</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>Modo {isDarkMode ? 'Escuro' : 'Claro'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Alternar</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta (Logout Seguro)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
