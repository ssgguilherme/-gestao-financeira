import React, { useState } from 'react';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson
} from 'lucide-react';

interface ReportsViewProps {
  onRefreshAll: () => void;
  isDarkMode: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onRefreshAll }) => {
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportJson = async () => {
    try {
      setIsExportingJson(true);
      const blob = await api.downloadBackupJson();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finanflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Backup exportado com sucesso!'
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Falha ao baixar arquivo de backup.'
      });
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      const blob = await api.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Extrato CSV gerado com sucesso!'
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Falha ao exportar CSV.'
      });
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('Deseja restaurar os dados deste arquivo de backup na sua conta?')) {
      event.target.value = '';
      return;
    }

    setIsRestoring(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        const res = await api.restoreBackup(parsed);

        setStatusMessage({
          type: 'success',
          text: res.message || 'Dados restaurados com sucesso!'
        });

        onRefreshAll();
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Erro na restauração: ${err.message || 'Arquivo inválido.'}`
        });
      } finally {
        setIsRestoring(false);
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setIsRestoring(false);
      setStatusMessage({
        type: 'error',
        text: 'Erro ao ler o arquivo selecionado.'
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          <span>Relatórios & Backup</span>
        </h1>
        <p className="text-xs text-slate-400">
          Exporte uma cópia dos seus dados para guardar no seu computador ou celular e baixe extratos em planilha.
        </p>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          )}
          <div className="text-xs font-semibold leading-relaxed">{statusMessage.text}</div>
        </div>
      )}

      {/* Grid: Backup & Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Exportar Backup (JSON) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Salvar Cópia dos Dados (Backup JSON)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Baixe um arquivo seguro contendo todas as suas contas bancárias, cartões de crédito, transações, metas e orçamentos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={isExportingJson}
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingJson ? 'Gerando Backup...' : 'Baixar Backup (JSON)'}</span>
          </button>
        </div>

        {/* Card 2: Restaurar Backup (JSON) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Restaurar Cópia Salva</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Envie um arquivo de backup previamente salvo para carregar suas contas e movimentações de volta ao sistema.
            </p>
          </div>

          <label className="w-full py-3 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isRestoring ? 'Restaurando...' : 'Carregar Arquivo de Backup'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              disabled={isRestoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Card 3: Extrato CSV */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white">Exportação de Extrato para Planilha (CSV)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Baixe seu extrato formatado para abrir no Excel, Google Planilhas ou LibreOffice.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingCsv ? 'Exportando...' : 'Exportar Extrato (CSV)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
