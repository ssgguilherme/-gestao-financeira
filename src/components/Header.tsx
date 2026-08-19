import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePWA } from '../context/PWAContext';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenNewTransaction?: () => void;
  onSelectTab?: (tab: string) => void;
  alerts?: { id: string; title: string; message: string; type: 'danger' | 'warning' | 'info' | 'success'; createdAt: string; read: boolean }[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu = () => {},
  onOpenNewTransaction = () => {},
  onSelectTab = (_tab?: string) => {},
  alerts = [],
  searchQuery = '',
  onSearchChange = (_q?: string) => {}
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, installApp } = usePWA();
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const unreadCount = safeAlerts.filter((a) => !a.read).length;

  return (
    <header className="sticky top-0 z-30 min-h-16 pt-[env(safe-area-inset-top,0px)] pb-1 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1a2232] px-3 sm:px-4 lg:px-8 flex items-center justify-between transition-colors gap-2">
      {/* Left: Mobile Menu Trigger + Brand Logomark & Global Search */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 max-w-lg">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141a26] border border-slate-300 dark:border-[#202a3c] rounded-xl transition-colors cursor-pointer shrink-0"
          aria-label="Abrir Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Logomark */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="lg:hidden flex items-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <div className="w-3 h-3 border-t-2 border-l-2 border-emerald-400 transform -rotate-45 translate-x-0.5" />
          </div>
          <span className="hidden min-[400px]:inline text-xs font-bold text-slate-900 dark:text-white tracking-wide">
            FinanFlow
          </span>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full min-w-0">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value) {
                onSelectTab('transactions');
              }
            }}
            placeholder="Buscar..."
            className="w-full bg-slate-100 dark:bg-[#141a26] border border-slate-300 dark:border-[#202a3c] rounded-xl pl-8 sm:pl-10 pr-7 sm:pr-8 py-1.5 sm:py-2 text-base sm:text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-[#e2f163] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* PWA Install Button when available */}
        {isInstallable && (
          <button
            onClick={installApp}
            className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            title="Instalar aplicativo PWA"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Instalar App</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          title="Novo Lançamento"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden min-[480px]:inline">Novo Lançamento</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141a26] hover:bg-slate-200 dark:hover:bg-[#1a2333] border border-slate-300 dark:border-[#202a3c] rounded-xl transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#e2f163]" /> : <Moon className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#141a26] hover:bg-slate-200 dark:hover:bg-[#1a2333] border border-slate-300 dark:border-[#202a3c] rounded-xl transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e2f163] text-[#0b0e14] text-[10px] font-extrabold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-[280px] sm:w-80 max-w-[90vw] bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-2xl shadow-2xl z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#222b3d] px-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">Alertas e Notificações</span>
                <span className="text-[10px] bg-[#e2f163]/20 text-[#0b0e14] dark:text-[#e2f163] px-2 py-0.5 rounded-full font-semibold">
                  {alerts.length} avisos
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pt-1 custom-scrollbar">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">Nenhum alerta pendente.</p>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-slate-50 dark:bg-[#1a2232] hover:bg-slate-100 dark:hover:bg-[#202b3f] rounded-xl flex items-start space-x-2.5 transition-colors"
                    >
                      {a.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      {a.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {a.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      {a.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{a.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight mt-0.5">{a.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Trigger */}
        <button
          onClick={() => onSelectTab('profile')}
          className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#141a26] transition-colors cursor-pointer"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-[#202a3c]"
          />
        </button>
      </div>
    </header>
  );
};
