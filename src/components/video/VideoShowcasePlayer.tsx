import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PersonalProfile,
  AnamneseQuestion,
  ScheduleConfig,
  Appointment,
  VideoScene,
  AppointmentStatus
} from '../../types';
import { VIDEO_SCENES } from '../../data/mockData';
import { ttsService } from '../../services/ttsService';
import { videoRecorderService } from '../../services/videoRecorderService';
import { VideoControls } from './VideoControls';
import { VirtualCursor } from './VirtualCursor';
import { SubtitleOverlay } from './SubtitleOverlay';
import { VideoScriptViewer } from './VideoScriptViewer';
import { AdminNavbar } from '../admin/AdminNavbar';
import { AdminDashboard } from '../admin/AdminDashboard';
import { AnamneseModal } from '../admin/AnamneseModal';
import { QuestionsManagerModal } from '../admin/QuestionsManagerModal';
import { ScheduleModal } from '../admin/ScheduleModal';
import { SettingsModal } from '../admin/SettingsModal';
import { ClientBookingWizard } from '../client/ClientBookingWizard';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { Lock, Sparkles, Play, Monitor, Smartphone, Video as VideoIcon } from 'lucide-react';

interface VideoShowcasePlayerProps {
  profile: PersonalProfile;
  questions: AnamneseQuestion[];
  scheduleConfig: ScheduleConfig;
  appointments: Appointment[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onAddQuestion: (q: Omit<AnamneseQuestion, 'id'>) => void;
  onDeleteQuestion: (id: string) => void;
  onSaveSchedule: (cfg: ScheduleConfig) => void;
  onSaveProfile: (p: PersonalProfile) => void;
  onSwitchToHandsOn: () => void;
}

export const VideoShowcasePlayer: React.FC<VideoShowcasePlayerProps> = ({
  profile,
  questions,
  scheduleConfig,
  appointments,
  isDarkMode,
  onToggleTheme,
  onUpdateStatus,
  onAddQuestion,
  onDeleteQuestion,
  onSaveSchedule,
  onSaveProfile,
  onSwitchToHandsOn,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  // Time & Animation tracking
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [sceneProgressRatio, setSceneProgressRatio] = useState(0);

  // Modals for Simulated Views
  const [simulatedAnamneseApt, setSimulatedAnamneseApt] = useState<Appointment | null>(null);
  const [simulatedQuestionsOpen, setSimulatedQuestionsOpen] = useState(false);
  const [simulatedScheduleOpen, setSimulatedScheduleOpen] = useState(false);
  const [simulatedWhatsAppApt, setSimulatedWhatsAppApt] = useState<Appointment | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<number | null>(null);

  const currentScene = VIDEO_SCENES[currentSceneIndex];

  // Total Duration calculation
  const totalDurationSeconds = useMemo(() => {
    return VIDEO_SCENES.reduce((acc, s) => acc + s.durationSeconds, 0);
  }, []);

  // Elapsed time up to current scene + current scene progress
  const currentTimeSeconds = useMemo(() => {
    let elapsed = 0;
    for (let i = 0; i < currentSceneIndex; i++) {
      elapsed += VIDEO_SCENES[i].durationSeconds;
    }
    elapsed += sceneProgressRatio * currentScene.durationSeconds;
    return Math.min(totalDurationSeconds, elapsed);
  }, [currentSceneIndex, sceneProgressRatio, currentScene, totalDurationSeconds]);

  // Handle scene speech narration
  const playCurrentSceneNarration = () => {
    const scene = VIDEO_SCENES[currentSceneIndex];
    setActiveWordIndex(0);

    ttsService.speak(scene.narrationText, {
      rate: playbackSpeed,
      volume: isMuted ? 0 : volume,
      onWord: (index) => {
        setActiveWordIndex(index);
      },
      onEnd: () => {
        // Advance to next scene automatically if still playing
        if (currentSceneIndex < VIDEO_SCENES.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      },
    });
  };

  // Synchronize playback state
  useEffect(() => {
    if (isPlaying) {
      playCurrentSceneNarration();
    } else {
      ttsService.stop();
    }

    return () => {
      ttsService.stop();
    };
  }, [currentSceneIndex, isPlaying, playbackSpeed, isMuted]);

  // Smooth progress timer
  useEffect(() => {
    if (!isPlaying) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const sceneDuration = currentScene.durationSeconds;
    const intervalMs = 50;
    const step = intervalMs / (sceneDuration * 1000 / playbackSpeed);

    setSceneProgressRatio(0);

    progressTimerRef.current = window.setInterval(() => {
      setSceneProgressRatio((prev) => {
        const next = prev + step;
        return next > 1 ? 1 : next;
      });
    }, intervalMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentSceneIndex, isPlaying, playbackSpeed]);

  // Configure simulated UI per scene
  useEffect(() => {
    // Reset all modals first
    setSimulatedAnamneseApt(null);
    setSimulatedQuestionsOpen(false);
    setSimulatedScheduleOpen(false);
    setSimulatedWhatsAppApt(null);

    // Set modal state according to scene
    if (currentScene.cameraTarget === 'anamnese') {
      setSimulatedAnamneseApt(appointments[0] || null);
    } else if (currentScene.cameraTarget === 'questions') {
      setSimulatedQuestionsOpen(true);
    } else if (currentScene.cameraTarget === 'schedule') {
      setSimulatedScheduleOpen(true);
    } else if (currentScene.cameraTarget === 'whatsapp') {
      setSimulatedWhatsAppApt(appointments[0] || null);
    }
  }, [currentSceneIndex, appointments]);

  // Virtual Cursor position based on active cursor action for this timestamp
  const activeCursorAction = useMemo(() => {
    const actions = currentScene.cursorActions;
    if (!actions || actions.length === 0) {
      return { xPercent: 50, yPercent: 50, action: 'move' as const, label: '' };
    }

    // Find the current action based on sceneProgressRatio
    let matched = actions[0];
    for (const act of actions) {
      if (sceneProgressRatio >= act.timestampRatio) {
        matched = act;
      }
    }
    return matched;
  }, [currentScene, sceneProgressRatio]);

  // Playback Control Handlers
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeekScene = (idx: number) => {
    setCurrentSceneIndex(idx);
    setSceneProgressRatio(0);
  };

  const handleSeekTime = (seconds: number) => {
    let acc = 0;
    for (let i = 0; i < VIDEO_SCENES.length; i++) {
      if (seconds <= acc + VIDEO_SCENES[i].durationSeconds) {
        setCurrentSceneIndex(i);
        setSceneProgressRatio((seconds - acc) / VIDEO_SCENES[i].durationSeconds);
        return;
      }
      acc += VIDEO_SCENES[i].durationSeconds;
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
      setSceneProgressRatio(0);
    }
  };

  const handleNextScene = () => {
    if (currentSceneIndex < VIDEO_SCENES.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setSceneProgressRatio(0);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    ttsService.setMuted(nextMuted);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    ttsService.setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
      ttsService.setMuted(false);
    }
  };

  const handleChangeSpeed = (spd: number) => {
    setPlaybackSpeed(spd);
    ttsService.setRate(spd);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleToggleRecord = async () => {
    if (!viewportRef.current) return;

    if (!isRecording) {
      const ok = await videoRecorderService.startRecording(viewportRef.current);
      if (ok) {
        setIsRecording(true);
        if (!isPlaying) setIsPlaying(true);
      }
    } else {
      videoRecorderService.stopRecording();
      setIsRecording(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center p-2 sm:p-4 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black p-0' : 'max-w-7xl mx-auto w-full'
      }`}
    >
      {/* Video Container Card */}
      <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
        {/* Top Video Header Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <VideoIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Vídeo Tour & Apresentação do Sistema</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Mode Switcher */}
            <button
              type="button"
              onClick={onSwitchToHandsOn}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Testar Sistema ao Vivo</span>
            </button>
          </div>
        </div>

        {/* Video Viewport Stage */}
        <div
          ref={viewportRef}
          className="relative w-full aspect-video min-h-[480px] sm:min-h-[580px] bg-slate-900 overflow-hidden flex flex-col select-none"
        >
          {/* Virtual Simulated Screen Container */}
          <div
            className="w-full h-full overflow-y-auto transition-transform duration-700 ease-out origin-top-left"
            style={{
              transform: `scale(${currentScene.zoomLevel})`,
              transformOrigin:
                currentScene.cameraTarget === 'metrics'
                  ? '30% 15%'
                  : currentScene.cameraTarget === 'charts'
                  ? '50% 35%'
                  : currentScene.cameraTarget === 'table'
                  ? '50% 60%'
                  : currentScene.cameraTarget === 'client_wizard'
                  ? '50% 40%'
                  : 'center center',
            }}
          >
            {/* SCENE 1: Login Screen or Overview */}
            {currentScene.id === 1 ? (
              <div className="min-h-full flex flex-col justify-center items-center p-6 bg-slate-950 text-white">
                <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">Painel do Personal Trainer</h2>
                    <p className="text-xs text-slate-400 mt-1">Gestão de Alunos, Anamnese & Métricas</p>
                  </div>

                  <div className="space-y-3 text-left">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">E-mail</label>
                      <input
                        type="email"
                        readOnly
                        value={profile.email}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-white focus:outline-hidden ring-2 ring-blue-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Senha</label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-white focus:outline-hidden ring-2 ring-blue-500/40"
                      />
                    </div>
                    <button
                      type="button"
                      className="w-full py-3 rounded-xl font-extrabold text-sm bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                    >
                      <span>Acessar Painel Administrativo</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : currentScene.cameraTarget === 'client_wizard' ? (
              /* SCENE 7: Student Booking Portal */
              <ClientBookingWizard
                profile={profile}
                questions={questions}
                scheduleConfig={scheduleConfig}
                onBookingComplete={() => {}}
                isSimulated={true}
              />
            ) : (
              /* SCENES 2 to 6 & 8: Admin Dashboard */
              <div className="min-h-full bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
                <AdminNavbar
                  profile={profile}
                  isDarkMode={isDarkMode}
                  onToggleTheme={onToggleTheme}
                  onOpenSettings={() => {}}
                  onOpenSchedule={() => {}}
                  onOpenQuestions={() => {}}
                  isSimulated={true}
                />

                <AdminDashboard
                  appointments={appointments}
                  profile={profile}
                  onUpdateStatus={onUpdateStatus}
                  onViewAnamnese={(apt) => setSimulatedAnamneseApt(apt)}
                  onOpenWhatsApp={(apt) => setSimulatedWhatsAppApt(apt)}
                  onOpenClientPortal={() => {}}
                  highlightTarget={currentScene.cameraTarget}
                />
              </div>
            )}

            {/* Simulated Modals */}
            {simulatedAnamneseApt && (
              <AnamneseModal
                appointment={simulatedAnamneseApt}
                questions={questions}
                onClose={() => setSimulatedAnamneseApt(null)}
                onSendWhatsApp={(apt) => setSimulatedWhatsAppApt(apt)}
              />
            )}

            {simulatedQuestionsOpen && (
              <QuestionsManagerModal
                questions={questions}
                onAddQuestion={onAddQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onClose={() => setSimulatedQuestionsOpen(false)}
              />
            )}

            {simulatedScheduleOpen && (
              <ScheduleModal
                config={scheduleConfig}
                onSave={onSaveSchedule}
                onClose={() => setSimulatedScheduleOpen(false)}
              />
            )}

            {simulatedWhatsAppApt && (
              <WhatsAppNotificationModal
                appointment={simulatedWhatsAppApt}
                profile={profile}
                onClose={() => setSimulatedWhatsAppApt(null)}
              />
            )}
          </div>

          {/* Virtual Moving Cursor */}
          <VirtualCursor
            xPercent={activeCursorAction.xPercent}
            yPercent={activeCursorAction.yPercent}
            action={activeCursorAction.action}
            label={activeCursorAction.label}
            visible={isPlaying}
          />

          {/* Synchronized Subtitles (Closed Captions) */}
          <SubtitleOverlay
            fullText={currentScene.narrationText}
            activeWordIndex={activeWordIndex}
            visible={subtitlesEnabled}
          />

          {/* Big Play Overlay if paused */}
          {!isPlaying && (
            <div
              className="absolute inset-0 z-30 bg-slate-950/50 backdrop-blur-2xs flex items-center justify-center cursor-pointer group"
              onClick={handleTogglePlay}
            >
              <div className="w-20 h-20 rounded-3xl bg-blue-600/90 text-white shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 fill-current ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Video Controls Bar */}
        <VideoControls
          scenes={VIDEO_SCENES}
          currentSceneIndex={currentSceneIndex}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          playbackSpeed={playbackSpeed}
          subtitlesEnabled={subtitlesEnabled}
          isFullscreen={isFullscreen}
          isRecording={isRecording}
          currentTimeSeconds={currentTimeSeconds}
          totalDurationSeconds={totalDurationSeconds}
          onTogglePlay={handleTogglePlay}
          onSeekScene={handleSeekScene}
          onSeekTime={handleSeekTime}
          onPrevScene={handlePrevScene}
          onNextScene={handleNextScene}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onChangeSpeed={handleChangeSpeed}
          onToggleSubtitles={() => setSubtitlesEnabled(!subtitlesEnabled)}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleRecord={handleToggleRecord}
          onOpenScript={() => setShowScriptModal(true)}
        />
      </div>

      {/* Script Viewer Modal */}
      {showScriptModal && (
        <VideoScriptViewer
          scenes={VIDEO_SCENES}
          onClose={() => setShowScriptModal(false)}
        />
      )}
    </div>
  );
};
