import React from 'react';
import { CreditCard as CardIcon, Plus, CheckCircle2, AlertTriangle, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { CreditCard, BankAccount } from '../types';

interface CardsViewProps {
  cards: CreditCard[];
  accounts: BankAccount[];
  onOpenNewCard: () => void;
  onOpenPayBill: (card: CreditCard) => void;
  onDeleteCard: (id: string) => Promise<void>;
}

export const CardsView: React.FC<CardsViewProps> = ({
  cards = [],
  accounts = [],
  onOpenNewCard,
  onOpenPayBill,
  onDeleteCard
}) => {
  const safeCards = Array.isArray(cards) ? cards : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/20">
            Meus Cartões
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">Cartões de Crédito</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie limites, faturas e parcelamentos de todos os seus cartões.
          </p>
        </div>
        <button
          onClick={onOpenNewCard}
          className="px-4 py-2.5 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Digital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeCards.map((card) => {
          const usedLimit = Math.max(0, card.limit - card.availableLimit);
          const usedPct = card.limit > 0 ? Math.round((usedLimit / card.limit) * 100) : 0;

          return (
            <div
              key={card.id}
              className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden transition-colors"
            >
              {/* Sleek Digital Card Visual Header */}
              <div
                className="p-5 rounded-2xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                style={{
                  background: `linear-gradient(135deg, ${card.color || '#1E293B'}, #0F172A)`
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest uppercase opacity-90">{card.bank}</span>
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md">
                    {card.brand}
                  </span>
                </div>

                <div className="my-2">
                  <p className="text-xs text-slate-300">Limite Disponível</p>
                  <p className="text-2xl font-extrabold tracking-tight text-white">{fmt(card.availableLimit)}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold">{card.name}</span>
                  <span className="font-mono">•••• {card.lastDigits || '4928'}</span>
                </div>
              </div>

              {/* Bill Details & Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Fatura Atual em Aberto:</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400">{fmt(usedLimit)}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usedPct > 85 ? 'bg-red-500' : usedPct > 60 ? 'bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, usedPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Utilizado: {usedPct}% (Limite: {fmt(card.limit)})</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Fecha dia {card.closingDay} • Vence dia {card.dueDay}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover o cartão "${card.name}"?`)) {
                      onDeleteCard(card.id);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 font-medium cursor-pointer"
                >
                  Excluir Cartão
                </button>

                <button
                  onClick={() => onOpenPayBill(card)}
                  className="px-4 py-2 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pagar Fatura</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
