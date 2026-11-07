import React from 'react';
import { MousePointer2, Sparkles } from 'lucide-react';

interface VirtualCursorProps {
  xPercent: number;
  yPercent: number;
  action: 'move' | 'click' | 'highlight' | 'type';
  label?: string;
  visible?: boolean;
}

export const VirtualCursor: React.FC<VirtualCursorProps> = ({
  xPercent,
  yPercent,
  action,
  label,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-700 ease-out"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: 'translate(-8px, -8px)',
      }}
    >
      {/* Click Ripple Effect */}
      {action === 'click' && (
        <div className="absolute -inset-4 rounded-full bg-blue-500/30 border-2 border-blue-400 animate-ping duration-1000" />
      )}

      {/* Highlight Ring */}
      {action === 'highlight' && (
        <div className="absolute -inset-6 rounded-full bg-amber-400/20 border-2 border-dashed border-amber-400 animate-spin duration-3000" />
      )}

      {/* Main Cursor Arrow */}
      <div className="relative flex items-center gap-1.5">
        <div className="p-1 rounded-full bg-slate-950/80 text-white shadow-xl border border-white/40 backdrop-blur-xs">
          <MousePointer2 className="w-5 h-5 text-blue-400 fill-blue-400 drop-shadow-md -rotate-12" />
        </div>

        {/* Action Label Pill */}
        {label && (
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg border border-slate-700 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
