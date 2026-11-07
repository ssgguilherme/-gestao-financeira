import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Se já estiver instalado e rodando em modo standalone, oculta o botão
  if (isInstalled) {
    return null;
  }

  // Se o navegador disparou o evento beforeinstallprompt (Android / Chrome / Edge / Desktop)
  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {isInstallable && (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-bold shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-500/30 flex-shrink-0 shadow-sm">
              <img src="/icons/icon-192.png" alt="FinanFlow" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="leading-tight text-white font-extrabold flex items-center gap-1">
                <span>Instalar FinanFlow</span>
              </div>
              <div className="text-[10px] text-emerald-400/90 font-medium">Toque para baixar o app</div>
            </div>
          </div>
          <Download className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all text-xs font-bold"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 shadow-sm">
              <img src="/icons/icon-192.png" alt="FinanFlow" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="leading-tight text-white font-extrabold">Instalar no iPhone</div>
              <div className="text-[10px] text-slate-400 font-medium">Adicionar à Tela de Início</div>
            </div>
          </div>
          <Smartphone className="w-4 h-4 text-emerald-400" />
        </button>
      )}

      {/* Modal Guia de Instalação no iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md border border-emerald-500/30">
                  <img src="/icons/icon-192.png" alt="FinanFlow" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Instalar no iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-400">Atalho direto na tela de início</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  No Safari, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Toque em <strong>Adicionar</strong> no canto superior direito para concluir.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
