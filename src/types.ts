export type AppointmentStatus = 'pendente' | 'realizado' | 'falta' | 'cancelado';

export type QuestionType = 'texto' | 'textarea' | 'numero' | 'select' | 'checkbox' | 'radio';

export interface AnamneseQuestion {
  id: string;
  pergunta: string;
  tipo: QuestionType;
  ordem: number;
  opcoes?: string[];
  placeholder?: string;
  obrigatoria: boolean;
  categoria?: 'saude' | 'habitos' | 'historico' | 'objetivos' | 'personalizado';
}

export interface StudentAnamnese {
  idade: number;
  peso: number; // in kg
  altura: number; // in meters (e.g. 1.75)
  objetivoPrincipal: string;
  praticaMusculacao: 'nunca' | 'iniciante' | 'intermediario' | 'avancado';
  problemasColunaArticulacao: boolean;
  problemasColunaDetalhes?: string;
  cirurgiasPrevias: boolean;
  cirurgiasDetalhes?: string;
  hipertensaoOuCardiaco: boolean;
  diabetes: boolean;
  medicamentosContinuos: string;
  fumante: boolean;
  consumoAlcool: 'nunca' | 'socialmente' | 'frequente';
  restricaoMedica: string;
  respostasDinamicas: Record<string, string | string[]>;
  observacoes?: string;
}

export interface Appointment {
  id: string;
  alunoNome: string;
  alunoWhatsapp: string;
  alunoEmail?: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  turno: 'manha' | 'tarde';
  status: AppointmentStatus;
  objetivo: string;
  anamnese: StudentAnamnese;
  criadoEm: string;
}

export interface PersonalProfile {
  nome: string;
  titulo: string;
  bio: string;
  whatsapp: string;
  email: string;
  slug: string; // e.g. "lucassilva"
  fotoUrl?: string;
  cidade: string;
  cref: string;
}

export interface ScheduleConfig {
  frequencyMode: 'last_week' | 'all_weeks' | 'custom_dates';
  duracaoMinutos: number;
  diasAtivos: {
    seg: boolean;
    ter: boolean;
    qua: boolean;
    qui: boolean;
    sex: boolean;
    sab: boolean;
    dom: boolean;
  };
  horarioManhaInicio: string;
  horarioManhaFim: string;
  horarioTardeInicio: string;
  horarioTardeFim: string;
  intervaloAlmoco: boolean;
  capacidadePorHorario: number;
}

export interface VideoScene {
  id: number;
  title: string;
  subtitle: string;
  durationSeconds: number;
  narrationText: string;
  focusedFeature: string;
  cameraTarget: 'overview' | 'metrics' | 'charts' | 'table' | 'anamnese' | 'questions' | 'schedule' | 'client_wizard' | 'whatsapp';
  zoomLevel: number;
  cursorActions: Array<{
    timestampRatio: number; // 0 to 1
    xPercent: number; // 0 to 100
    yPercent: number; // 0 to 100
    action: 'move' | 'click' | 'highlight' | 'type';
    label?: string;
  }>;
  highlightBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
  }>;
}

export type AppViewMode = 'video_showcase' | 'admin_live' | 'client_live' | 'script_guide';
