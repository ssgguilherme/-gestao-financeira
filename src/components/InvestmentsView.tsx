import React, { useState } from 'react';
import { Investment } from '../types/finance';
import { api } from '../services/api';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  PieChart,
  DollarSign,
  X
} from 'lucide-react';

interface InvestmentsViewProps {
  investments: Investment[];
  onRefresh: () => void;
  isDarkMode: boolean;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  investments,
  onRefresh,
  isDarkMode
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'cdb' | 'lci_lca' | 'tesouro' | 'stocks' | 'fii' | 'crypto'>('cdb');
  const [amountInvested, setAmountInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [profitability, setProfitability] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalInvested = investments.reduce((acc, i) => acc + i.amountInvested, 0);
  const totalCurrent = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amountInvested) return;

    setIsSubmitting(true);
    try {
      const invested = parseFloat(amountInvested.replace(',', '.'));
      const current = currentValue ? parseFloat(currentValue.replace(',', '.')) : invested;

      await api.createInvestment({
        name: name.trim(),
        type,
        amountInvested: invested,
        currentValue: current,
        profitability: profitability ? parseFloat(profitability.replace(',', '.')) : undefined,
        dueDate: dueDate || undefined
      });

      setIsAddOpen(false);
      setName('');
      setAmountInvested('');
      setCurrentValue('');
      setProfitability('');
      setDueDate('');
      onRefresh();
    } catch (err) {
      alert('Erro ao cadastrar investimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabels: Record<string, string> = {
    cdb: 'CDB / Renda Fixa',
    lci_lca: 'LCI / LCA',
    tesouro: 'Tesouro Direto',
    stocks: 'Ações / B3',
    fii: 'Fundos Imobiliários',
    crypto: 'Criptoativos'
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <span>Carteira de Investimentos</span>
          </h1>
          <p className="text-xs text-slate-400">
            Acompanhe rendimentos da sua carteira diversificada em Renda Fixa, Ações e FIIs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Investimento</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Aportado</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalInvested)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Capital inicial investido</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Patrimônio Atual</div>
          <div className="text-2xl font-black text-indigo-400">{formatCurrency(totalCurrent)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Posição atualizada a mercado</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rendimento Acumulado</div>
          <div className="text-2xl font-black text-emerald-400">
            +{formatCurrency(totalProfit)}{' '}
            <span className="text-sm font-bold">({totalPercent.toFixed(2)}%)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Lucro global sobre o capital</div>
        </div>
      </div>

      {/* Table of Investments */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Posições Ativas</h3>
          <span className="text-xs text-slate-400">{investments.length} ativos em carteira</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Ativo / Título</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4 text-right">Valor Aportado</th>
                <th className="py-3 px-4 text-right">Valor Atual</th>
                <th className="py-3 px-4 text-right">Rentabilidade</th>
                <th className="py-3 px-4 text-center">Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum investimento cadastrado ainda.
                  </td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{inv.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold text-[11px]">
                        {typeLabels[inv.type] || inv.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">{formatCurrency(inv.amountInvested)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{formatCurrency(inv.currentValue)}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400">+{inv.profitability}%</td>
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('pt-BR') : 'Liquidez Diária'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Investment */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Novo Ativo de Investimento</h2>
            <p className="text-xs text-slate-400 mb-4">Adicione um título ou ação para controle da carteira.</p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome do Ativo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: CDB Inter 110% CDI, VALE3..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo de Aplicação</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="cdb">CDB / Renda Fixa</option>
                  <option value="lci_lca">LCI / LCA</option>
                  <option value="tesouro">Tesouro Direto</option>
                  <option value="stocks">Ações / B3</option>
                  <option value="fii">Fundos Imobiliários (FIIs)</option>
                  <option value="crypto">Criptoativos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor Aportado (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amountInvested}
                    onChange={(e) => setAmountInvested(e.target.value)}
                    placeholder="0,00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="Igual ao aporte se recente"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Rentabilidade (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profitability}
                    onChange={(e) => setProfitability(e.target.value)}
                    placeholder="Ex: 11.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Salvar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
