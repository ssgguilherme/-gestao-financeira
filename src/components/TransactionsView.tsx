import React, { useState } from 'react';
import { Transaction, BankAccount, CreditCard } from '../types/finance';
import { api } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Trash2,
  Calendar,
  Tag,
  CreditCard as CardIcon,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onRefresh: () => void;
  isDarkMode: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  cards,
  onRefresh,
  isDarkMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [category, setCategory] = useState('Alimentação & Supermercado');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [cardId, setCardId] = useState('');
  const [destinationType, setDestinationType] = useState<'account' | 'card'>('account');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'debit' | 'credit' | 'transfer' | 'cash' | 'boleto'>('pix');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered transactions
  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.observation && tx.observation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await api.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finanflow-extrato-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setExportNotice('Extrato CSV baixado com sucesso!');
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      alert('Falha ao exportar CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Informe um valor válido e positivo.');
      return;
    }

    if (!description.trim()) {
      setFormError('Informe uma descrição para o lançamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
        paymentMethod: destinationType === 'card' ? 'credit' : paymentMethod,
        accountId: destinationType === 'account' ? accountId : undefined,
        cardId: destinationType === 'card' ? cardId : undefined,
        status: 'completed',
        observation: observation.trim() || undefined
      });

      // Limpa formulário
      setDescription('');
      setAmount('');
      setObservation('');
      setIsNewTxModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar transação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;
    try {
      await api.deleteTransaction(id);
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir transação.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Extrato & Transações</h1>
          <p className="text-xs text-slate-400">
            Histórico completo de entradas, saídas e transferências.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/60 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Exportando...' : 'Exportar CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewTxModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Export Notice Banner */}
      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, categoria ou observação..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto">
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'income', label: 'Receitas' },
                { id: 'expense', label: 'Despesas' },
                { id: 'transfer', label: 'Transf.' }
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Lançamento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Conta / Cartão</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const card = cards.find((c) => c.id === tx.cardId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Descrição & Tipo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                          <div>
                            <div className="font-bold text-white">{tx.description}</div>
                            {tx.observation && (
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">{tx.observation}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold">
                          {tx.category}
                        </span>
                      </td>

                      {/* Conta ou Cartão */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {card ? (
                          <span className="text-purple-400 font-medium">💳 {card.name}</span>
                        ) : account ? (
                          <span className="text-slate-300 font-medium">🏦 {account.name}</span>
                        ) : (
                          <span className="text-slate-500">Sem vínculo</span>
                        )}
                      </td>

                      {/* Data */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Valor */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-black ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Transação */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsNewTxModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-1">Novo Lançamento</h2>
            <p className="text-xs text-slate-400 mb-4">Adicione uma receita, despesa ou transferência à sua conta.</p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTx} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setType('transfer')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    type === 'transfer' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Transferência
                </button>
              </div>

              {/* Descrição & Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Descrição *</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Supermercado, Salário..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Categoria & Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Alimentação & Supermercado">Alimentação & Supermercado</option>
                    <option value="Moradia & Contas">Moradia & Contas</option>
                    <option value="Transporte & Combustível">Transporte & Combustível</option>
                    <option value="Salário & Renda">Salário & Renda</option>
                    <option value="Rendimentos">Rendimentos</option>
                    <option value="Freelance & Extras">Freelance & Extras</option>
                    <option value="Saúde & Farmácia">Saúde & Farmácia</option>
                    <option value="Lazer & Viagens">Lazer & Viagens</option>
                    <option value="Compras & Assinaturas">Compras & Assinaturas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Destino: Conta ou Cartão */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Origem / Destino</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setDestinationType('account')}
                    className={`py-1.5 rounded-xl text-xs font-semibold border ${
                      destinationType === 'account'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Conta Bancária
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationType('card')}
                    className={`py-1.5 rounded-xl text-xs font-semibold border ${
                      destinationType === 'card'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    Cartão de Crédito
                  </button>
                </div>

                {destinationType === 'account' ? (
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (Saldo: {formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Selecione o Cartão...</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Final {c.last4} (Disp: {formatCurrency(c.availableLimit)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Observação */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Observação (Opcional)</label>
                <input
                  type="text"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                >
                  {isSubmitting ? 'Salvando...' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
