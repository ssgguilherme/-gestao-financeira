import React from 'react';
import { CalendarDays, DollarSign, Calendar, Layers } from 'lucide-react';
import { Transaction } from '../types';
import { formatDateBR } from '../utils/dateUtils';

interface InstallmentsViewProps {
  transactions: Transaction[];
}

export const InstallmentsView: React.FC<InstallmentsViewProps> = ({ transactions = [] }) => {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Group transactions with installment info
  const installmentTx = safeTransactions.filter((t) => t.installment);

  // Parent groups
  const parentMap: { [key: string]: Transaction[] } = {};
  installmentTx.forEach((tx) => {
    const parentKey = tx.installment?.parentTransactionId || tx.id;
    if (!parentMap[parentKey]) parentMap[parentKey] = [];
    parentMap[parentKey].push(tx);
  });

  const activeInstallmentPurchases = Object.keys(parentMap).map((key) => {
    const items = parentMap[key];
    const first = items[0];
    const totalCount = first.installment?.totalInstallments || 1;
    const paidItems = items.filter((i) => i.status === 'pago');
    const totalAmount = (first.installment?.installmentAmount || first.amount) * totalCount;
    const paidAmount = paidItems.reduce((s, i) => s + i.amount, 0);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const currentNum = paidItems.length;

    return {
      key,
      description: first.description.replace(/\s\(\d+\/\d+\)/, ''),
      category: first.category,
      totalCount,
      paidCount: currentNum,
      remainingCount: Math.max(0, totalCount - currentNum),
      installmentAmount: first.installment?.installmentAmount || first.amount,
      totalAmount,
      paidAmount,
      remainingAmount,
      nextDueDate: items.find((i) => i.status === 'pendente')?.date || 'Concluído'
    };
  });

  const totalRemainingInInstallments = activeInstallmentPurchases.reduce(
    (s, p) => s + p.remainingAmount,
    0
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Controle de Compras
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Parcelamentos em Aberto</h1>
          <p className="text-xs text-slate-400">
            Total restante comprometido em compras parceladas: <strong className="text-purple-400 font-extrabold">{fmt(totalRemainingInInstallments)}</strong>
          </p>
        </div>
      </div>

      {/* Grid of Installments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeInstallmentPurchases.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            Nenhum parcelamento ativo encontrado.
          </div>
        ) : (
          activeInstallmentPurchases.map((item) => {
            const pct = Math.round((item.paidCount / item.totalCount) * 100);

            return (
              <div
                key={item.key}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{item.description}</h3>
                    <p className="text-[11px] text-slate-400">{item.category}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-extrabold border border-purple-500/30">
                    {item.paidCount} / {item.totalCount} parcelas
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{pct}% Quitado ({fmt(item.paidAmount)})</span>
                    <span>Restante: {fmt(item.remainingAmount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Valor da Parcela</span>
                    <span className="font-bold text-slate-100">{fmt(item.installmentAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Próximo Vencimento</span>
                    <span className="font-bold text-amber-400">
                      {item.nextDueDate === 'Concluído' ? 'Concluído' : formatDateBR(item.nextDueDate)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
