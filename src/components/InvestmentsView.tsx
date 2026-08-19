import React from 'react';
import { TrendingUp, Plus, ShieldCheck, DollarSign, PieChart as PieIcon, Trash2 } from 'lucide-react';
import { Investment } from '../types';

interface InvestmentsViewProps {
  investments: Investment[];
  onOpenNewInvestment: () => void;
  onDeleteInvestment: (id: string) => Promise<void>;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  investments = [],
  onOpenNewInvestment,
  onDeleteInvestment
}) => {
  const safeInvestments = Array.isArray(investments) ? investments : [];

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const totalApplied = safeInvestments.reduce((s, i) => s + i.appliedAmount, 0);
  const totalCurrent = safeInvestments.reduce((s, i) => s + i.currentAmount, 0);
  const totalProfit = totalCurrent - totalApplied;
  const totalYieldPct = totalApplied > 0 ? ((totalProfit / totalApplied) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Carteira de Ativos
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Investimentos</h1>
          <p className="text-xs text-slate-400">
            Acompanhe a rentabilidade da sua carteira e diversificação.
          </p>
        </div>
        <button
          onClick={onOpenNewInvestment}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ativo</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Total Aplicado</span>
          <p className="text-2xl font-extrabold text-slate-100">{fmt(totalApplied)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Patrimônio Atual</span>
          <p className="text-2xl font-extrabold text-blue-400">{fmt(totalCurrent)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Lucro Total do Portfólio</span>
          <p className={`text-2xl font-extrabold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalProfit >= 0 ? '+' : ''} {fmt(totalProfit)} ({totalYieldPct}%)
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {safeInvestments.map((inv) => {
          const profit = inv.currentAmount - inv.appliedAmount;
          const profitPct = inv.appliedAmount > 0 ? ((profit / inv.appliedAmount) * 100).toFixed(1) : '0';

          return (
            <div
              key={inv.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                    {inv.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{inv.title}</h3>
                  <p className="text-[11px] text-slate-400">{inv.broker}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Excluir investimento "${inv.title}"?`)) {
                      onDeleteInvestment(inv.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Aplicado</span>
                  <span className="font-bold text-slate-200">{fmt(inv.appliedAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Valor Atual</span>
                  <span className="font-extrabold text-blue-400">{fmt(inv.currentAmount)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Rendimento Acumulado:</span>
                <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {profit >= 0 ? '+' : ''}{fmt(profit)} ({profitPct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
