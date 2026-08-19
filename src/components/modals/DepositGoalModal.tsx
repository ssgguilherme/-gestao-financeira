import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle } from 'lucide-react';
import { FinancialGoal } from '../../types';

interface DepositGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  onSubmit: (goalId: string, amount: number, action: 'add' | 'subtract') => Promise<void>;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSubmit
}) => {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'add' | 'subtract'>('add');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await onSubmit(goal.id, Number(amount), action);
      setAmount('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao guardar dinheiro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">
            {action === 'add' ? 'Aportar na Meta' : 'Resgatar da Meta'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
            <p className="text-xs text-slate-400">Meta: <strong className="text-slate-100">{goal.title}</strong></p>
            <p className="text-xs text-slate-400">Progresso atual: <strong className="text-emerald-400">R$ {goal.currentAmount.toFixed(2)}</strong> de R$ {goal.targetAmount.toFixed(2)}</p>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setAction('add')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1 ${
                action === 'add' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Aportar</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('subtract')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border flex items-center justify-center space-x-1 ${
                action === 'subtract' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>Resgatar</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100,00"
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
