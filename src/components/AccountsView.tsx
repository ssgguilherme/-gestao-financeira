import React from 'react';
import { Wallet, Plus, Trash2, Edit2, Landmark, Building2, PiggyBank, CreditCard } from 'lucide-react';
import { BankAccount } from '../types';

interface AccountsViewProps {
  accounts: BankAccount[];
  onOpenNewAccount: () => void;
  onDeleteAccount: (id: string) => Promise<void>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts = [],
  onOpenNewAccount,
  onDeleteAccount
}) => {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const totalBalance = safeAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-[#e2f163] uppercase tracking-widest bg-emerald-50 dark:bg-[#e2f163]/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-[#e2f163]/20">
            Minhas Contas
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">Contas Bancárias</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Saldo acumulado total: <strong className="text-emerald-600 dark:text-[#4ade80] font-extrabold">{fmt(totalBalance)}</strong> em {accounts.length} contas
          </p>
        </div>
        <button
          onClick={onOpenNewAccount}
          className="px-4 py-2.5 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Conta</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {safeAccounts.map((acc) => {
          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-5 shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-[#323f59] transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color || '#3B82F6' }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-bold text-lg"
                    style={{ backgroundColor: acc.color || '#3B82F6' }}
                  >
                    {acc.bankName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{acc.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{acc.type} • {acc.bankName}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Deseja remover a conta "${acc.name}"?`)) {
                      onDeleteAccount(acc.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1d2738] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 my-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Saldo Atual</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{fmt(acc.balance)}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Saldo Inicial: {fmt(acc.initialBalance)}</span>
                {acc.accountNumber && <span>Conta: {acc.accountNumber}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
