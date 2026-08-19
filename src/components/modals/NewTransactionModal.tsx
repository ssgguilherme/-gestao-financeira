import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard as CardIcon, Wallet, Layers, Plus } from 'lucide-react';
import { BankAccount, CreditCard, Category } from '../../types';
import { getTodayISO } from '../../utils/dateUtils';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: BankAccount[];
  cards: CreditCard[];
  categories: Category[];
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'fb_1', userId: 'system', name: 'Mercado', type: 'despesa', color: '#22C55E', icon: 'ShoppingCart' },
  { id: 'fb_2', userId: 'system', name: 'Alimentação / Restaurante', type: 'despesa', color: '#EC4899', icon: 'Utensils' },
  { id: 'fb_3', userId: 'system', name: 'Combustível & Transporte', type: 'despesa', color: '#F59E0B', icon: 'Fuel' },
  { id: 'fb_4', userId: 'system', name: 'Aluguel & Casa', type: 'despesa', color: '#EF4444', icon: 'Home' },
  { id: 'fb_5', userId: 'system', name: 'Academia & Saúde', type: 'despesa', color: '#06B6D4', icon: 'Activity' },
  { id: 'fb_6', userId: 'system', name: 'Streaming & Eletrônicos', type: 'despesa', color: '#8B5CF6', icon: 'Tv' },
  { id: 'fb_7', userId: 'system', name: 'Salário & Renda', type: 'receita', color: '#10B981', icon: 'Briefcase' },
  { id: 'fb_8', userId: 'system', name: 'Freelancer / Serviços', type: 'receita', color: '#3B82F6', icon: 'Code' },
  { id: 'fb_9', userId: 'system', name: 'Investimentos', type: 'ambos', color: '#6366F1', icon: 'TrendingUp' },
  { id: 'fb_10', userId: 'system', name: 'Outros', type: 'ambos', color: '#64748B', icon: 'HelpCircle' }
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accounts = [],
  cards = [],
  categories = []
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'receita' | 'despesa' | 'investimento'>('despesa');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [observation, setObservation] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('1');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Combine user categories + fallback if user categories empty
  const allCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  // Filter categories by transaction type
  const availableCategories = allCategories.filter((c) => {
    if (!c.type || c.type === 'ambos') return true;
    if (type === 'despesa') return c.type === 'despesa';
    if (type === 'receita') return c.type === 'receita';
    return true; // transferencia or investimento
  });

  // Auto-sync states when modal opens or selections change
  useEffect(() => {
    if (!isOpen) return;

    // Account auto-select
    if (accounts.length > 0 && (!accountId || !accounts.some((a) => a.id === accountId))) {
      setAccountId(accounts[0].id);
    }

    // Card auto-select
    if (cards.length > 0 && (!cardId || !cards.some((c) => c.id === cardId))) {
      setCardId(cards[0].id);
    }

    // Category auto-select if current category is not in available list
    const categoryExists = availableCategories.some((c) => c.name === category);
    if (!isCustomCat && (!category || !categoryExists)) {
      setCategory(availableCategories[0]?.name || 'Outros');
    }
  }, [isOpen, type, paymentMethod, accounts, cards, categories, availableCategories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor, informe a descrição do lançamento.');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, informe um valor maior que zero.');
      return;
    }
    if (!date) {
      alert('Por favor, selecione uma data válida.');
      return;
    }

    const finalCategory = isCustomCat ? customCategory.trim() : category;
    if (!finalCategory) {
      alert('Por favor, selecione ou digite uma categoria.');
      return;
    }

    if (paymentMethod === 'cartao_credito' && cards.length > 0 && !cardId) {
      alert('Por favor, selecione o cartão de crédito.');
      return;
    }

    if (paymentMethod !== 'cartao_credito' && accounts.length > 0 && !accountId) {
      alert('Por favor, selecione a conta bancária.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        description: description.trim(),
        amount: numAmount,
        type,
        paymentMethod,
        category: finalCategory,
        accountId: paymentMethod === 'cartao_credito' ? undefined : (accountId || accounts[0]?.id),
        cardId: paymentMethod === 'cartao_credito' ? (cardId || cards[0]?.id) : undefined,
        date,
        status,
        observation: observation.trim(),
        pixKey: pixKey.trim(),
        installmentsCount: paymentMethod === 'cartao_credito' ? Number(installmentsCount) : 1
      });

      // Reset fields
      setDescription('');
      setAmount('');
      setObservation('');
      setPixKey('');
      setIsCustomCat(false);
      setCustomCategory('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar lançamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Novo Lançamento Financeiro</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex space-x-1">
          {[
            { id: 'despesa', label: 'Despesa', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
            { id: 'receita', label: 'Receita', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            { id: 'investimento', label: 'Investimento', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setType(t.id as any);
                setIsCustomCat(false);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                type === t.id
                  ? `${t.color} border-opacity-100 font-bold shadow-sm`
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {type === 'receita' ? (
            /* Simplified Form for Receita */
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Registre a entrada de valores (ex: Salário, Freelance, Rendimentos, Vendas).</span>
              </div>

              {/* Tipo de Receita & Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Tipo / Descrição da Receita
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Salário Mensal, Projeto Freelance, Venda..."
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Categoria & Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categoria</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCat(!isCustomCat)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCustomCat ? 'Escolher existente' : 'Nova Categoria'}</span>
                    </button>
                  </div>

                  {isCustomCat ? (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Digite o nome da categoria..."
                      className="w-full bg-slate-800 border border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomCat(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="__NEW__">+ Outra / Digitar nova categoria...</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Data do Recebimento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Conta Bancária de Destino & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Conta de Destino</label>
                  {accounts.length > 0 ? (
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-[11px] text-slate-400">
                      Conta principal padrão.
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="pago">Recebido / Concluído</option>
                    <option value="pendente">Pendente / A Receber</option>
                  </select>
                </div>
              </div>

              {/* Observation (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observações (Opcional)</label>
                <textarea
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Anotações adicionais sobre esta receita..."
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>
            </div>
          ) : (
            /* Standard Form for Despesa & Investimento */
            <>
              {/* Description & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descrição</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Supermercado, Netflix, Combustível"
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="dinheiro">Dinheiro / Espécie</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Data do Lançamento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Account or Card Picker */}
              {paymentMethod === 'cartao_credito' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cartão de Crédito</label>
                    {cards.length > 0 ? (
                      <select
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.bank}) - Disp: R$ {c.availableLimit.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                        Nenhum cartão cadastrado. O lançamento será registrado no histórico.
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Parcelamento</label>
                    <select
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="1">À vista (1x)</option>
                      {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map((num) => (
                        <option key={num} value={num}>
                          {num}x de R$ {amount && !isNaN(Number(amount)) ? (Number(amount) / num).toFixed(2) : '0,00'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Conta Bancária</label>
                  {accounts.length > 0 ? (
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bankName}) - Saldo: R$ {acc.balance.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
                      Conta principal padrão.
                    </div>
                  )}
                </div>
              )}

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categoria</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCat(!isCustomCat)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCustomCat ? 'Escolher existente' : 'Nova Categoria'}</span>
                    </button>
                  </div>

                  {isCustomCat ? (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Digite o nome da categoria..."
                      className="w-full bg-slate-800 border border-emerald-500/60 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomCat(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="__NEW__">+ Outra / Digitar nova categoria...</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="pago">Concluído / Pago</option>
                    <option value="pendente">Pendente / Agendado</option>
                  </select>
                </div>
              </div>

              {/* PIX Key if applicable */}
              {paymentMethod === 'pix' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Chave PIX (Opcional)</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, E-mail, Telefone ou Aleatória"
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              )}

              {/* Observation */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observações / Anotações</label>
                <textarea
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Notas adicionais sobre este lançamento..."
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
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
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <span>Registrar Lançamento</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
