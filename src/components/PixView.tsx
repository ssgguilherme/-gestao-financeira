import React, { useState } from 'react';
import { PixKey, BankAccount } from '../types/finance';
import { api } from '../services/api';
import {
  QrCode,
  Send,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  X,
  FileCheck2,
  Share2
} from 'lucide-react';

interface PixViewProps {
  pixKeys: PixKey[];
  accounts: BankAccount[];
  onRefresh: () => void;
  isDarkMode: boolean;
}

export const PixView: React.FC<PixViewProps> = ({
  pixKeys,
  accounts,
  onRefresh,
  isDarkMode
}) => {
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Key Form
  const [newKey, setNewKey] = useState('');
  const [newKeyType, setNewKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('email');
  const [newKeyAccount, setNewKeyAccount] = useState(accounts[0]?.id || '');

  // Transfer Form
  const [targetKey, setTargetKey] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceAccount, setSourceAccount] = useState(accounts[0]?.id || '');
  const [description, setDescription] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Receipt Modal
  const [receipt, setReceipt] = useState<any | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    try {
      await api.createPixKey(newKey.trim(), newKeyType, newKeyAccount || accounts[0]?.id);
      setIsAddKeyOpen(false);
      setNewKey('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar chave Pix.');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setTransferError('Informe um valor válido e positivo.');
      return;
    }

    if (!targetKey.trim()) {
      setTransferError('Informe a chave Pix de destino.');
      return;
    }

    const selectedAcc = accounts.find((a) => a.id === sourceAccount);
    if (selectedAcc && selectedAcc.balance < parsed) {
      setTransferError(`Saldo insuficiente na conta ${selectedAcc.name}. Saldo: ${formatCurrency(selectedAcc.balance)}`);
      return;
    }

    setIsTransferring(true);
    try {
      const res = await api.transferPix(targetKey.trim(), parsed, sourceAccount, description.trim() || undefined);
      setReceipt(res.receipt);
      setTargetKey('');
      setAmount('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      setTransferError(err.message || 'Erro ao enviar Pix.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-teal-400" />
          <span>Área PIX Instantâneo</span>
        </h1>
        <p className="text-xs text-slate-400">
          Transferências instantâneas com débito em conta corrente e recibo criptografado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transfer Simulator */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Send className="w-4 h-4 text-teal-400" />
            <span>Fazer uma Transferência PIX</span>
          </div>

          {transferError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{transferError}</span>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Chave PIX de Destino *</label>
              <input
                type="text"
                value={targetKey}
                onChange={(e) => setTargetKey(e.target.value)}
                placeholder="E-mail, CPF, celular ou chave aleatória..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor do PIX (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Debitar da Conta *</label>
                <select
                  value={sourceAccount}
                  onChange={(e) => setSourceAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} - Saldo: {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Descrição ou Mensagem (Opcional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Almoço de domingo, Pagamento serviço..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isTransferring}
                className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isTransferring ? 'Processando envio...' : 'Confirmar e Enviar PIX'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Minhas Chaves Pix */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">Minhas Chaves</span>
              <button
                type="button"
                onClick={() => setIsAddKeyOpen(true)}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Chave</span>
              </button>
            </div>

            <div className="space-y-2">
              {pixKeys.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhuma chave Pix cadastrada.
                </div>
              ) : (
                pixKeys.map((k) => (
                  <div
                    key={k.id}
                    className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-teal-400">{k.type}</div>
                      <div className="text-xs font-mono font-bold text-white truncate">{k.key}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(k.id, k.key)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
                      title="Copiar chave"
                    >
                      {copiedId === k.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-teal-400 mt-0.5" />
            <span>Transferências Pix são processadas instantaneamente 24h por dia com validação anti-fraude.</span>
          </div>
        </div>
      </div>

      {/* Modal Nova Chave */}
      {isAddKeyOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsAddKeyOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white mb-1">Cadastrar Chave PIX</h2>
            <p className="text-xs text-slate-400 mb-4">Cadastre sua chave para receber transferências.</p>

            <form onSubmit={handleCreateKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo de Chave</label>
                <select
                  value={newKeyType}
                  onChange={(e: any) => setNewKeyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF</option>
                  <option value="phone">Telefone Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Chave *</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Informe o valor da chave..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddKeyOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Salvar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Comprovante Pix */}
      {receipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center space-y-4">
            <button onClick={() => setReceipt(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Comprovante de Transferência PIX</h3>
              <p className="text-xs text-slate-400">Transação concluída com sucesso!</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Pago:</span>
                <span className="font-black text-emerald-400 text-sm">{formatCurrency(receipt.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destinatário:</span>
                <span className="font-mono text-white truncate max-w-[160px]">{receipt.targetKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Conta Débito:</span>
                <span className="text-white">{receipt.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Autenticação:</span>
                <span className="font-mono text-[10px] text-slate-300">{receipt.authCode}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Fechar Comprovante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
