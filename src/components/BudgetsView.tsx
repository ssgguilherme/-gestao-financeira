import React from 'react';
import { PiggyBank, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Category, Transaction } from '../types';

interface BudgetsViewProps {
  categories: Category[];
  transactions: Transaction[];
  onOpenNewCategory: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories = [],
  transactions = [],
  onOpenNewCategory
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // Filter current month expenses per category
  const nowStr = new Date().toISOString().substring(0, 7);

  const budgetedCategories = safeCategories.map((cat) => {
    const spent = safeTransactions
      .filter((t) => t.category === cat.name && t.type === 'despesa' && t.date.startsWith(nowStr))
      .reduce((s, t) => s + t.amount, 0);

    const limit = cat.budgetLimit || 1000;
    const pct = Math.round((spent / limit) * 100);

    return {
      ...cat,
      spent,
      limit,
      pct
    };
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Teto de Gastos
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Orçamentos por Categoria</h1>
          <p className="text-xs text-slate-400">
            Defina limites para não estourar o orçamento no mês.
          </p>
        </div>
        <button
          onClick={onOpenNewCategory}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajustar Teto de Categoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetedCategories.map((cat) => {
          let statusColor = 'bg-emerald-500';
          let textColor = 'text-emerald-400';
          if (cat.pct >= 100) {
            statusColor = 'bg-red-500';
            textColor = 'text-red-400';
          } else if (cat.pct >= 80) {
            statusColor = 'bg-amber-400';
            textColor = 'text-amber-400';
          }

          return (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400">Teto definido: {fmt(cat.limit)}</p>
                  </div>
                </div>
                <span className={`text-xs font-extrabold ${textColor}`}>{cat.pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                    style={{ width: `${Math.min(100, cat.pct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Gasto: {fmt(cat.spent)}</span>
                  <span>Restante: {fmt(Math.max(0, cat.limit - cat.spent))}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
