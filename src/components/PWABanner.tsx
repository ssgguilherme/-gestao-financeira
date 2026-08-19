import React, { useState } from 'react';
import { Download, WifiOff, RefreshCw, Smartphone, X, Bell } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export const PWABanner: React.FC = () => {
  const {
    isInstallable,
    isOnline,
    updateAvailable,
    installApp,
    applyUpdate,
    requestNotifications,
    notificationPermission
  } = usePWA();

  const [dismissedInstall, setDismissedInstall] = useState(false);

  return (
    <div className="flex flex-col space-y-2 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-pulse">
          <div className="flex items-center space-y-0 space-x-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Modo Offline:</strong> Você está desconectado. As alterações locais serão sincronizadas ao reconectar.
            </span>
          </div>
        </div>
      )}

      {/* Update Available Alert */}
      {updateAvailable && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm shadow-lg shadow-emerald-950/20">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            <span>
              <strong>Nova versão disponível!</strong> Atualize agora para carregar as últimas melhorias do app.
            </span>
          </div>
          <button
            onClick={applyUpdate}
            className="ml-3 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs transition-colors shrink-0"
          >
            Atualizar
          </button>
        </div>
      )}

      {/* PWA Installation Promo Banner */}
      {isInstallable && !dismissedInstall && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 text-slate-100 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                Instale o App na Tela Inicial
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                  PWA Oficial
                </span>
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Acesso instantâneo sem abrir o navegador, funcionamento offline e atalhos rápidos.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end z-10 shrink-0">
            {notificationPermission === 'default' && (
              <button
                onClick={requestNotifications}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1"
                title="Ativar Notificações"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Alertas</span>
              </button>
            )}

            <button
              onClick={installApp}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Instalar</span>
            </button>

            <button
              onClick={() => setDismissedInstall(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
