import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Sparkles
} from 'lucide-react';
import { Appointment, PersonalProfile } from '../../types';

interface WhatsAppNotificationModalProps {
  appointment: Appointment | null;
  profile: PersonalProfile;
  onClose: () => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  appointment,
  profile,
  onClose,
}) => {
  if (!appointment) return null;

  const [messageType, setMessageType] = useState<'confirmacao' | 'lembrete' | 'falta' | 'anamnese'>('confirmacao');
  const [copied, setCopied] = useState(false);

  const getMessageText = () => {
    switch (messageType) {
      case 'confirmacao':
        return (
          `Olá ${appointment.alunoNome}! 👋\n\n` +
          `Aqui é o Personal ${profile.nome}. Estou passando para confirmar sua *Avaliação Física / Treino Personalizado* agendado no sistema:\n\n` +
          `📅 *Data:* ${appointment.data}\n` +
          `⏰ *Horário:* ${appointment.horario}\n` +
          `🎯 *Foco:* ${appointment.objetivo}\n\n` +
          `Sua ficha de anamnese já foi analisada. Por favor, venha com roupa leve de treino e tênis confortável. Nos vemos lá!`
        );
      case 'lembrete':
        return (
          `Fala ${appointment.alunoNome}! 💪\n\n` +
          `Lembrete do seu treino com o Personal ${profile.nome} hoje às *${appointment.horario}*.\n\n` +
          `Lembre-se de levar sua garrafa de água e toalha. Foco no objetivo!`
        );
      case 'falta':
        return (
          `Olá ${appointment.alunoNome}! Sentimos sua falta no treino hoje às ${appointment.horario}.\n\n` +
          `Aconteceu algum imprevisto? Vamos reagendar para não perder a constância nos seus treinos? Me avise por aqui!`
        );
      case 'anamnese':
        return (
          `Olá ${appointment.alunoNome}! 📋\n\n` +
          `Sua ficha de avaliação física e biometria (${appointment.anamnese.peso}kg, ${appointment.anamnese.altura}m) foi registrada com sucesso no sistema do Personal ${profile.nome}.\n\n` +
          `Já estamos estruturando sua periodização de treino personalizada!`
        );
    }
  };

  const messageText = getMessageText();
  const whatsappUrl = `https://wa.me/${appointment.alunoWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    messageText
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col text-xs sm:text-sm">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Disparo de Notificação WhatsApp</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Aluno: {appointment.alunoNome} ({appointment.alunoWhatsapp})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Selecione o Modelo de Mensagem
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMessageType('confirmacao')}
                className={`p-2 rounded-xl text-left border transition-all text-xs font-bold ${
                  messageType === 'confirmacao'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                ✅ Confirmação de Agendamento
              </button>

              <button
                type="button"
                onClick={() => setMessageType('lembrete')}
                className={`p-2 rounded-xl text-left border transition-all text-xs font-bold ${
                  messageType === 'lembrete'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                ⏰ Lembrete de Treino
              </button>

              <button
                type="button"
                onClick={() => setMessageType('falta')}
                className={`p-2 rounded-xl text-left border transition-all text-xs font-bold ${
                  messageType === 'falta'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                ⚠️ Aviso / Falta no Horário
              </button>

              <button
                type="button"
                onClick={() => setMessageType('anamnese')}
                className={`p-2 rounded-xl text-left border transition-all text-xs font-bold ${
                  messageType === 'anamnese'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                📋 Ficha de Avaliação Pronta
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Pré-visualização do Texto Formatado
            </label>
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/60"
            >
              Cancelar
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Abrir no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
