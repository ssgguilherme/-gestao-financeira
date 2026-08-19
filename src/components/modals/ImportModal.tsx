import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (parsedTransactions: any[]) => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [fileContent, setFileContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const parsed = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip CSV header if contains "Data" or "Date"
      if (i === 0 && (line.toLowerCase().includes('data') || line.toLowerCase().includes('date') || line.toLowerCase().includes('valor'))) {
        continue;
      }

      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        // Assume format: Date, Description, Amount, Category (optional)
        const date = parts[0].length === 10 ? parts[0] : new Date().toISOString().split('T')[0];
        const description = parts[1] || 'Lançamento Importado';
        const rawAmount = parts[2] ? parseFloat(parts[2].replace(',', '.')) : 0;
        const amount = Math.abs(rawAmount) || 50;
        const type = rawAmount < 0 ? 'despesa' : 'receita';
        const category = parts[3] || 'Outros';

        parsed.push({
          date,
          description,
          amount,
          type,
          category,
          status: 'pago'
        });
      }
    }
    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      const items = parseCSV(text);
      setParsedPreview(items);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = `2026-08-01,"Supermercado Extra",-340.50,"Mercado"
2026-08-02,"Posto Shell Gasolina",-180.00,"Combustível"
2026-08-03,"Pagamento Cliente Freelance",1500.00,"Freelancer"
2026-08-04,"Farmácia Raia",-65.40,"Academia & Saúde"`;
    setFileContent(sample);
    setParsedPreview(parseCSV(sample));
  };

  const handleSubmit = async () => {
    if (parsedPreview.length === 0) {
      alert('Nenhum lançamento válido detectado. Carregue um arquivo CSV ou exemplo.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parsedPreview);
      setFileContent('');
      setParsedPreview([]);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao importar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <span>Importar Extrato Bancário (CSV / OFX)</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* File drop zone */}
          <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-800/40 transition-colors">
            <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">Arraste seu arquivo CSV/OFX ou clique para procurar</p>
            <p className="text-[11px] text-slate-400 mt-1">Formatos suportados: CSV (Data, Descrição, Valor, Categoria)</p>
            <input
              type="file"
              accept=".csv,.ofx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="inline-block mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl border border-slate-700 cursor-pointer transition-colors"
            >
              Selecionar Arquivo
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ou use dados de teste</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              Carregar Exemplo de Extrato
            </button>
          </div>

          {/* Preview list */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pré-visualização ({parsedPreview.length} itens)</span>
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto bg-slate-800/60 rounded-xl p-2 space-y-1.5 border border-slate-700/60 custom-scrollbar">
                {parsedPreview.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-800 rounded-lg">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-200 truncate">{item.description}</p>
                      <p className="text-[10px] text-slate-400">{item.date} • {item.category}</p>
                    </div>
                    <span className={`font-bold shrink-0 ${item.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.type === 'receita' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-end space-x-3 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || parsedPreview.length === 0}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {loading ? 'Importando...' : `Confirmar Importação (${parsedPreview.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
