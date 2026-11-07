import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  TrendingUp,
  Search,
  Filter,
  Copy,
  ExternalLink,
  MessageCircle,
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  User,
  Phone,
  Target
} from 'lucide-react';
import { Appointment, AppointmentStatus, PersonalProfile } from '../../types';

interface AdminDashboardProps {
  appointments: Appointment[];
  profile: PersonalProfile;
  onUpdateStatus: (id: string, newStatus: AppointmentStatus) => void;
  onViewAnamnese: (appointment: Appointment) => void;
  onOpenWhatsApp: (appointment: Appointment) => void;
  onOpenClientPortal: () => void;
  onOpenNewAppointment?: () => void;
  highlightTarget?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  appointments,
  profile,
  onUpdateStatus,
  onViewAnamnese,
  onOpenWhatsApp,
  onOpenClientPortal,
  onOpenNewAppointment,
  highlightTarget,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const personalLink = `https://sistema-agendamento-personal.vercel.app/?p=${profile.slug}`;

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = appointments.length;
    const done = appointments.filter((a) => a.status === 'realizado').length;
    const missed = appointments.filter((a) => a.status === 'falta').length;
    const pending = appointments.filter((a) => a.status === 'pendente').length;
    const canceled = appointments.filter((a) => a.status === 'cancelado').length;

    const evaluated = done + missed;
    const rate = evaluated > 0 ? Math.round((done / evaluated) * 100) : 100;

