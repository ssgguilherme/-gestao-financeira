import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  Sun,
  Moon,
  Sparkles,
  Check,
  Zap
} from 'lucide-react';
import { ScheduleConfig } from '../../types';

interface ScheduleModalProps {
  config: ScheduleConfig;
  onSave: (newConfig: ScheduleConfig) => void;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [formConfig, setFormConfig] = useState<ScheduleConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFrequencyChange = (mode: 'last_week' | 'all_weeks' | 'custom_dates') => {
    setFormConfig({ ...formConfig, frequencyMode: mode });
  };

  const handleToggleDay = (day: keyof ScheduleConfig['diasAtivos']) => {
    setFormConfig({
      ...formConfig,
      diasAtivos: {
        ...formConfig.diasAtivos,
        [day]: !formConfig.diasAtivos[day],
      },
    });
  };

  const applyPreset = (preset: 'weekdays' | 'weekend' | 'all') => {
    if (preset === 'weekdays') {
      setFormConfig({
        ...formConfig,
        diasAtivos: { seg: true, ter: true, qua: true, qui: true, sex: true, sab: false, dom: false },
      });
    } else if (preset === 'weekend') {
      setFormConfig({
        ...formConfig,
        diasAtivos: { seg: false, ter: false, qua: false, qui: false, sex: false, sab: true, dom: true },
      });
    } else if (preset === 'all') {
      setFormConfig({
        ...formConfig,
        diasAtivos: { seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: true },
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Horários & Grade de Atendimento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Defina turnos livres, pausas e dias da semana disponíveis para agendamento.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-schedule"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Recurrence Mode Radios */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Modo de Frequência de Avaliações
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="freq-mode-radios">
              <label
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  formConfig.frequencyMode === 'all_weeks'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">Todas as Semanas</span>
                  <input
                    type="radio"
                    name="sch_frequency_mode"
                    id="freq_all_weeks"
                    checked={formConfig.frequencyMode === 'all_weeks'}
                    onChange={() => handleFrequencyChange('all_weeks')}
                    className="text-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Atendimento contínuo o mês todo
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  formConfig.frequencyMode === 'last_week'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">Última Semana</span>
                  <input
                    type="radio"
                    name="sch_frequency_mode"
                    id="freq_last_week"
                    checked={formConfig.frequencyMode === 'last_week'}
                    onChange={() => handleFrequencyChange('last_week')}
                    className="text-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Avaliações no final de cada mês
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  formConfig.frequencyMode === 'custom_dates'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">Datas Especiais</span>
                  <input
                    type="radio"
                    name="sch_frequency_mode"
                    id="freq_custom_dates"
                    checked={formConfig.frequencyMode === 'custom_dates'}
                    onChange={() => handleFrequencyChange('custom_dates')}
                    className="text-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Dias específicos selecionados
                </span>
              </label>
            </div>
          </div>

          {/* Active Weekdays & Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Dias de Atendimento Ativos
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  id="btn-preset-weekdays"
                  onClick={() => applyPreset('weekdays')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Seg-Sex
                </button>
                <button
                  type="button"
                  id="btn-preset-weekend"
                  onClick={() => applyPreset('weekend')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Fim de Semana
                </button>
                <button
                  type="button"
                  id="btn-preset-all"
                  onClick={() => applyPreset('all')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[
                { key: 'seg', label: 'Seg' },
                { key: 'ter', label: 'Ter' },
                { key: 'qua', label: 'Qua' },
                { key: 'qui', label: 'Qui' },
                { key: 'sex', label: 'Sex' },
                { key: 'sab', label: 'Sáb' },
                { key: 'dom', label: 'Dom' },
              ].map(({ key, label }) => {
                const dayKey = key as keyof ScheduleConfig['diasAtivos'];
                const active = formConfig.diasAtivos[dayKey];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleDay(dayKey)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Turnos: Manhã e Tarde */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Morning Shift */}
            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Turno da Manhã</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Início</label>
                  <input
                    type="time"
                    value={formConfig.horarioManhaInicio}
                    onChange={(e) => setFormConfig({ ...formConfig, horarioManhaInicio: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Fim</label>
                  <input
                    type="time"
                    value={formConfig.horarioManhaFim}
                    onChange={(e) => setFormConfig({ ...formConfig, horarioManhaFim: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Afternoon/Evening Shift */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Turno da Tarde / Noite</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Início</label>
                  <input
                    type="time"
                    value={formConfig.horarioTardeInicio}
                    onChange={(e) => setFormConfig({ ...formConfig, horarioTardeInicio: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Fim</label>
                  <input
                    type="time"
                    value={formConfig.horarioTardeFim}
                    onChange={(e) => setFormConfig({ ...formConfig, horarioTardeFim: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Session Duration & Lunch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duração de cada Sessão
              </label>
              <select
                value={formConfig.duracaoMinutos}
                onChange={(e) => setFormConfig({ ...formConfig, duracaoMinutos: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value={30}>30 minutos (Express)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (Padrão)</option>
                <option value={90}>90 minutos (Completo)</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.intervaloAlmoco}
                  onChange={(e) => setFormConfig({ ...formConfig, intervaloAlmoco: e.target.checked })}
                  className="w-4 h-4 rounded-md text-blue-600"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bloquear Intervalo de Almoço (12h às 14h)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              id="btn-cancel-schedule"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-save-schedule"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Configurações Salvas!</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Salvar Grade de Horários</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
