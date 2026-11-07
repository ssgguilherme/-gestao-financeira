import React, { useState } from 'react';
import { BankAccount, CreditCard } from '../types/finance';
import { api } from '../services/api';
import {
  CreditCard as CardIcon,
  Building2,
  Wallet,
  Plus,
  CheckCircle2,
  ShieldCheck,
  X,
  Calendar,
  Lock
} from 'lucide-react';

interface AccountsCardsViewProps {
  accounts: BankAccount[];
  cards: CreditCard[];
  onRefresh: () => void;
  isDarkMode: boolean;
}

export const AccountsCardsView: React.FC<AccountsCardsViewProps> = ({
  accounts,
  cards,
  onRefresh,
  isDarkMode
}) => {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  // New Account Form
  const [accName, setAccName] = useState('');
  const [accBank, setAccBank] = useState('');
  const [accType, setAccType] = useState<'checking' | 'savings' | 'wallet'>('checking');
  const [accBalance, setAccBalance] = useState('');
  const [accColor, setAccColor] = useState('#3b82f6');

  // New Card Form
  const [cardName, setCardName] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState<'mastercard' | 'visa' | 'elo'>('mastercard');
  const [cardLimit, setCardLimit] = useState('');
  const [cardClosingDay, setCardClosingDay] = useState('5');
  const [cardDueDay, setCardDueDay] = useState('12');
  const [cardColor, setCardColor] = useState('#820ad1');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || !accBank.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createAccount({
        name: accName.trim(),
        bank: accBank.trim(),
        type: accType,
        balance: parseFloat(accBalance.replace(',', '.')) || 0,
        color: accColor
      });
      setIsAddAccountOpen(false);
      setAccName('');
      setAccBank('');
      setAccBalance('');
      onRefresh();
    } catch (err) {
      alert('Erro ao cadastrar conta bancária.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardLast4.trim() || !cardLimit) return;

    setIsSubmitting(true);
    try {
      await api.createCard({
        name: cardName.trim(),
        last4: cardLast4.trim(),
        brand: cardBrand,
        limit: parseFloat(cardLimit.replace(',', '.')) || 0,
        closingDay: parseInt(cardClosingDay) || 5,
        dueDay: parseInt(cardDueDay) || 12,
        color: cardColor
      });
      setIsAddCardOpen(false);
      setCardName('');
      setCardLast4('');
      setCardLimit('');
      onRefresh();
    } catch (err) {
      alert('Erro ao cadastrar cartão de crédito.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: CONTAS BANCÁRIAS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Contas & Carteiras</span>
            </h2>
            <p className="text-xs text-slate-400">Controle de saldo em conta corrente, poupança e dinheiro físico.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{acc.bank}</div>
                  <div className="text-base font-black text-white">{acc.name}</div>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: acc.color }}
                >
                  <Building2 className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Saldo Disponível</div>
                <div className="text-2xl font-black text-emerald-400">{formatCurrency(acc.balance)}</div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="capitalize">{acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Carteira'}</span>
                <span className="text-emerald-400 font-bold">Ativa</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CARTÕES DE CRÉDITO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <CardIcon className="w-5 h-5 text-purple-400" />
              <span>Cartões de Crédito</span>
            </h2>
            <p className="text-xs text-slate-400">Acompanhe limites disponíveis, datas de fechamento e vencimento de faturas.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddCardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Cartão</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => {
            const used = card.limit - card.availableLimit;
            const usedPercent = Math.min(100, Math.round((used / card.limit) * 100));

            return (
              <div key={card.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                {/* Visual Card Face */}
                <div
                  className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-44"
                  style={{
                    background: `linear-gradient(135deg, ${card.color} 0%, #0f172a 100%)`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm tracking-wide">{card.name}</span>
                    <span className="text-xs font-black tracking-widest uppercase">{card.brand}</span>
                  </div>

                  {/* Chip & NFC symbol */}
                  <div className="w-9 h-7 rounded-md bg-amber-300/80 border border-amber-400/50 shadow-inner flex items-center justify-center">
                    <div className="w-5 h-3 border border-amber-600/40 rounded-sm" />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/70 uppercase tracking-wider">Número</div>
                      <div className="text-sm font-mono tracking-widest font-bold">•••• •••• •••• {card.last4}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/70 uppercase tracking-wider">Vencimento</div>
                      <div className="text-xs font-bold">Dia {card.dueDay}</div>
                    </div>
                  </div>
                </div>

                {/* Limit Progress & Details */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Limite Utilizado ({usedPercent}%)</span>
                    <span className="text-purple-400">{formatCurrency(used)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Limite Total: <strong className="text-white">{formatCurrency(card.limit)}</strong></span>
                    <span>Disponível: <strong className="text-emerald-400">{formatCurrency(card.availableLimit)}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>Fechamento da Fatura: <strong>Dia {card.closingDay}</strong></span>
                    <span>Vencimento: <strong>Dia {card.dueDay}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Account */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddAccountOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Nova Conta Bancária</h2>
            <p className="text-xs text-slate-400 mb-4">Adicione uma instituição ou carteira para gerenciar seu saldo.</p>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome da Conta *</label>
                <input
                  type="text"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Ex: Conta Principal Nubank"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Instituição Bancária *</label>
                <input
                  type="text"
                  value={accBank}
                  onChange={(e) => setAccBank(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Bradesco..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo de Conta</label>
                  <select
                    value={accType}
                    onChange={(e: any) => setAccType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="wallet">Carteira Física</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Card */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddCardOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Novo Cartão de Crédito</h2>
            <p className="text-xs text-slate-400 mb-4">Cadastre limites e datas de fatura para controle de crédito.</p>

            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome do Cartão *</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ex: Nubank Ultravioleta"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Últimos 4 Dígitos *</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    placeholder="1234"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Bandeira</label>
                  <select
                    value={cardBrand}
                    onChange={(e: any) => setCardBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="mastercard">Mastercard</option>
                    <option value="visa">Visa</option>
                    <option value="elo">Elo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Limite Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  placeholder="Ex: 10000.00"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Dia Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardClosingDay}
                    onChange={(e) => setCardClosingDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
