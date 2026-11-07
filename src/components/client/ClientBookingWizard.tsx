import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Weight,
  Ruler,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Dumbbell,
  ArrowRight,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import {
  PersonalProfile,
  AnamneseQuestion,
  ScheduleConfig,
  Appointment,
  StudentAnamnese,
  AppointmentStatus
} from '../../types';

interface ClientBookingWizardProps {
  profile: PersonalProfile;
  questions: AnamneseQuestion[];
  scheduleConfig: ScheduleConfig;
  onBookingComplete: (newAppointment: Appointment) => void;
  onReturnToAdmin?: () => void;
  isSimulated?: boolean;
}

export const ClientBookingWizard: React.FC<ClientBookingWizardProps> = ({
  profile,
  questions,
  scheduleConfig,
  onBookingComplete,
  onReturnToAdmin,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected state
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-30');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [selectedTurno, setSelectedTurno] = useState<'manha' | 'tarde'>('manha');

  // Form fields
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [idade, setIdade] = useState<number | ''>('');
  const [peso, setPeso] = useState<number | ''>('');
  const [altura, setAltura] = useState<number | ''>('');
  const [objetivoPrincipal, setObjetivoPrincipal] = useState('Hipertrofia e Ganho de Massa');
  const [praticaMusculacao, setPraticaMusculacao] = useState<'nunca' | 'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [problemasColuna, setProblemasColuna] = useState(false);
  const [problemasColunaDetalhes, setProblemasColunaDetalhes] = useState('');
  const [cirurgiasPrevias, setCirurgiasPrevias] = useState(false);
  const [medicamentosContinuos, setMedicamentosContinuos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [respostasDinamicas, setRespostasDinamicas] = useState<Record<string, string>>({});

  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);

  // Available days generator
  const availableDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(2026, 7, 28); // Aug 28, 2026
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().substring(0, 10);
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNum = d.getDate();
      days.push({
        iso,
        dayName,
        dayNum,
        available: i !== 6, // Sunday off
        badge: i === 2 ? 'Hoje' : i === 3 ? 'Amanhã' : undefined,
      });
    }
    return days;
  }, []);

  // Time slots generator
  const timeSlots = useMemo(() => {
    return {
      manha: ['07:00', '08:00', '09:00', '10:00', '11:00'],
      tarde: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    };
  }, []);

  const handleNextStep1To2 = (dateIso: string) => {
    setSelectedDate(dateIso);
    setCurrentStep(2);
  };

  const handleNextStep2To3 = (time: string, turno: 'manha' | 'tarde') => {
    setSelectedTime(time);
    setSelectedTurno(turno);
    setCurrentStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) return;

    const anamneseData: StudentAnamnese = {
      idade: Number(idade) || 28,
      peso: Number(peso) || 75.0,
      altura: Number(altura) || 1.75,
      objetivoPrincipal,
      praticaMusculacao,
      problemasColunaArticulacao: problemasColuna,
      problemasColunaDetalhes: problemasColuna ? problemasColunaDetalhes : undefined,
      cirurgiasPrevias,
      hipertensaoOuCardiaco: false,
      diabetes: false,
      medicamentosContinuos: medicamentosContinuos || 'Nenhum',
      fumante: false,
      consumoAlcool: 'socialmente',
      restricaoMedica: 'Sem restrições',
      respostasDinamicas,
      observacoes: observacoes || undefined,
    };

    const newApt: Appointment = {
      id: `apt-${Date.now().toString().slice(-4)}`,
      alunoNome: nome.trim(),
      alunoWhatsapp: whatsapp.trim(),
      data: selectedDate,
      horario: selectedTime,
      turno: selectedTurno,
      status: 'pendente',
      objetivo: objetivoPrincipal,
      anamnese: anamneseData,
      criadoEm: new Date().toISOString(),
    };

    setCompletedAppointment(newApt);
    onBookingComplete(newApt);
    setCurrentStep(4);
  };

  // WhatsApp formatted confirmation text
  const whatsappUrl = useMemo(() => {
    if (!completedAppointment) return '#';
    const text = encodeURIComponent(
      `Olá ${profile.nome}! Acabei de agendar minha avaliação física no sistema.\n\n` +
      `📅 *Data:* ${completedAppointment.data}\n` +
      `⏰ *Horário:* ${completedAppointment.horario}\n` +
      `👤 *Aluno(a):* ${completedAppointment.alunoNome}\n` +
      `🎯 *Objetivo:* ${completedAppointment.objetivo}\n\n` +
      `Aguardo sua confirmação!`
    );
    return `https://wa.me/${profile.whatsapp}?text=${text}`;
  }, [completedAppointment, profile]);

  return (
    <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-2xl space-y-6">
        {/* Personal Header Header */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-extrabold text-xl">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <span id="client-personal-name" className="text-base font-extrabold text-slate-900 dark:text-white block">
                {profile.nome}
              </span>
              <div id="client-personal-bio" className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                {profile.titulo || profile.bio}
              </div>
            </div>
          </div>

          {onReturnToAdmin && (
            <button
              type="button"
              onClick={onReturnToAdmin}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
            >
              Voltar ao Painel
            </button>
          )}
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight" id="client-hero-title">
            Agende sua Avaliação & Consultoria
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto" id="client-hero-subtitle">
            Escolha o melhor dia e horário para seu atendimento personalizado.
          </p>
        </div>

        {/* 3-Step Indicator */}
        <div className="grid grid-cols-3 gap-2 bg-slate-200/70 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <div
            className={`py-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              currentStep === 1
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : currentStep > 1
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <span>1. Data</span>
            {currentStep > 1 && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>

          <div
            className={`py-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              currentStep === 2
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : currentStep > 2
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <span>2. Horário</span>
            {currentStep > 2 && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>

          <div
            className={`py-2 text-center rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              currentStep === 3
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : currentStep === 4
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <span>3. Anamnese</span>
            {currentStep === 4 && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* STEP 1: Select Date */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Selecione o Dia de Atendimento</span>
              </h2>
              <span className="text-xs font-bold text-slate-500">Agosto 2026</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableDays.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => d.available && handleNextStep1To2(d.iso)}
                  disabled={!d.available}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-between gap-1 transition-all ${
                    !d.available
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 cursor-not-allowed border-slate-200 dark:border-slate-800'
                      : selectedDate === d.iso
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {d.dayName}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {d.dayNum}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {d.available ? 'Disponível' : 'Indisponível'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select Time Slot */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                id="btn-back-to-step-1"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <div className="text-right">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Data selecionada: {selectedDate}
                </span>
              </div>
            </div>

            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Escolha o Horário Livre</span>
            </h2>

            {/* Morning Slots */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Turno da Manhã</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {timeSlots.manha.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleNextStep2To3(slot, 'manha')}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all text-center"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700 dark:text-indigo-400">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Turno da Tarde / Noite</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.tarde.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleNextStep2To3(slot, 'tarde')}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all text-center"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Student Details & Anamnesis Form */}
        {currentStep === 3 && (
          <form
            id="appointment-form"
            onSubmit={handleFinalSubmit}
            className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-200 text-xs sm:text-sm"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                id="btn-back-to-step-2"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Alterar Horário</span>
              </button>

              <div className="text-right text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDate} às {selectedTime}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-500" />
                <span>Seus Dados de Contato</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome_cliente"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Beatriz Lima"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seu WhatsApp (com DDD) *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(61) 98765-4321"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Biometrics */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Dados Corporais Iniciais</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    id="idade"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="28"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    id="peso"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="70"
                    step="0.1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Altura (m)
                  </label>
                  <input
                    type="number"
                    id="altura"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1.75"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Questions configured by Personal */}
            {questions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Questionário de Anamnese do Personal</span>
                </h3>

                <div className="space-y-3" id="dynamic-questions-container">
                  {questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {q.pergunta} {q.obrigatoria && <span className="text-rose-500">*</span>}
                      </label>
                      {q.tipo === 'select' && q.opcoes ? (
                        <select
                          value={respostasDinamicas[q.id] || ''}
                          onChange={(e) =>
                            setRespostasDinamicas({ ...respostasDinamicas, [q.id]: e.target.value })
                          }
                          required={q.obrigatoria}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                        >
                          <option value="">Selecione uma opção...</option>
                          {q.opcoes.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={q.tipo === 'numero' ? 'number' : 'text'}
                          value={respostasDinamicas[q.id] || ''}
                          onChange={(e) =>
                            setRespostasDinamicas({ ...respostasDinamicas, [q.id]: e.target.value })
                          }
                          placeholder={q.placeholder || 'Digite sua resposta...'}
                          required={q.obrigatoria}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health Checklist */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={problemasColuna}
                  onChange={(e) => setProblemasColuna(e.target.checked)}
                  className="w-4 h-4 rounded-md text-blue-600"
                />
                <span>Possuo dores ou lesões articulares (coluna, joelhos ou ombros)</span>
              </label>

              {problemasColuna && (
                <input
                  type="text"
                  value={problemasColunaDetalhes}
                  onChange={(e) => setProblemasColunaDetalhes(e.target.value)}
                  placeholder="Descreva brevemente a dor ou lesão..."
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-slate-900 dark:text-white text-xs"
                />
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Confirmar & Finalizar Agendamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {currentStep === 4 && completedAppointment && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Agendamento Realizado com Sucesso!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Seus dados e ficha de anamnese foram registrados no sistema do Personal.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Aluno:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedAppointment.alunoNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Data:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedAppointment.data}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Horário:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedAppointment.horario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Objetivo:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{completedAppointment.objetivo}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Confirmação no WhatsApp do Personal</span>
              </a>

              {onReturnToAdmin && (
                <button
                  type="button"
                  onClick={onReturnToAdmin}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Ver no Painel do Administrador
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
