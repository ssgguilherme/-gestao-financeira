import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  FileText,
  Video,
  Download,
  Captions,
  Settings,
  Sparkles
} from 'lucide-react';
import { VideoScene } from '../../types';

interface VideoControlsProps {
  scenes: VideoScene[];
  currentSceneIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackSpeed: number;
  subtitlesEnabled: boolean;
  isFullscreen: boolean;
  isRecording: boolean;
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  onTogglePlay: () => void;
  onSeekScene: (index: number) => void;
  onSeekTime: (seconds: number) => void;
  onPrevScene: () => void;
  onNextScene: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onChangeSpeed: (speed: number) => void;
  onToggleSubtitles: () => void;
  onToggleFullscreen: () => void;
  onToggleRecord: () => void;
  onOpenScript: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  scenes,
  currentSceneIndex,
  isPlaying,
  isMuted,
  volume,
  playbackSpeed,
  subtitlesEnabled,
  isFullscreen,
  isRecording,
  currentTimeSeconds,
  totalDurationSeconds,
  onTogglePlay,
  onSeekScene,
  onSeekTime,
  onPrevScene,
  onNextScene,
  onToggleMute,
  onVolumeChange,
  onChangeSpeed,
  onToggleSubtitles,
  onToggleFullscreen,
  onToggleRecord,
  onOpenScript,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDurationSeconds > 0
    ? (currentTimeSeconds / totalDurationSeconds) * 100
    : 0;

  const currentScene = scenes[currentSceneIndex];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-b-2xl border-t border-slate-800 flex flex-col gap-2.5 transition-all select-none">
      {/* Chapter Marker Buttons / Scrubber Bar */}
      <div className="space-y-1.5">
        {/* Timeline track */}
        <div
          className="relative h-2.5 w-full bg-slate-800 rounded-full cursor-pointer overflow-hidden group hover:h-3.5 transition-all"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeekTime(pos * totalDurationSeconds);
          }}
        >
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Chapter dividers */}
          {scenes.map((scene, idx) => {
            let cumulative = 0;
            for (let i = 0; i < idx; i++) cumulative += scenes[i].durationSeconds;
            const pct = (cumulative / totalDurationSeconds) * 100;
            if (pct === 0) return null;

            return (
              <div
                key={scene.id}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-950/80 z-10"
                style={{ left: `${pct}%` }}
                title={`Capítulo ${idx + 1}: ${scene.title}`}
              />
            );
          })}
        </div>

        {/* Scene Navigation Chapters Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px]">
          {scenes.map((scene, idx) => {
            const isCurrent = idx === currentSceneIndex;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSeekScene(idx)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs scale-102'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Cena {idx + 1}</span>
                <span className="hidden md:inline font-normal text-slate-300">
                  {scene.title.split(':')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left: Playback buttons & Current Scene title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prev Scene */}
          <button
            type="button"
            onClick={onPrevScene}
            disabled={currentSceneIndex === 0}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Cena Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pausar' : 'Reproduzir Vídeo'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Next Scene */}
          <button
            type="button"
            onClick={onNextScene}
            disabled={currentSceneIndex === scenes.length - 1}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Próxima Cena"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Time & Title Info */}
          <div className="ml-1 sm:ml-2">
            <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <span className="text-blue-400">Cena {currentSceneIndex + 1}/{scenes.length}:</span>
              <span className="truncate max-w-[140px] sm:max-w-[240px]">{currentScene.title}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {formatTime(currentTimeSeconds)} / {formatTime(totalDurationSeconds)}
            </div>
          </div>
        </div>

        {/* Right: Audio, Speed, Recording, Script & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Volume Controls */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Ativar Áudio Narrado' : 'Mutar'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-16 h-1.5 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Speed Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
              title="Velocidade de Reprodução"
            >
              {playbackSpeed}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl flex flex-col gap-0.5 z-50">
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      onChangeSpeed(spd);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg text-left transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {spd}x {spd === 1.0 && '(Normal)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtitles CC Toggle */}
          <button
            type="button"
            onClick={onToggleSubtitles}
            className={`p-2 rounded-xl border transition-colors ${
              subtitlesEnabled
                ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Alternar Legendas (Closed Captions)"
          >
            <Captions className="w-4 h-4" />
          </button>

          {/* Script Viewer Button */}
          <button
            type="button"
            onClick={onOpenScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
            title="Ver Roteiro de Locução Completo"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Roteiro</span>
          </button>

          {/* Record / Export Video Button */}
          <button
            type="button"
            onClick={onToggleRecord}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
            }`}
            title={isRecording ? 'Parar Gravação e Baixar Vídeo' : 'Gravar Vídeo de Apresentação'}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">{isRecording ? 'Gravando...' : 'Gravar Vídeo'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
