import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
  Clock,
  Sparkles,
  Printer,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { VideoScene } from '../../types';

interface VideoScriptViewerProps {
  scenes: VideoScene[];
  onClose: () => void;
}

export const VideoScriptViewer: React.FC<VideoScriptViewerProps> = ({
  scenes,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const fullScriptMarkdown = scenes
    .map((s, idx) => {
      return `### Cena ${idx + 1}: ${s.title} (${s.durationSeconds}s)\n**Recurso em Destaque:** ${s.focusedFeature}\n**Locução:**\n"${s.narrationText}"\n`;
    })
    .join('\n---\n\n');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullScriptMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Roteiro Completo de Demonstração & Locução
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Script sincronizado com timestamps para gravação de vídeos ou apresentações comerciais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Quick Summary Card */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Dicas para Gravação & Apresentação</span>
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              Este roteiro foi estruturado para destacar os principais diferenciais do sistema: automação do agendamento 24h, ficha de anamnese digital integrada, controle de faltas e confirmação automática no WhatsApp.
            </p>
          </div>

          {/* Scene Breakdown */}
          <div className="space-y-4">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {scene.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {scene.durationSeconds}s
                    </span>
                    <span>•</span>
                    <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md font-semibold text-slate-700 dark:text-slate-300">
                      {scene.focusedFeature}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Texto da Locução (Voice-over)
                  </span>
                  <blockquote className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 leading-relaxed">
                    "{scene.narrationText}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Roteiro Copiado!' : 'Copiar Texto'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
