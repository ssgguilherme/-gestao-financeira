import React, { useState } from 'react';
import { DashboardData, ViewTab } from '../types/finance';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface DashboardViewProps {
  data: DashboardData | null;
  isLoading: boolean;
  onNavigate: (tab: ViewTab) => void;
  onOpenNewTransaction: () => void;
  isDarkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  isLoading,
  onNavigate,
  onOpenNewTransaction,
  isDarkMode
}) => {
  const [showValues, setShowValues] = useState<boolean>(true);

  const formatCurrency = (val: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Carregando painel financeiro seguro...</p>
      </div>
    );
  }

  const { summary, recentTransactions, expensesByCategory, monthlyFlow, alerts, goalsSummary } = data;

  // Doughnut Chart Data
  const doughnutLabels = expensesByCategory.map((c) => c.category);
  const doughnutValues = expensesByCategory.map((c) => c.amount);
  const palette = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

  const doughnutData = {
    labels: doughnutLabels.length > 0 ? doughnutLabels : ['Sem despesas'],
    datasets: [
      {
        data: doughnutValues.length > 0 ? doughnutValues : [1],
        backgroundColor: doughnutValues.length > 0 ? palette.slice(0, doughnutLabels.length) : ['#334155'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  // Bar Chart Data for Monthly Flow
  const barData = {
    labels: monthlyFlow.map((f) => f.month),
    datasets: [
      {
        label: 'Receitas',
        data: monthlyFlow.map((f) => f.income),
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Despesas',
        data: monthlyFlow.map((f) => f.expense),
        backgroundColor: '#ef4444',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' }
      },
      y: {
        grid: { color: isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)' },
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Balance & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Visão Geral Financeira</h1>
          <p className="text-xs text-slate-400">
            Acompanhe seus saldos, receitas e despesas com praticidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/60 hover:bg-slate-800 transition-colors"
            title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showValues ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{showValues ? 'Ocultar' : 'Exibir'} Saldos</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Security Banner Alert */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                alert.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : alert.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              {alert.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="font-bold">{alert.title}</div>
                <div className="opacity-90">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Total */}
        <div
          className={`p-5 rounded-3xl border shadow-sm transition-all ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              Saldo Total em Contas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(summary.totalBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{summary.accountsCount} contas ativas</span>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-emerald-500 dark:text-emerald-400 hover:underline font-bold transition-colors"
            >
              Ver contas &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Receitas do Mês */}
        <div
          className={`p-5 rounded-3xl border shadow-sm transition-all ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Receitas no Mês</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-teal-500 dark:text-teal-400">
            {formatCurrency(summary.monthlyIncome)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Entradas consolidadas</div>
        </div>

        {/* Card 3: Despesas do Mês */}
        <div
          className={`p-5 rounded-3xl border shadow-sm transition-all ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Despesas no Mês</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-rose-500 dark:text-rose-400">
            {formatCurrency(summary.monthlyExpense)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Balanço:</span>
            <span
              className={`font-bold ${
                summary.monthlySavings >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {formatCurrency(summary.monthlySavings)}
            </span>
          </div>
        </div>

        {/* Card 4: Investimentos */}
        <div
          className={`p-5 rounded-3xl border shadow-sm transition-all ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patrimônio Investido</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-indigo-500 dark:text-indigo-400">
            {formatCurrency(summary.currentInvestmentsValue)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Rentabilidade:</span>
            <span className="font-bold text-emerald-500 dark:text-emerald-400">+{summary.investmentProfitability}%</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left group ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80'
              : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Nova Transação
            </div>
            <div className="text-[10px] text-slate-400">Receita ou despesa</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('accounts')}
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left group ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80'
              : 'bg-white border-slate-200 hover:border-teal-500/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Contas & Cartões
            </div>
            <div className="text-[10px] text-slate-400">Saldos e limites</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('reports')}
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left group ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80'
              : 'bg-white border-slate-200 hover:border-amber-500/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Backup Seguro
            </div>
            <div className="text-[10px] text-slate-400">Exportar/Restaurar</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('goals')}
          className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-left group ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80'
              : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Metas & Economia
            </div>
            <div className="text-[10px] text-slate-400">Objetivos financeiros</div>
          </div>
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Despesas por Categoria (Doughnut) */}
        <div
          className={`p-5 rounded-3xl border shadow-md flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Despesas por Categoria
              </h3>
              <p className="text-[11px] text-slate-400">Distribuição no mês vigente</p>
            </div>
          </div>
          <div className="relative h-60 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 10,
                      color: isDarkMode ? '#cbd5e1' : '#475569',
                      font: { size: 10 }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 2: Fluxo Mensal (Bar) */}
        <div
          className={`lg:col-span-2 p-5 rounded-3xl border shadow-md flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Fluxo Financeiro Semestral
              </h3>
              <p className="text-[11px] text-slate-400">Comparativo de entradas e saídas nos últimos 6 meses</p>
            </div>
          </div>
          <div className="h-60">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div
          className={`lg:col-span-2 p-5 rounded-3xl border shadow-md space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Lançamentos Recentes
              </h3>
              <p className="text-[11px] text-slate-400">Últimas movimentações registradas</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-emerald-500 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>Ver extrato completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma transação cadastrada nesta conta ainda.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : tx.type === 'expense'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {tx.description}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{tx.category}</span>
                        <span>&bull;</span>
                        <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-xs font-bold ${
                        tx.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">{tx.paymentMethod}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals Summary Sidebar Card */}
        <div
          className={`p-5 rounded-3xl border shadow-md space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Metas Financeiras
              </h3>
              <p className="text-[11px] text-slate-400">Progresso dos seus objetivos</p>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-emerald-500 dark:text-emerald-400 hover:underline font-bold"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-4">
            {goalsSummary.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma meta criada ainda. Defina seu primeiro objetivo!
              </div>
            ) : (
              goalsSummary.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div
                    key={goal.id}
                    className={`space-y-1.5 p-3 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={`truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{goal.title}</span>
                      <span className="text-emerald-500 dark:text-emerald-400">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>Alvo: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
