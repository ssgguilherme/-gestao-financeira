import React, { useState } from 'react';
import { QrCode, ArrowUpRight, ArrowDownRight, Copy, Check, Send } from 'lucide-react';
import { Transaction, BankAccount } from '../types';

interface PixViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onSendPix: (amount: number, description: string, key: string, accountId: string) => Promise<void>;
}

export const PixView: React.FC<PixViewProps> = ({ transactions = [], accounts = [], onSendPix }) => {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const [pixKey, setPixKey] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(safeAccounts[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const pixTransactions = safeTransactions.filter((t) => t.paymentMethod === 'pix');

  const myPixKey = 'carlos.eduardo@finanflow.com.br';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(myPixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !pixKey) return;

    setLoading(true);
    try {
      await onSendPix(Number(amount), description || `PIX para ${pixKey}`, pixKey, accountId);
      setAmount('');
      setPixKey('');
      setDescription('');
      alert('Transferência PIX realizada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar PIX.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl transition-colors">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-[#e2f163] uppercase tracking-widest bg-emerald-50 dark:bg-[#e2f163]/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-[#e2f163]/20">
            Transferências Instantâneas
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">Área PIX</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Envie PIX instantâneo, consulte chaves cadastradas e acompanhe o extrato.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Pix Card */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Send className="w-4 h-4 text-emerald-600 dark:text-[#e2f163]" />
            <span>Realizar Transferência PIX</span>
          </h2>

          <form onSubmit={handleTransfer} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chave PIX de Destino</label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, celular ou chave aleatória"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Débito na Conta</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({fmt(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição / Motivo</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Almoço"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#e2f163] hover:bg-[#d4e350] text-[#0b0e14] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2"
            >
              {loading ? 'Enviando...' : 'Transferir Agora'}
            </button>
          </form>
        </div>

        {/* My Pix Keys Card */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-emerald-600 dark:text-[#e2f163]" />
            <span>Sua Chave PIX Principal</span>
          </h2>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Copie e compartilhe para receber pagamentos:</p>
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#4ade80] truncate">{myPixKey}</span>
              <button
                onClick={handleCopyKey}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 ml-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-[#4ade80]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <p className="text-[10px] text-emerald-600 dark:text-[#4ade80] font-semibold">Chave copiada para a área de transferência!</p>}
          </div>
        </div>

        {/* PIX Transactions List */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 lg:col-span-3 transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Histórico de PIX (Enviados & Recebidos)</h2>

          <div className="space-y-2">
            {pixTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhuma transação PIX registrada.</p>
            ) : (
              pixTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl text-xs font-bold ${tx.type === 'receita' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                      {tx.type === 'receita' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.date} • {tx.pixKey ? `Chave: ${tx.pixKey}` : 'PIX'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${tx.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {tx.type === 'receita' ? '+' : '-'} {fmt(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
