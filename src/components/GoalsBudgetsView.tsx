import React, { useState } from 'react';
import { Goal, Budget } from '../types/finance';
import { api } from '../services/api';
import {
  Target,
  Plus,
  Coins,
  AlertTriangle,
  Calendar,
  CheckCircle,
  X,
  PieChart
} from 'lucide-react';

interface GoalsBudgetsViewProps {
  goals: Goal[];
  budgets: Budget[];
  onRefresh: () => void;
  isDarkMode: boolean;
}

export const GoalsBudgetsView: React.FC<GoalsBudgetsViewProps> = ({
  goals,
  budgets,
  onRefresh,
  isDarkMode
}) => {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Form Budget
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;

    setIsSubmitting(true);
    try {
      await api.createGoal({
        title: goalTitle.trim(),
        targetAmount: parseFloat(goalTarget.replace(',', '.')),
        currentAmount: goalCurrent ? parseFloat(goalCurrent.replace(',', '.')) : 0,
        deadline: goalDeadline || undefined
      });
      setIsAddGoalOpen(false);
      setGoalTitle('');
      setGoalTarget('');
      setGoalCurrent('');
      setGoalDeadline('');
      onRefresh();
    } catch (err) {
      alert('Erro ao criar meta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory.trim() || !budgetLimit) return;

    setIsSubmitting(true);
    try {
      await api.createBudget(budgetCategory.trim(), parseFloat(budgetLimit.replace(',', '.')));
      setIsAddBudgetOpen(false);
      setBudgetCategory('');
      setBudgetLimit('');
      onRefresh();
    } catch (err) {
      alert('Erro ao criar orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal || !depositAmount) return;

    setIsSubmitting(true);
    try {
      await api.depositGoal(activeDepositGoal.id, parseFloat(depositAmount.replace(',', '.')));
      setActiveDepositGoal(null);
      setDepositAmount('');
      onRefresh();
    } catch (err) {
      alert('Erro ao realizar aporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: METAS DE ECONOMIA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Metas & Objetivos Financeiros</span>
            </h2>
            <p className="text-xs text-slate-400">Defina objetivos e acompanhe o percentual acumulado até a realização.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddGoalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-sm">{goal.title}</h3>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {percent}%
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Acumulado</div>
                    <div className="text-xl font-black text-white">{formatCurrency(goal.currentAmount)}</div>
                    <div className="text-[11px] text-slate-400">de {formatCurrency(goal.targetAmount)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Faltam: <strong className="text-slate-300">{formatCurrency(remaining)}</strong></span>
                    <span>Prazo: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Indeterminado'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDepositGoal(goal)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Fazer Aporte</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ORÇAMENTOS POR CATEGORIA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              <span>Tetos de Orçamento Mensal</span>
            </h2>
            <p className="text-xs text-slate-400">Defina limites de despesa por categoria e evite surpresas no final do mês.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddBudgetOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Definir Teto</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
            const isExceeded = b.spent > b.limit;
            const isWarning = percent >= 80 && !isExceeded;

            return (
              <div key={b.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{b.categoryName}</span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      isExceeded
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isExceeded ? 'Estourado!' : `${percent}% utilizado`}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gasto: <strong className="text-white">{formatCurrency(b.spent)}</strong></span>
                  <span>Limite: <strong className="text-slate-300">{formatCurrency(b.limit)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Goal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsAddGoalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Nova Meta Financeira</h2>
            <p className="text-xs text-slate-400 mb-4">Estabeleça uma meta clara de economia.</p>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Título da Meta *</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Ex: Viagem Japão, Reserva de Emergência..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor Alvo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="0,00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Já Economizado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Data Limite Alvo</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Deposit */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onClick={() => setActiveDepositGoal(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Aportar na Meta</h2>
            <p className="text-xs text-slate-400 mb-4">{activeDepositGoal.title}</p>

            <form onSubmit={handleDeposit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor do Aporte (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Budget */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsAddBudgetOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Definir Teto de Gastos</h2>
            <p className="text-xs text-slate-400 mb-4">Escolha a categoria e o limite máximo mensal.</p>

            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  placeholder="Ex: Alimentação, Lazer, Transporte..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Limite Mensal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Salvar Teto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
