import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';

interface SubtitleOverlayProps {
  fullText: string;
  activeWordIndex: number;
  speakerName?: string;
  visible?: boolean;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  fullText,
  activeWordIndex,
  speakerName = 'Locutor Especialista',
  visible = true,
}) => {
  if (!visible || !fullText) return null;

  const words = fullText.split(/\s+/);

  return (
    <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-12 sm:right-12 z-40 pointer-events-none flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-950/85 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl border border-slate-700/80 shadow-2xl max-w-3xl w-full flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
          <Volume2 className="w-4 h-4 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
              {speakerName}
            </span>
            <span className="text-[10px] text-slate-400">• Narração em Português-BR</span>
          </div>

          <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-200">
            {words.map((word, idx) => {
              const isCurrent = idx === activeWordIndex;
              const isPast = idx < activeWordIndex;

              return (
                <span
                  key={idx}
                  className={`inline-block transition-colors duration-150 mr-1 ${
                    isCurrent
                      ? 'text-amber-300 font-extrabold scale-105 bg-amber-400/20 px-1 rounded-sm'
                      : isPast
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
