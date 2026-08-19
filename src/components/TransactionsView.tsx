import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Download,
  Calendar,
  FileText,
  X
} from 'lucide-react';
import { Transaction, Category, BankAccount, CreditCard } from '../types';
import { formatDateBR } from '../utils/dateUtils';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onOpenNewTransaction: () => void;
  onUpdateTransactionStatus: (id: string, newStatus: 'pago' | 'pendente' | 'cancelado') => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onExportCSV: () => void;
  searchTerm?: string;
  onSearchChange?: (q: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions = [],
  categories = [],
  accounts = [],
  cards = [],
  onOpenNewTransaction,
  onUpdateTransactionStatus,
  onDeleteTransaction,
  onExportCSV,
  searchTerm: externalSearchTerm = '',
  onSearchChange
}) => {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const safeCards = Array.isArray(cards) ? cards : [];

  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);

  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('month'); // today, week, month, year, all
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // Date filtering helper
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const currentYearStr = todayStr.substring(0, 4);

  const filteredTransactions = safeTransactions.filter((tx) => {
    // Search by description, category, amount, observation, payment method
    if (searchTerm) {
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        const matchObs = tx.observation?.toLowerCase().includes(q);

        // Amount matching: raw number, formatted currency, and normalized decimal
        const amountStr = tx.amount.toString();
        const formattedAmount = fmt(tx.amount).toLowerCase();
        const normalizedQ = q.replace(/[^0-9.,]/g, '').replace(',', '.');

        const matchAmountRaw = amountStr.includes(q);
        const matchAmountFmt = formattedAmount.includes(q);
        const matchAmountNormalized = normalizedQ
          ? amountStr.includes(normalizedQ) || tx.amount.toFixed(2).includes(normalizedQ)
          : false;

        const matchPayMethod = tx.paymentMethod?.toLowerCase().includes(q);

        if (
          !matchDesc &&
          !matchCat &&
          !matchObs &&
          !matchAmountRaw &&
          !matchAmountFmt &&
          !matchAmountNormalized &&
          !matchPayMethod
        ) {
          return false;
        }
      }
    }

    // Type
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

    // Status
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

    // Category
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

    // Date range
    if (dateRangeFilter === 'today' && tx.date !== todayStr) return false;
    if (dateRangeFilter === 'month' && !tx.date.startsWith(currentMonthStr)) return false;
    if (dateRangeFilter === 'year' && !tx.date.startsWith(currentYearStr)) return false;

    return true;
  });

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);

  const totalFilteredExpenses = filteredTransactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-[#e2f163] uppercase tracking-widest bg-emerald-50 dark:bg-[#e2f163]/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-[#e2f163]/20">
            Extrato Financeiro
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">Lançamentos</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Histórico completo de entradas, saídas, PIX e compras parceladas.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Baixar CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-4 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-md transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Entradas Filtradas</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-[#4ade80]">{fmt(totalFilteredIncome)}</p>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-[#4ade80] rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-4 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-md transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Saídas Filtradas</span>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{fmt(totalFilteredExpenses)}</p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-4 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-md transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Resultado do Período</span>
            <p className={`text-lg font-bold ${totalFilteredIncome - totalFilteredExpenses >= 0 ? 'text-emerald-600 dark:text-[#4ade80]' : 'text-red-600 dark:text-red-400'}`}>
              {fmt(totalFilteredIncome - totalFilteredExpenses)}
            </p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Multi-Filters */}
      <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-4 rounded-2xl space-y-3 shadow-sm dark:shadow-md transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por descrição, categoria ou valor..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="month">Este Mês</option>
            <option value="today">Hoje</option>
            <option value="year">Este Ano</option>
            <option value="all">Todo o Histórico</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">Todos os Tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
            <option value="investimento">Investimentos</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="all">Todos os Status</option>
            <option value="pago">Pago / Concluído</option>
            <option value="pendente">Pendente / Agendado</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Descrição</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Pagamento</th>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Valor</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Nenhum lançamento encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const card = cards.find((c) => c.id === tx.cardId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{tx.description}</p>
                          {tx.installment && (
                            <span className="text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-mono mt-0.5 inline-block">
                              Parcela {tx.installment.currentInstallment}/{tx.installment.totalInstallments}
                            </span>
                          )}
                          {tx.observation && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{tx.observation}</p>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium">
                          {tx.category}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="capitalize text-slate-700 dark:text-slate-300">
                          {tx.paymentMethod.replace('_', ' ')}
                          {card && ` (${card.name})`}
                          {account && ` (${account.name})`}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{formatDateBR(tx.date)}</td>

                      <td className="p-3.5 font-extrabold text-sm">
                        <span className={tx.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}>
                          {tx.type === 'receita' ? '+' : '-'} {fmt(tx.amount)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() =>
                            onUpdateTransactionStatus(
                              tx.id,
                              tx.status === 'pago' ? 'pendente' : 'pago'
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                            tx.status === 'pago'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {tx.status === 'pago' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Pendente</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedTxForDetail(tx)}
                            title="Ver Comprovante"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir lançamento "${tx.description}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Excluir"
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Receipt Modal */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200">Comprovante de Lançamento</span>
              <button
                onClick={() => setSelectedTxForDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-1 py-2">
              <span
                className={`inline-block p-3 rounded-full ${
                  selectedTxForDetail.type === 'receita' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}
              >
                <Receipt className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-extrabold text-slate-100">{fmt(selectedTxForDetail.amount)}</h3>
              <p className="text-xs font-semibold text-slate-300">{selectedTxForDetail.description}</p>
            </div>

            <div className="space-y-2 bg-slate-800/60 p-3 rounded-xl text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Data:</span>
                <span className="text-slate-200 font-mono">{formatDateBR(selectedTxForDetail.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Categoria:</span>
                <span className="text-slate-200">{selectedTxForDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Método:</span>
                <span className="text-slate-200 uppercase">{selectedTxForDetail.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold capitalize">{selectedTxForDetail.status}</span>
              </div>
              {selectedTxForDetail.pixKey && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Chave PIX:</span>
                  <span className="text-slate-200">{selectedTxForDetail.pixKey}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTxForDetail(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
