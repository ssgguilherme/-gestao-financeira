import React, { useState } from 'react';
import { X, CreditCard, Wallet, DollarSign, CheckCircle2 } from 'lucide-react';
import { BankAccount, CreditCard as CreditCardType } from '../../types';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCardType | null;
  accounts: BankAccount[];
  onSubmit: (cardId: string, accountId: string, amount: number) => Promise<void>;
}

export const PayBillModal: React.FC<PayBillModalProps> = ({
  isOpen,
  onClose,
  card,
  accounts,
  onSubmit
}) => {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !card) return null;

  const currentBillAmount = Math.max(0, card.limit - card.availableLimit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = amount ? Number(amount) : currentBillAmount;
    if (!numAmt || numAmt <= 0) return;

    setLoading(true);
    try {
      await onSubmit(card.id, accountId || accounts[0]?.id, numAmt);
      setAmount('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao pagar fatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Pagar Fatura do Cartão</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Cartão:</span>
              <span className="text-xs font-bold text-slate-100">{card.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Fatura Atual:</span>
              <span className="text-sm font-extrabold text-red-400">R$ {currentBillAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Vencimento:</span>
              <span>Dia {card.dueDay}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Conta de Débito</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} - Saldo: R$ {a.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Valor a Pagar (R$)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue={currentBillAmount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currentBillAmount.toFixed(2)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <p className="text-[10px] text-slate-400">Você pode pagar o valor total da fatura ou um valor parcial.</p>
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
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
