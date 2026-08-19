import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { InvestmentType } from '../../types';
import { getTodayISO } from '../../utils/dateUtils';

interface NewInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const NewInvestmentModal: React.FC<NewInvestmentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<InvestmentType>('cdb');
  const [appliedAmount, setAppliedAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [yieldRate, setYieldRate] = useState('');
  const [broker, setBroker] = useState('XP Investimentos');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !appliedAmount) return;

    setLoading(true);
    try {
      const app = Number(appliedAmount);
      const cur = currentAmount ? Number(currentAmount) : app;
      await onSubmit({
        title,
        type,
        appliedAmount: app,
        currentAmount: cur,
        yieldRate: yieldRate ? Number(yieldRate) : 0,
        broker,
        date: getTodayISO()
      });
      setTitle('');
      setAppliedAmount('');
      setCurrentAmount('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar investimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Cadastrar Investimento</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nome do Ativo</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: CDB Banco Inter 110% CDI, Tesouro Selic 2029"
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo de Ativo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InvestmentType)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="tesouro">Tesouro Direto</option>
                <option value="cdb">CDB</option>
                <option value="lci">LCI / LCA</option>
                <option value="fundos">Fundos</option>
                <option value="acoes">Ações</option>
                <option value="fiis">FIIs (Fundos Imobiliários)</option>
                <option value="cripto">Criptomoedas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Corretora / Banco</label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="Ex: XP, Banco Inter, NuInvest"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor Aplicado (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={appliedAmount}
                onChange={(e) => setAppliedAmount(e.target.value)}
                placeholder="1000,00"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor Atual (R$)</label>
              <input
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder={appliedAmount || "1050,00"}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rentabilidade (%)</label>
              <input
                type="number"
                step="0.1"
                value={yieldRate}
                onChange={(e) => setYieldRate(e.target.value)}
                placeholder="11.5"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
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
              {loading ? 'Salvando...' : 'Cadastrar Investimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
