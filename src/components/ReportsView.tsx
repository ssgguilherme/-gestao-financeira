import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, FileText, Database, ShieldCheck, RefreshCw } from 'lucide-react';

interface ReportsViewProps {
  onExportCSV: () => void;
  onOpenImportModal: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (jsonString: string) => Promise<void>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onExportCSV,
  onOpenImportModal,
  onDownloadBackup,
  onRestoreBackup
}) => {
  const [backupFileContent, setBackupFileContent] = useState('');
  const [restoring, setRestoring] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setBackupFileContent(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!backupFileContent) return;
    if (!confirm('Atenção: A restauração de backup irá sobrescrever seus dados atuais. Deseja continuar?')) return;

    setRestoring(true);
    try {
      await onRestoreBackup(backupFileContent);
      alert('Backup restaurado com sucesso!');
      setBackupFileContent('');
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar backup.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Exportação & Backup
          </span>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Relatórios e Gerenciamento de Dados</h1>
          <p className="text-xs text-slate-400">
            Exporte seus extratos, importe planilhas de bancos ou restaure backups em JSON.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CSV/Excel Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Exportar Planilha (CSV)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Baixe todos os seus lançamentos em formato CSV compatível com Excel e Google Sheets.
            </p>
          </div>
          <button
            onClick={onExportCSV}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Extrato CSV</span>
          </button>
        </div>

        {/* Bank Import */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Importar Extrato Bancário</h3>
            <p className="text-xs text-slate-400 mt-1">
              Carregue arquivos de extrato CSV ou OFX exportados diretamente do seu banco.
            </p>
          </div>
          <button
            onClick={onOpenImportModal}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importar CSV/OFX</span>
          </button>
        </div>

        {/* Complete Backup Download */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Backup Completo do Sistema</h3>
            <p className="text-xs text-slate-400 mt-1">
              Faça o download de todos os seus dados em um único arquivo JSON seguro.
            </p>
          </div>
          <button
            onClick={onDownloadBackup}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo JSON</span>
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-amber-400" />
          <span>Restaurar Dados a Partir de Backup</span>
        </h2>
        <p className="text-xs text-slate-400">
          Se você possui um arquivo de backup em JSON gerado anteriormente pelo FinanFlow, você pode enviá-lo para restaurar todos os seus lançamentos, contas, cartões e metas.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
          />
          {backupFileContent && (
            <button
              onClick={handleConfirmRestore}
              disabled={restoring}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
            >
              {restoring ? 'Restaurando...' : 'Confirmar Restauração'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
