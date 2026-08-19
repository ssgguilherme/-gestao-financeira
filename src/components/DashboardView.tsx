import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  TrendingUp,
  Clock,
  ChevronRight,
  Send,
  Plus,
  ArrowRightLeft,
  Receipt,
  Lock,
  ChevronDown,
  Building2,
  DollarSign
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DashboardMetrics, Transaction, BankAccount, Investment } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDateBR, getDeviceFormattedDate, getDeviceGreeting } from '../utils/dateUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardViewProps {
  metrics: DashboardMetrics;
  categoryChart: { category: string; amount: number; color: string }[];
  monthlyHistory: { month: string; monthKey: string; receitas: number; despesas: number; saldo: number }[];
  dailyHistory?: { label: string; dayNumber: number; date: string; receitas: number; despesas: number; saldo: number }[];
  cardSpending: { cardName: string; bank: string; spent: number; limit: number; available: number; color: string }[];
  heatmapData: { date: string; dayNumber: number; amount: number; income?: number; saldo?: number; transactionsCount?: number; transactions?: Transaction[] }[];
  upcomingDues: { id: string; title: string; amount: number; dueDate: string; type: string; category: string }[];
  recentTransactions: Transaction[];
  accounts?: BankAccount[];
  investments?: Investment[];
  onSelectTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  categoryChart = [],
  monthlyHistory = [],
  dailyHistory = [],
  cardSpending = [],
  heatmapData = [],
  recentTransactions = [],
  upcomingDues = [],
  accounts = [],
  investments = [],
  onSelectTab,
  onOpenNewTransaction
}) => {
  const { user } = useAuth();
  const [currentDateStr, setCurrentDateStr] = React.useState(() => getDeviceFormattedDate());
  const [greeting, setGreeting] = React.useState(() => getDeviceGreeting());
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [activeChartLine, setActiveChartLine] = useState<'todos' | 'despesas' | 'receitas'>('todos');
  const [chartTimeframe, setChartTimeframe] = useState<'mensal' | 'diario'>('mensal');
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    date: string;
    dayNumber: number;
    amount: number;
    income?: number;
    saldo?: number;
    transactions?: Transaction[];
  } | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateStr(getDeviceFormattedDate());
      setGreeting(getDeviceGreeting());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const defaultMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const safeCategoryChart = Array.isArray(categoryChart) ? categoryChart : [];
  const safeRecentTransactions = Array.isArray(recentTransactions) ? recentTransactions : [];
  const safeUpcomingDues = Array.isArray(upcomingDues) ? upcomingDues : [];

  // Format BRL helper
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val || 0);
  };

  // Net worth calculation
  const totalNetWorth = metrics?.totalBalance ?? 0;
  const formattedNetWorth = formatBRL(totalNetWorth).replace('R$', '').trim();
  const [netWorthInt, netWorthDec] = formattedNetWorth.includes(',')
    ? formattedNetWorth.split(',')
    : [formattedNetWorth, '00'];

  // Calculate accounts sub-totals
  const checkingAccs = (accounts || []).filter((a) => a.type === 'corrente');
  const checkingTotal = checkingAccs.reduce((sum, a) => sum + (a.balance || 0), 0);

  const savingsAccs = (accounts || []).filter((a) => a.type === 'poupanca');
  const savingsTotal = savingsAccs.reduce((sum, a) => sum + (a.balance || 0), 0);

  const investmentsList = investments || [];
  const investmentsTotal = investmentsList.reduce(
    (sum, inv) => sum + (inv.totalValue || (inv.quantity || 0) * (inv.averagePrice || 0)),
    0
  );

  // Donut Chart Data
  const donutColors = ['#38bdf8', '#c084fc', '#e2f163', '#94a3b8', '#f43f5e', '#ec4899'];
  const hasCategoryData = safeCategoryChart.length > 0;

  const donutLabels = hasCategoryData
    ? safeCategoryChart.map((c) => c.category)
    : ['Sem Gastos'];

  const donutValues = hasCategoryData
    ? safeCategoryChart.map((c) => c.amount)
    : [1];

  const doughnutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: hasCategoryData
          ? safeCategoryChart.map((c, i) => c.color || donutColors[i % donutColors.length])
          : ['#334155'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '76%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasCategoryData,
        callbacks: {
          label: (context: any) => ` R$ ${context.raw}`
        }
      }
    }
  };

  const trendValue = metrics?.netIncomeTrend ?? 0;
  const accountsCount = (accounts || []).length;

  return (
    <div className="space-y-6 pb-12 text-slate-900 dark:text-slate-100 animate-fadeIn transition-colors">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {currentDateStr}
          </p>
          <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greeting}, {user?.name ? user.name.split(' ')[0] : 'Usuário'}
            </h1>
            {user?.companyName && (
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#e2f163] px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center space-x-1.5 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                title="Ver Configurações da Empresa"
              >
                <span>🏢</span>
                <span>{user.companyName}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Section: Net Worth Hero Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Total Net Worth Hero Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between relative overflow-hidden transition-colors">
          {/* Card Top Label */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patrimônio líquido total</span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {user?.email ? user.email.split('@')[0] : 'CONTA'}
            </span>
          </div>

          {/* Value & Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 my-4">
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-light text-slate-400">R$</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {netWorthInt}
                </span>
                <span className="text-2xl font-semibold text-slate-500 dark:text-slate-400">,{netWorthDec}</span>
              </div>

              {/* Trend Tag */}
              <div className="mt-3 space-y-1">
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  trendValue >= 0
                    ? 'text-emerald-600 dark:text-[#4ade80] bg-emerald-50 dark:bg-[#4ade80]/10 border-emerald-200 dark:border-[#4ade80]/20'
                    : 'text-red-500 bg-red-500/10 border-red-500/20'
                }`}>
                  {trendValue >= 0 ? '+' : ''}{trendValue}% este mês
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {accountsCount > 0 ? `Em ${accountsCount} conta(s) cadastrada(s)` : 'Nenhuma conta cadastrada'}
                </p>
              </div>

              {/* View Report & Timeframe Controls */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onSelectTab('reports')}
                  className="px-3.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#1a2232] dark:hover:bg-[#202b3f] border border-slate-300 dark:border-[#2c384f] text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-full transition-all cursor-pointer"
                >
                  Ver Relatório
                </button>

                {/* Timeframe selector (Mensal vs Diário) */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#121722] p-1 rounded-lg border border-slate-200 dark:border-[#242f45] text-[10px] font-bold">
                  <button
                    onClick={() => setChartTimeframe('mensal')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      chartTimeframe === 'mensal'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    Visão Mensal
                  </button>
                  <button
                    onClick={() => setChartTimeframe('diario')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      chartTimeframe === 'diario'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    Dia a Dia (Tempo Real)
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                  <button
                    onClick={() => setActiveChartLine('todos')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      activeChartLine === 'todos' ? 'bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setActiveChartLine('despesas')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      activeChartLine === 'despesas' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-rose-400/70 hover:text-rose-400'
                    }`}
                  >
                    Despesas
                  </button>
                  <button
                    onClick={() => setActiveChartLine('receitas')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      activeChartLine === 'receitas' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-sky-400/70 hover:text-sky-400'
                    }`}
                  >
                    Receitas
                  </button>
                </div>
              </div>
            </div>

            {/* Functional Dynamic Wave Chart (Ondas Suaves em Tempo Real) */}
            {(() => {
              // Determine active dataset
              const chartData = chartTimeframe === 'diario'
                ? (Array.isArray(dailyHistory) && dailyHistory.length > 0
                    ? dailyHistory.map(d => ({ month: `${d.dayNumber}`, monthKey: d.date, receitas: d.receitas, despesas: d.despesas, saldo: d.saldo }))
                    : (Array.isArray(heatmapData) && heatmapData.length > 0
                        ? heatmapData.map(h => ({ month: `${h.dayNumber}`, monthKey: h.date, receitas: h.income || 0, despesas: h.amount || 0, saldo: (h.income || 0) - (h.amount || 0) }))
                        : []))
                : (Array.isArray(monthlyHistory) && monthlyHistory.length > 0
                    ? monthlyHistory
                    : [
                        { month: 'Mar', monthKey: '2026-03', receitas: 0, despesas: 0, saldo: 0 },
                        { month: 'Abr', monthKey: '2026-04', receitas: 0, despesas: 0, saldo: 0 },
                        { month: 'Mai', monthKey: '2026-05', receitas: 0, despesas: 0, saldo: 0 },
                        { month: 'Jun', monthKey: '2026-06', receitas: 0, despesas: 0, saldo: 0 },
                        { month: 'Jul', monthKey: '2026-07', receitas: 0, despesas: 0, saldo: 0 },
                        { month: 'Ago', monthKey: '2026-08', receitas: 0, despesas: 0, saldo: 0 }
                      ]);

              const totalPoints = chartData.length || 1;
              const rawMax = Math.max(
                100,
                ...chartData.map((m) => Math.max(m.receitas || 0, m.despesas || 0, Math.abs(m.saldo || 0)))
              );
              const maxValInHistory = rawMax * 1.15;

              const svgWidth = 340;
              const svgHeight = 120;
              const paddingX = 12;
              const paddingY = 20;
              const usableW = svgWidth - paddingX * 2;
              const usableH = svgHeight - paddingY * 2;

              const getXCoord = (i: number) => paddingX + (i / Math.max(1, totalPoints - 1)) * usableW;
              const getYCoord = (val: number) => {
                const normVal = Math.max(0, val);
                return (svgHeight - paddingY) - (normVal / maxValInHistory) * usableH;
              };

              // Monotone Cubic Spline for pristine smooth waves
              const buildWavePathD = (key: 'despesas' | 'receitas' | 'saldo') => {
                const points = chartData.map((m, idx) => ({
                  x: getXCoord(idx),
                  y: getYCoord(m[key] || 0)
                }));

                if (points.length < 2) return `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;

                const n = points.length;
                const dx: number[] = [];
                const dy: number[] = [];
                const ms: number[] = [];

                for (let i = 0; i < n - 1; i++) {
                  dx.push(points[i + 1].x - points[i].x);
                  dy.push(points[i + 1].y - points[i].y);
                  ms.push(dy[i] / dx[i]);
                }

                const c1s: number[] = [ms[0]];
                for (let i = 0; i < n - 2; i++) {
                  const m = ms[i];
                  const nextM = ms[i + 1];
                  if (m * nextM <= 0) {
                    c1s.push(0);
                  } else {
                    const common = dx[i] + dx[i + 1];
                    c1s.push((3 * common) / ((common + dx[i + 1]) / m + (common + dx[i]) / nextM));
                  }
                }
                c1s.push(ms[ms.length - 1]);

                let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
                for (let i = 0; i < n - 1; i++) {
                  const p1 = points[i];
                  const p2 = points[i + 1];
                  const d = dx[i];
                  const cp1x = p1.x + d / 3;
                  const cp1y = p1.y + (c1s[i] * d) / 3;
                  const cp2x = p2.x - d / 3;
                  const cp2y = p2.y - (c1s[i + 1] * d) / 3;

                  path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
                }

                return path;
              };

              const buildAreaWavePathD = (key: 'despesas' | 'receitas' | 'saldo') => {
                const curvePath = buildWavePathD(key);
                const lastX = getXCoord(totalPoints - 1);
                const firstX = getXCoord(0);
                const baselineY = svgHeight - 6;
                return `${curvePath} L ${lastX.toFixed(1)} ${baselineY} L ${firstX.toFixed(1)} ${baselineY} Z`;
              };

              const activeItem = hoveredPointIdx !== null ? chartData[hoveredPointIdx] : null;

              return (
                <div className="relative h-36 w-full flex flex-col justify-between pt-1">
                  {/* Floating Tooltip Banner */}
                  {activeItem && (
                    <div
                      className="absolute -top-4 z-20 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-[11px] space-y-0.5 text-white animate-fadeIn"
                      style={{
                        left: `${Math.min(Math.max(getXCoord(hoveredPointIdx!) - 65, 5), svgWidth - 140)}px`
                      }}
                    >
                      <div className="font-bold text-slate-300 border-b border-slate-800 pb-0.5 flex justify-between items-center gap-3">
                        <span>{chartTimeframe === 'diario' ? `Dia ${activeItem.month}` : activeItem.month}</span>
                        <span className="text-[9px] text-slate-400">{activeItem.monthKey}</span>
                      </div>
                      <div className="flex items-center justify-between space-x-3 text-rose-400">
                        <span>Despesas:</span>
                        <span className="font-extrabold">{formatBRL(activeItem.despesas)}</span>
                      </div>
                      <div className="flex items-center justify-between space-x-3 text-sky-400">
                        <span>Receitas:</span>
                        <span className="font-extrabold">{formatBRL(activeItem.receitas)}</span>
                      </div>
                      <div className="flex items-center justify-between space-x-3 text-emerald-400 pt-0.5 border-t border-slate-800/60">
                        <span>Saldo:</span>
                        <span className="font-extrabold">{formatBRL(activeItem.saldo)}</span>
                      </div>
                    </div>
                  )}

                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="waveLimeGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#84cc16" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#e2f163" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="waveRoseGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="waveSkyGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                        </linearGradient>

                        <filter id="waveGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="1.5" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Subtle wave background grid */}
                      <line
                        x1={paddingX}
                        y1={svgHeight - 10}
                        x2={svgWidth - paddingX}
                        y2={svgHeight - 10}
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.3"
                      />

                      {/* Wave 1: Receitas (Cyan Wave) */}
                      {(activeChartLine === 'todos' || activeChartLine === 'receitas') && (
                        <g>
                          <path d={buildAreaWavePathD('receitas')} fill="url(#waveSkyGlow)" />
                          <path
                            d={buildWavePathD('receitas')}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#waveGlowEffect)"
                          />
                        </g>
                      )}

                      {/* Wave 2: Despesas (Rose / Pink Wave) */}
                      {(activeChartLine === 'todos' || activeChartLine === 'despesas') && (
                        <g>
                          <path d={buildAreaWavePathD('despesas')} fill="url(#waveRoseGlow)" />
                          <path
                            d={buildWavePathD('despesas')}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#waveGlowEffect)"
                          />
                        </g>
                      )}

                      {/* Wave 3: Saldo (Lime / Emerald Wave) */}
                      {activeChartLine === 'todos' && (
                        <g>
                          <path d={buildAreaWavePathD('saldo')} fill="url(#waveLimeGlow)" />
                          <path
                            d={buildWavePathD('saldo')}
                            fill="none"
                            stroke="#84cc16"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="dark:stroke-[#e2f163]"
                            filter="url(#waveGlowEffect)"
                          />
                        </g>
                      )}

                      {/* Active point vertical line indicator */}
                      {hoveredPointIdx !== null && (
                        <line
                          x1={getXCoord(hoveredPointIdx)}
                          y1={paddingY - 8}
                          x2={getXCoord(hoveredPointIdx)}
                          y2={svgHeight - 8}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Smooth Wave Data Point Crests */}
                      {chartData.map((m, idx) => {
                        const cx = getXCoord(idx);
                        const cyExp = getYCoord(m.despesas || 0);
                        const cyInc = getYCoord(m.receitas || 0);
                        const isHovered = hoveredPointIdx === idx;

                        return (
                          <g key={idx}>
                            {(activeChartLine === 'todos' || activeChartLine === 'receitas') && (
                              <circle
                                cx={cx}
                                cy={cyInc}
                                r={isHovered ? 4.5 : (chartTimeframe === 'diario' ? 2 : 3)}
                                fill="#38bdf8"
                                stroke="#0f172a"
                                strokeWidth="1"
                                className="transition-all duration-150"
                              />
                            )}

                            {(activeChartLine === 'todos' || activeChartLine === 'despesas') && (
                              <circle
                                cx={cx}
                                cy={cyExp}
                                r={isHovered ? 4.5 : (chartTimeframe === 'diario' ? 2 : 3)}
                                fill="#f43f5e"
                                stroke="#0f172a"
                                strokeWidth="1"
                                className="transition-all duration-150"
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* Interactive hover hit areas */}
                      {chartData.map((_, idx) => {
                        const colW = usableW / Math.max(1, totalPoints - 1);
                        const colX = getXCoord(idx) - colW / 2;

                        return (
                          <rect
                            key={`hit-${idx}`}
                            x={Math.max(0, colX)}
                            y={0}
                            width={Math.max(8, colW)}
                            height={svgHeight}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPointIdx(idx)}
                            onMouseLeave={() => setHoveredPointIdx(null)}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between items-center px-1 text-[9px] font-bold text-slate-400 overflow-x-auto">
                    {chartData.map((m, idx) => {
                      // Skip some labels on daily mode so x-axis isn't crowded
                      if (chartTimeframe === 'diario' && idx % 3 !== 0 && idx !== chartData.length - 1) {
                        return null;
                      }
                      return (
                        <span
                          key={idx}
                          className={`transition-colors cursor-pointer ${
                            hoveredPointIdx === idx ? 'text-emerald-400 font-extrabold scale-110' : 'hover:text-slate-200'
                          }`}
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                          onMouseLeave={() => setHoveredPointIdx(null)}
                        >
                          {m.month}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Actions Card (1 col) */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ações rápidas</span>

          <div className="grid grid-cols-3 gap-2.5 my-3">
            {/* New Transaction */}
            <button
              onClick={onOpenNewTransaction}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#1a2232] dark:hover:bg-[#222d42] border border-slate-200 dark:border-[#2a364f] rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-[#e2f163] transition-colors" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Novo</span>
            </button>

            {/* Transactions History */}
            <button
              onClick={() => onSelectTab('transactions')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#1a2232] dark:hover:bg-[#222d42] border border-slate-200 dark:border-[#2a364f] rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
            >
              <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-[#e2f163] transition-colors" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Extrato</span>
            </button>

            {/* Investments */}
            <button
              onClick={() => onSelectTab('investments')}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#1a2232] dark:hover:bg-[#222d42] border border-slate-200 dark:border-[#2a364f] rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
            >
              <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-[#e2f163] transition-colors" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Investir</span>
            </button>
          </div>

          {/* Pay Bills Wide Action */}
          <button
            onClick={() => onSelectTab('fixed')}
            className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-[#1a2232] dark:hover:bg-[#222d42] border border-slate-200 dark:border-[#2a364f] rounded-2xl flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-200 dark:bg-[#253046] rounded-xl text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-[#e2f163]">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Pagar contas</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {safeUpcomingDues.length > 0 ? `${safeUpcomingDues.length} conta(s) a vencer` : 'Nenhuma conta a vencer'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Middle Section: Accounts Cards Row (Checking, Savings, Investing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Checking */}
        <div
          onClick={() => onSelectTab('accounts')}
          className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] hover:border-slate-300 dark:hover:border-[#323f59] p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <span>| Conta Corrente</span>
            </span>
            <Wallet className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatBRL(checkingTotal)}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">
              {checkingAccs.length > 0 ? `${checkingAccs.length} conta(s) cadastrada(s)` : 'Sem conta cadastrada'}
            </p>
          </div>
        </div>

        {/* Savings */}
        <div
          onClick={() => onSelectTab('accounts')}
          className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] hover:border-slate-300 dark:hover:border-[#323f59] p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <span>| Poupança</span>
            </span>
            <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatBRL(savingsTotal)}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">
              {savingsAccs.length > 0 ? `${savingsAccs.length} conta(s) de poupança` : 'Sem conta de poupança'}
            </p>
          </div>
        </div>

        {/* Investing */}
        <div
          onClick={() => onSelectTab('investments')}
          className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] hover:border-slate-300 dark:hover:border-[#323f59] p-5 rounded-3xl shadow-sm dark:shadow-xl space-y-3 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <span>| Investimentos</span>
            </span>
            <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatBRL(investmentsTotal)}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">
              {investmentsList.length > 0 ? `${investmentsList.length} ativo(s) cadastrado(s)` : 'Sem investimentos cadastrados'}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Daily Timeline & Heatmap Section ("O que aconteceu em cada dia") */}
      <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#222b3d] pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-[#e2f163] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Linha do Tempo Diária
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Situação da Conta por Dia
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique em qualquer dia para ver exatamente o que aconteceu e todas as movimentações.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Receita</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Despesa</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Sem gasto</span>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-15 gap-2 pt-2">
          {(() => {
            const daysList = (Array.isArray(heatmapData) && heatmapData.length > 0)
              ? heatmapData
              : Array.from({ length: 31 }, (_, i) => ({
                  date: `2026-08-${(i + 1).toString().padStart(2, '0')}`,
                  dayNumber: i + 1,
                  amount: 0,
                  income: 0,
                  saldo: 0,
                  transactions: []
                }));

            return daysList.map((dayItem) => {
              const hasIncome = (dayItem.income || 0) > 0;
              const hasExpense = (dayItem.amount || 0) > 0;
              const dayTxs = dayItem.transactions || [];

              return (
                <button
                  key={dayItem.dayNumber}
                  onClick={() => setSelectedDayDetail(dayItem)}
                  className={`p-2 rounded-2xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer relative group ${
                    hasIncome && hasExpense
                      ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                      : hasIncome
                      ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                      : hasExpense
                      ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-slate-50 dark:bg-[#182030] border-slate-200 dark:border-[#243048] hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {dayItem.dayNumber}
                  </span>

                  {/* Indicators */}
                  <div className="flex items-center space-x-1 my-1">
                    {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                    {!hasIncome && !hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                  </div>

                  <span className="text-[9px] font-bold truncate max-w-full text-slate-500 dark:text-slate-400">
                    {hasExpense ? `-${Math.round(dayItem.amount)}` : hasIncome ? `+${Math.round(dayItem.income || 0)}` : 'R$0'}
                  </span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Selected Day Details Modal */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222b3d] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-[#e2f163]">
                  Movimentações do Dia
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Dia {selectedDayDetail.dayNumber} ({selectedDayDetail.date})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1f293d] hover:bg-slate-200 dark:hover:bg-[#2e3b56] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Day Metrics Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-[#182030] rounded-2xl border border-slate-200 dark:border-[#25324c]">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Entradas</p>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{formatBRL(selectedDayDetail.income || 0)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#182030] rounded-2xl border border-slate-200 dark:border-[#25324c]">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Saídas</p>
                <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                  -{formatBRL(selectedDayDetail.amount || 0)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#182030] rounded-2xl border border-slate-200 dark:border-[#25324c]">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Saldo Líquido</p>
                <p className={`text-sm font-extrabold mt-0.5 ${
                  (selectedDayDetail.saldo || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {formatBRL(selectedDayDetail.saldo || 0)}
                </p>
              </div>
            </div>

            {/* Day Transactions List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Lançamentos registrados neste dia
              </h4>

              {selectedDayDetail.transactions && selectedDayDetail.transactions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedDayDetail.transactions.map((tx) => {
                    const isIncome = tx.type === 'receita';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-slate-50 dark:bg-[#1a2232] border border-slate-200 dark:border-[#26334d] rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {isIncome ? '↑' : '↓'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {tx.category} • {tx.paymentMethod || 'Dinheiro/Pix'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-xs font-extrabold ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'
                          }`}>
                            {isIncome ? '+' : '-'}{formatBRL(Math.abs(tx.amount))}
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            tx.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 dark:bg-[#182030] rounded-2xl border border-dashed border-slate-300 dark:border-[#26334d] space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum lançamento nesta data.</p>
                  <button
                    onClick={() => {
                      setSelectedDayDetail(null);
                      onOpenNewTransaction();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    + Registrar Lançamento para este dia
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-[#1f293d] dark:hover:bg-[#2b3852] text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Spending Breakdown */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Detalhamento de gastos</span>
            <div className="relative">
              <button className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-[#1a2232] border border-slate-300 dark:border-[#26334d] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg">
                <span>{selectedMonth}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 my-2">
            {/* Donut chart */}
            <div className="relative h-44 w-44 mx-auto flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-emerald-600 dark:text-[#e2f163]">
                  {hasCategoryData ? `${safeCategoryChart.length}` : '0'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                  {hasCategoryData ? 'categorias' : 'gastos'}
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-3">
              {hasCategoryData ? (
                safeCategoryChart.slice(0, 4).map((catItem, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: catItem.color || donutColors[idx % donutColors.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{catItem.category}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatBRL(catItem.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 space-y-1">
                  <p className="text-xs text-slate-400 font-medium">Nenhum gasto registrado neste mês.</p>
                  <p className="text-[11px] text-slate-500">R$ 0,00</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lançamentos recentes</span>
            <button
              onClick={() => onSelectTab('transactions')}
              className="text-[11px] font-semibold text-emerald-600 dark:text-[#e2f163] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {safeRecentTransactions.length > 0 ? (
              safeRecentTransactions.slice(0, 5).map((tx) => {
                const isIncome = tx.type === 'receita';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-transparent hover:bg-slate-100 dark:hover:bg-[#1a2232] rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-[#1f293d] border border-slate-300 dark:border-[#2e3b56] flex items-center justify-center text-xs font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
                        {(tx as any).initials || tx.description.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {tx.category} - {formatDateBR(tx.date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        isIncome ? 'text-emerald-600 dark:text-[#4ade80]' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatBRL(Math.abs(tx.amount))}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-400 font-medium">Nenhum lançamento registrado ainda.</p>
                <button
                  onClick={onOpenNewTransaction}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeiro Lançamento</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

