import React from 'react';
import { Target, Plus, CheckCircle2, TrendingUp, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinancialGoal } from '../types';

interface GoalsViewProps {
  goals: FinancialGoal[];
  onOpenNewGoal: () => void;
  onOpenDepositGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals = [],
  onOpenNewGoal,
  onOpenDepositGoal,
  onDeleteGoal
}) => {
  const safeGoals = Array.isArray(goals) ? goals : [];

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Planejamento de Futuro
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Metas Financeiras</h1>
          <p className="text-xs text-slate-400">
            Acompanhe a conquista dos seus sonhos e reservas financeiras.
          </p>
        </div>
        <button
          onClick={onOpenNewGoal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = pct >= 100;

          return (
            <div
              key={goal.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {isCompleted && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Meta Concluída!</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: goal.color || '#3B82F6' }}
                  />
                  <button
                    onClick={() => {
                      if (confirm(`Excluir meta "${goal.title}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-2">{goal.title}</h3>
                <p className="text-[11px] text-slate-400">Prazo: {goal.deadline}</p>
              </div>

              {/* Progress Circle & Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-400">{fmt(goal.currentAmount)}</span>
                  <span className="text-slate-400">Alvo: {fmt(goal.targetAmount)}</span>
                </div>

                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-green-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{pct}% concluído</span>
                  <span>Falta: {fmt(Math.max(0, goal.targetAmount - goal.currentAmount))}</span>
                </div>
              </div>

              {/* Deposit Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (isCompleted) triggerConfetti();
                    onOpenDepositGoal(goal);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Aportar / Resgatar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
