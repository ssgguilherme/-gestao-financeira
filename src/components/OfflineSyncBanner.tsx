import React, { useEffect, useState } from 'react';
import { offlineSync, SyncStatus } from '../services/offlineSync';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, Clock } from 'lucide-react';

export const OfflineSyncBanner: React.FC<{ onRefreshData: () => void }> = ({ onRefreshData }) => {
  const [status, setStatus] = useState<SyncStatus>(offlineSync.getStatus());
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const unsub = offlineSync.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    const unsubSync = offlineSync.onSyncComplete(() => {
      setShowSuccessToast(true);
      onRefreshData();
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    });

    return () => {
      unsub();
      unsubSync();
    };
  }, [onRefreshData]);

  // Se estiver offline: Banner informativo
  if (!status.isOnline) {
    return (
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-300 flex items-center justify-between gap-3 shadow-sm backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-amber-200">Modo Offline Ativo:</span>{' '}
            <span className="text-amber-300/90">
              Exibindo seus últimos dados carregados.{' '}
              {status.pendingCount > 0 ? (
                <strong>({status.pendingCount} alteração pendente salva no aparelho)</strong>
              ) : (
                'Qualquer alteração será salva no aparelho e enviada ao servidor ao conectar no Wi-Fi.'
              )}
            </span>
          </div>
        </div>

        {status.pendingCount > 0 && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
            {status.pendingCount} pendente(s)
          </span>
        )}
      </div>
    );
  }

  // Se estiver sincronizando alterações pendentes
  if (status.isSyncing) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-sm sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span className="font-bold">Wi-Fi conectado! Subindo {status.pendingCount} alteração(ões) para o servidor...</span>
        </div>
      </div>
    );
  }

  // Se tiver alterações pendentes enquanto online (esperando clique ou disparo de sync)
  if (status.pendingCount > 0) {
    return (
      <div className="bg-slate-900 border-b border-emerald-500/30 px-4 py-2 text-xs text-slate-200 flex items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Você tem <strong>{status.pendingCount} alteração(ões) salva(s) localmente</strong> aguardando envio.
          </span>
        </div>
        <button
          type="button"
          onClick={() => offlineSync.syncPendingMutations()}
          className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 transition-all"
        >
          <CloudUpload className="w-3 h-3" />
          <span>Sincronizar Agora</span>
        </button>
      </div>
    );
  }

  // Toast temporário de sucesso pós-sincronização
  if (showSuccessToast) {
    return (
      <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between gap-3 sticky top-0 z-40 animate-fadeIn">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">Conexão restabelecida! Todas as suas alterações offline foram sincronizadas com sucesso.</span>
        </div>
        <button
          type="button"
          onClick={() => setShowSuccessToast(false)}
          className="text-emerald-400 hover:text-white text-xs font-bold"
        >
          Fechar
        </button>
      </div>
    );
  }

  return null;
};
