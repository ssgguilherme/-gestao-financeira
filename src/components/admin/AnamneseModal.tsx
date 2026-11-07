import React from 'react';
import {
  X,
  FileText,
  User,
  HeartPulse,
  Activity,
  AlertTriangle,
  Pill,
  Calendar,
  Clock,
  Target,
  MessageCircle,
  Printer,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { Appointment, AnamneseQuestion } from '../../types';

interface AnamneseModalProps {
  appointment: Appointment | null;
  questions: AnamneseQuestion[];
  onClose: () => void;
  onSendWhatsApp: (appointment: Appointment) => void;
}

export const AnamneseModal: React.FC<AnamneseModalProps> = ({
  appointment,
  questions,
  onClose,
  onSendWhatsApp,
}) => {
  if (!appointment) return null;

  const { alunoNome, alunoWhatsapp, data, horario, objetivo, anamnese } = appointment;

  // Calculate BMI (IMC)
  const imc =
    anamnese.altura > 0
      ? (anamnese.peso / (anamnese.altura * anamnese.altura)).toFixed(1)
      : '0.0';
  const imcNum = parseFloat(imc);

  const getImcClassification = (val: number) => {
    if (val < 18.5) return { label: 'Abaixo do peso', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' };
    if (val < 25) return { label: 'Peso ideal / Normal', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' };
    if (val < 30) return { label: 'Sobrepeso', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' };
    return { label: 'Obesidade', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' };
  };

  const imcInfo = getImcClassification(imcNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Ficha de Anamnese & Avaliação
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Aluno: <span className="font-bold text-slate-800 dark:text-slate-200">{alunoNome}</span>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 text-sm">
          {/* Appointment Meta Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Data do Treino</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{data}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Horário</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{horario}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">WhatsApp</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{alunoWhatsapp}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Objetivo</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">{objetivo}</span>
            </div>
          </div>

          {/* Biometrics & Body Stats */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Dados Corporais & Biometria</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block">Idade</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{anamnese.idade} anos</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block">Peso Corporal</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{anamnese.peso} kg</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block">Estatura</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{anamnese.altura} m</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block">IMC Estimado</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">{imc}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${imcInfo.color}`}>
                    {imcInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Health & Medical History */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Histórico de Saúde & Cuidados</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dores ou Lesões */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Dores / Lesões Articulares:</span>
                  <span className={anamnese.problemasColunaArticulacao ? 'text-rose-600 font-extrabold' : 'text-emerald-600'}>
                    {anamnese.problemasColunaArticulacao ? 'Sim' : 'Não relatado'}
                  </span>
                </div>
                {anamnese.problemasColunaDetalhes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
                    {anamnese.problemasColunaDetalhes}
                  </p>
                )}
              </div>

              {/* Cirurgias */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Cirurgias Prévias:</span>
                  <span className={anamnese.cirurgiasPrevias ? 'text-amber-600 font-extrabold' : 'text-emerald-600'}>
                    {anamnese.cirurgiasPrevias ? 'Sim' : 'Nenhuma'}
                  </span>
                </div>
                {anamnese.cirurgiasDetalhes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {anamnese.cirurgiasDetalhes}
                  </p>
                )}
              </div>

              {/* Medicamentos */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Medicamentos de uso contínuo:</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                  {anamnese.medicamentosContinuos || 'Nenhum medicamento informado.'}
                </p>
              </div>

              {/* Hábitos & Experiência */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Nível de Musculação:</span>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-bold capitalize">
                  {anamnese.praticaMusculacao}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Questions Answers */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Perguntas Personalizadas da Anamnese</span>
              </h3>

              <div className="space-y-2.5">
                {questions.map((q) => {
                  const resp = anamnese.respostasDinamicas[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                    >
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {q.pergunta}
                      </span>
                      <span className="text-xs text-slate-900 dark:text-slate-100 font-semibold mt-1 block">
                        {resp ? (Array.isArray(resp) ? resp.join(', ') : resp) : 'Não respondido'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observations */}
          {anamnese.observacoes && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">Observações do Aluno / Treinador:</span>
              <p className="text-amber-800 dark:text-amber-200 mt-1">{anamnese.observacoes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSendWhatsApp(appointment)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
