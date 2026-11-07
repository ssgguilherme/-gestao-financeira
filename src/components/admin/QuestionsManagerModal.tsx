import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlignLeft,
  ListOrdered,
  Type,
  ToggleLeft
} from 'lucide-react';
import { AnamneseQuestion, QuestionType } from '../../types';

interface QuestionsManagerModalProps {
  questions: AnamneseQuestion[];
  onAddQuestion: (question: Omit<AnamneseQuestion, 'id'>) => void;
  onDeleteQuestion: (id: string) => void;
  onClose: () => void;
}

export const QuestionsManagerModal: React.FC<QuestionsManagerModalProps> = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onClose,
}) => {
  const [pergunta, setPergunta] = useState('');
  const [tipo, setTipo] = useState<QuestionType>('texto');
  const [ordem, setOrdem] = useState<number>(questions.length + 1);
  const [opcoesStr, setOpcoesStr] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [obrigatoria, setObrigatoria] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pergunta.trim()) return;

    let opcoes: string[] | undefined = undefined;
    if (tipo === 'select' || tipo === 'radio' || tipo === 'checkbox') {
      opcoes = opcoesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    onAddQuestion({
      pergunta: pergunta.trim(),
      tipo,
      ordem: Number(ordem) || 1,
      opcoes: opcoes && opcoes.length > 0 ? opcoes : undefined,
      placeholder: placeholder.trim() || undefined,
      obrigatoria,
      categoria: 'personalizado',
    });

    // Reset form
    setPergunta('');
    setTipo('texto');
    setOpcoesStr('');
    setPlaceholder('');
    setOrdem(questions.length + 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Perguntas da Ficha de Anamnese
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Personalize o questionário dinâmico respondido pelos alunos no agendamento.
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
        <div className="p-4 sm:p-6 space-y-6">
          {/* New Question Form */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Adicionar Nova Pergunta</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enunciado da Pergunta *
                </label>
                <input
                  type="text"
                  id="q_pergunta"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  placeholder="Ex: Toma algum medicamento de uso contínuo ou tem lesão?"
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Resposta
                  </label>
                  <select
                    id="q_tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="texto">Texto Curto (Linha única)</option>
                    <option value="textarea">Texto Longo (Parágrafo)</option>
                    <option value="select">Seleção Única (Dropdown)</option>
                    <option value="radio">Múltipla Escolha (Opção Única)</option>
                    <option value="numero">Número</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    id="q_ordem"
                    value={ordem}
                    onChange={(e) => setOrdem(Number(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Options input if type needs choices */}
              {(tipo === 'select' || tipo === 'radio' || tipo === 'checkbox') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opções de Resposta (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    id="q_opcoes"
                    value={opcoesStr}
                    onChange={(e) => setOpcoesStr(e.target.value)}
                    placeholder="Ex: Opção 1, Opção 2, Opção 3"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    id="q_obrigatoria"
                    checked={obrigatoria}
                    onChange={(e) => setObrigatoria(e.target.checked)}
                    className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                  />
                  <span>Pergunta de preenchimento obrigatório</span>
                </label>

                <button
                  type="submit"
                  id="btn-save-question"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  Salvar Pergunta
                </button>
              </div>
            </form>
          </div>

          {/* Current Questions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Perguntas Ativas ({questions.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Exibidas no Passo 3 do Aluno</span>
            </h3>

            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 group hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{q.pergunta}</span>
                        {q.obrigatoria && (
                          <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-sm">
                            Obrigatória
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="capitalize">Tipo: {q.tipo}</span>
                        {q.opcoes && (
                          <span>• {q.opcoes.length} opções cadastradas</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                    title="Excluir pergunta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-xs p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Concluir & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
