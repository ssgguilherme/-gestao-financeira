import React, { useState } from 'react';
import { Dumbbell, Moon, Sun, Menu, ChevronDown, UserCheck, Clock, ClipboardList, LogOut } from 'lucide-react';
import { PersonalProfile } from '../../types';

interface AdminNavbarProps {
  profile: PersonalProfile;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenSchedule: () => void;
  onOpenQuestions: () => void;
  onLogout?: () => void;
  isSimulated?: boolean;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  profile,
  isDarkMode,
  onToggleTheme,
  onOpenSettings,
  onOpenSchedule,
  onOpenQuestions,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
              <span>Painel do Personal</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                PRO
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestão de Alunos & Avaliações
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 relative">
          {/* Theme Toggle */}
          <button
            type="button"
            id="btn-theme-toggle"
            onClick={onToggleTheme}
            title="Alternar Modo Escuro / Claro"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="btn-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold transition-all border border-slate-200/80 dark:border-slate-700"
            >
              <Menu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline truncate max-w-[120px]">{profile.nome.split(' ')[0]}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  id="admin-menu-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    type="button"
                    id="btn-open-settings"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors font-medium text-left w-full"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Meu Perfil</span>
                  </button>

                  <button
                    type="button"
                    id="btn-open-schedule"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSchedule();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg transition-colors font-medium text-left w-full"
                  >
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span>Horários & Datas</span>
                  </button>

                  <button
                    type="button"
                    id="btn-open-questions-manager"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenQuestions();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg transition-colors font-medium text-left w-full"
                  >
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    <span>Perguntas Anamnese</span>
                  </button>

                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

                  <button
                    type="button"
                    id="btn-logout"
                    onClick={() => {
                      setMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors font-medium text-left w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
