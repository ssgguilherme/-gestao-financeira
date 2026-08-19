import React, { useState } from 'react';
import { X, CreditCard as CardIcon } from 'lucide-react';
import { CardBrand } from '../../types';

interface NewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const NewCardModal: React.FC<NewCardModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('Nubank');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('15');
  const [dueDay, setDueDay] = useState('22');
  const [color, setColor] = useState('#820AD1');
  const [brand, setBrand] = useState<CardBrand>('mastercard');
  const [lastDigits, setLastDigits] = useState('4928');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { name: 'Nubank Roxinho', bank: 'Nubank', color: '#820AD1', brand: 'mastercard' },
    { name: 'Inter Black', bank: 'Banco Inter', color: '#1E293B', brand: 'mastercard' },
    { name: 'Ourocard Visa', bank: 'Banco do Brasil', color: '#1E3A8A', brand: 'visa' },
    { name: 'Bradesco Elo', bank: 'Bradesco', color: '#991B1B', brand: 'elo' }
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setBank(p.bank);
    setColor(p.color);
    setBrand(p.brand as CardBrand);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !limit) return;

    setLoading(true);
    try {
      await onSubmit({
        name,
        bank,
        limit: Number(limit),
        availableLimit: Number(limit),
        closingDay: Number(closingDay),
        dueDay: Number(dueDay),
        color,
        brand,
        lastDigits
      });
      setName('');
      setLimit('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar cartão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <CardIcon className="w-5 h-5 text-emerald-400" />
            <span>Cadastrar Cartão de Crédito</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Atalhos de Cartões</label>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center space-x-2 border border-slate-700/60 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nome do Cartão</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank Roxinho, Inter Black"
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Banco Emissor</label>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Nubank, Inter"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bandeira</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as CardBrand)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
                <option value="elo">Elo</option>
                <option value="amex">American Express</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Limite Total (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="5000,00"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fechamento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                placeholder="Dia 15"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="Dia 22"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Últimos 4 Dígitos</label>
              <input
                type="text"
                maxLength={4}
                value={lastDigits}
                onChange={(e) => setLastDigits(e.target.value)}
                placeholder="4928"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cor do Cartão</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-slate-300">{color}</span>
              </div>
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
              {loading ? 'Salvando...' : 'Cadastrar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