    return { total, done, missed, pending, canceled, rate };
  }, [appointments]);

  // Objectives calculation for Pie Chart
  const objectivesDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const obj = a.objetivo || 'Outros';
      counts[obj] = (counts[obj] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.alunoWhatsapp.includes(searchTerm) ||
        apt.objetivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.horario.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(personalLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'realizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Realizado
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pendente
          </span>
        );
      case 'falta':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Falta
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Ban className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard de Atendimentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Acompanhe o fluxo de alunos, presença e fichas de avaliação física.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2" />
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 pr-3 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="2026-08" className="dark:bg-slate-900">Agosto de 2026</option>
              <option value="2026-07" className="dark:bg-slate-900">Julho de 2026</option>
              <option value="2026-06" className="dark:bg-slate-900">Junho de 2026</option>
              <option value="2026-09" className="dark:bg-slate-900">Setembro de 2026</option>
            </select>
          </div>

          <button
            type="button"
            id="btn-refresh"
            title="Atualizar Dados"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Exclusive Link Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md">
                Link Exclusivo do Personal
              </span>
              <span className="text-xs text-slate-400">Divulgue no seu Instagram / WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <code
                id="personal-exclusive-link"
                className="bg-black/40 text-amber-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono border border-slate-700 select-all max-w-full truncate inline-block"
              >
                {personalLink}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-copy-personal-link"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              id="btn-open-personal-link"
              onClick={onOpenClientPortal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Portal do Aluno</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Metrics */}
      <div
        id="metrics-grid"
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 transition-all duration-300 ${
          highlightTarget === 'metrics' ? 'ring-4 ring-blue-500/40 rounded-2xl p-1 bg-blue-50/50 dark:bg-blue-950/20' : ''
        }`}
      >
        {/* Metric 1: Total */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total no Mês</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span id="metric-total" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.total}
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Horários agendados</span>
        </div>

        {/* Metric 2: Realizados */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Realizados</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span id="metric-done" className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.done}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500 mt-1">Aulas concluídas</span>
        </div>

        {/* Metric 3: Faltas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-rose-50/20 dark:from-slate-900 dark:to-rose-950/10">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Faltas</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span id="metric-missed" className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {metrics.missed}
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-500 mt-1">Não compareceram</span>
        </div>

        {/* Metric 4: Pendentes */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/20 dark:from-slate-900 dark:to-amber-950/10">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pendentes</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span id="metric-pending" className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {metrics.pending}
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-500 mt-1">Próximas sessões</span>
        </div>

        {/* Metric 5: Cancelados */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cancelados</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span id="metric-canceled" className="text-2xl sm:text-3xl font-extrabold text-slate-700 dark:text-slate-300">
              {metrics.canceled}
            </span>
            <Ban className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Avisados c/ antecedência</span>
        </div>

        {/* Metric 6: Taxa de Comparecimento */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/10">
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">Taxa de Presença</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span id="metric-rate" className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {metrics.rate}%
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span id="metric-rate-desc" className="text-[11px] text-blue-600/80 dark:text-blue-400 mt-1">
            Realizados vs Faltas
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div
        id="charts-grid-wrapper"
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${
          highlightTarget === 'charts' ? 'ring-4 ring-blue-500/40 rounded-2xl p-2 bg-blue-50/50 dark:bg-blue-950/20' : ''
        }`}
      >
        {/* Chart 1: Donut Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Status dos Atendimentos</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribuição percentual deste mês</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              {metrics.total} registros
            </span>
          </div>

          {/* Visual Donut representation */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="3.5" />
                {/* Done slice */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray={`${(metrics.done / Math.max(1, metrics.total)) * 100} 100`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
                {/* Pending slice */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeDasharray={`${(metrics.pending / Math.max(1, metrics.total)) * 100} 100`}
                  strokeDashoffset={`-${(metrics.done / Math.max(1, metrics.total)) * 100}`}
                  className="transition-all duration-500"
                />
                {/* Missed slice */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeDasharray={`${(metrics.missed / Math.max(1, metrics.total)) * 100} 100`}
                  strokeDashoffset={`-${((metrics.done + metrics.pending) / Math.max(1, metrics.total)) * 100}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.rate}%</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aproveitamento</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Realizados: <strong>{metrics.done}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Pendentes: <strong>{metrics.pending}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Faltas: <strong>{metrics.missed}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Cancelados: <strong>{metrics.canceled}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Pie Objectives */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Objetivos dos Alunos</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Foco das consultorias e avaliações</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              Perfis de Treino
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-3 py-2">
            {Object.entries(objectivesDistribution).map(([objective, count], idx) => {
              const numCount = Number(count) || 0;
              const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-purple-600', 'bg-amber-500', 'bg-rose-500'];
              const color = colors[idx % colors.length];
              const pct = Math.round((numCount / Math.max(1, metrics.total)) * 100);

              return (
                <div key={objective} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[240px]">{objective}</span>
                    <span>{numCount} aluno(s) ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table & Filters Section */}
      <div
        id="table-section"
        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-300 ${
          highlightTarget === 'table' ? 'ring-4 ring-blue-500/40 rounded-2xl' : ''
        }`}
      >
        {/* Table Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno por nome, telefone ou objetivo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-900">Todos os Status</option>
                <option value="pendente" className="dark:bg-slate-900">Pendentes</option>
                <option value="realizado" className="dark:bg-slate-900">Realizados</option>
                <option value="falta" className="dark:bg-slate-900">Faltas</option>
                <option value="cancelado" className="dark:bg-slate-900">Cancelados</option>
              </select>
            </div>

            {onOpenNewAppointment && (
              <button
                type="button"
                onClick={onOpenNewAppointment}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Agendamento</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">Data & Horário</th>
                <th className="py-3.5 px-4 sm:px-6">Aluno</th>
                <th className="py-3.5 px-4 sm:px-6 hidden md:table-cell">Objetivo Principal</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="appointments-tbody" className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold">Nenhum agendamento encontrado</span>
                      <span className="text-xs">Tente ajustar a busca ou o filtro de status.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date & Time */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{apt.horario}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(apt.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{apt.alunoNome}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {apt.alunoWhatsapp}
                        </span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                        <span className="hidden sm:inline">
                          {apt.anamnese.idade} anos | {apt.anamnese.peso}kg | {apt.anamnese.altura}m
                        </span>
                      </div>
                    </td>

                    {/* Goal */}
                    <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        <Target className="w-3.5 h-3.5 text-blue-500" />
                        {apt.objetivo}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <select
                        value={apt.status}
                        onChange={(e) => onUpdateStatus(apt.id, e.target.value as AppointmentStatus)}
                        className="text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer shadow-2xs"
                      >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="realizado">✅ Realizado</option>
                        <option value="falta">❌ Falta</option>
                        <option value="cancelado">🚫 Cancelado</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Anamnese */}
                        <button
                          type="button"
                          onClick={() => onViewAnamnese(apt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 transition-colors"
                          title="Visualizar Ficha de Anamnese Completa"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Anamnese</span>
                        </button>

                        {/* WhatsApp Message */}
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(apt)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900 border border-emerald-200/80 dark:border-emerald-800 transition-colors"
                          title="Enviar Mensagem no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
