import React from 'react';
import { Repeat, Plus, CheckCircle2, Play, Trash2 } from 'lucide-react';
import { FixedAccount } from '../types';

interface FixedAccountsViewProps {
  fixedAccounts: FixedAccount[];
  onOpenNewFixed: () => void;
  onProcessFixed: () => Promise<void>;
  onDeleteFixed: (id: string) => Promise<void>;
}

export const FixedAccountsView: React.FC<FixedAccountsViewProps> = ({
  fixedAccounts = [],
  onOpenNewFixed,
  onProcessFixed,
  onDeleteFixed
}) => {
  const safeFixedAccounts = Array.isArray(fixedAccounts) ? fixedAccounts : [];

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const totalFixedMonthly = safeFixedAccounts.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Contas Recorrentes
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Contas Fixas & Assinaturas</h1>
          <p className="text-xs text-slate-400">
            Total comprometido por mês: <strong className="text-amber-400 font-extrabold">{fmt(totalFixedMonthly)}</strong>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onProcessFixed}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Processar Mês Atual</span>
          </button>
          <button
            onClick={onOpenNewFixed}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta Fixa</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {safeFixedAccounts.map((f) => (
          <div
            key={f.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{f.description}</h3>
                <p className="text-[11px] text-slate-400">{f.category}</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Excluir conta fixa "${f.description}"?`)) {
                    onDeleteFixed(f.id);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Valor Recorrente</span>
              <p className="text-2xl font-extrabold text-amber-400 tracking-tight">{fmt(f.amount)}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Vencimento todo dia {f.dueDay}</span>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Ativa
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
