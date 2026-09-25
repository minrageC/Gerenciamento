import React, { useState, useMemo } from 'react';
import { PlanConfig, DayRecord, DayStatus } from '../types/bank';
import { formatMT } from '../utils/calculations';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';

interface DashboardScreenProps {
  config: PlanConfig;
  records: DayRecord[];
  onUpdateAllRecords: (updatedRecords: DayRecord[]) => void;
  onNavigateToConfig: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  config,
  records,
  onUpdateAllRecords,
  onNavigateToConfig,
  onSync,
  isSyncing,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'PENDENTE'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Active day is the first PENDENTE day, or last day if all completed
  const activeDayIndex = useMemo(() => {
    const idx = records.findIndex((r) => r.status === 'PENDENTE');
    return idx !== -1 ? idx : records.length - 1;
  }, [records]);

  const activeRecord = records[activeDayIndex] || records[0];

  // Dynamic simulation & recalculation engine based on actual records
  const calculatedStats = useMemo(() => {
    let balance = config.initialBank;
    let totalProfit = 0;
    let totalLoss = 0;
    let totalWins = 0;
    let totalLosses = 0;

    // Track running balance and accumulators for each day row
    const runningAccumulators: {
      accumProfit: number;
      accumLoss: number;
      bankAfterDay: number;
    }[] = [];

    records.forEach((rec) => {
      let profitDelta = 0;
      let lossDelta = 0;

      if (rec.status === 'WIN') {
        totalWins++;
        const profit = rec.targetProfit;
        balance += profit;
        totalProfit += profit;
        profitDelta = profit;
      } else if (rec.status === 'LOSS') {
        totalLosses++;
        const loss = rec.stopLossAmount;
        balance = Math.max(0, balance - loss);
        totalLoss += loss;
        lossDelta = loss;
      }

      runningAccumulators.push({
        accumProfit: totalProfit,
        accumLoss: totalLoss,
        bankAfterDay: balance,
      });
    });

    // Today (Active Day) stats
    const todayGoal = activeRecord ? activeRecord.targetProfit : 0;
    const todayStop = activeRecord ? activeRecord.stopBank : 0;

    let todayProfitGained = 0;
    let todayProgressPercent = 0;
    let todayRemaining = todayGoal;

    if (activeRecord) {
      if (activeRecord.status === 'WIN') {
        todayProfitGained = todayGoal;
        todayProgressPercent = 100;
        todayRemaining = 0;
      } else if (activeRecord.status === 'LOSS') {
        todayProfitGained = -activeRecord.stopLossAmount;
        todayProgressPercent = 0;
        todayRemaining = todayGoal;
      } else {
        // Pendente / Aguardando operações do dia
        todayProfitGained = 0;
        todayProgressPercent = 0;
        todayRemaining = todayGoal;
      }
    }

    const yieldPercent = config.initialBank > 0
      ? ((totalProfit / config.initialBank) * 100).toFixed(2)
      : '0.00';

    const operatedDays = totalWins + totalLosses;
    const winRate = operatedDays > 0 ? Math.round((totalWins / operatedDays) * 100) : 100;

    return {
      currentBalance: balance,
      totalProfit,
      totalLoss,
      totalWins,
      totalLosses,
      operatedDays,
      winRate,
      yieldPercent,
      todayGoal,
      todayStop,
      todayProfitGained,
      todayProgressPercent,
      todayRemaining,
      runningAccumulators,
    };
  }, [config, records, activeRecord]);

  // Handle inline status toggle from table select
  const handleStatusChange = (dayNum: number, newStatus: DayStatus) => {
    const updated = records.map((r) => {
      if (r.day === dayNum) {
        return {
          ...r,
          status: newStatus,
        };
      }
      return r;
    });
    onUpdateAllRecords(updated);
  };

  const filteredRecords = useMemo(() => {
    if (statusFilter === 'ALL') return records;
    return records.filter((rec) => rec.status === statusFilter);
  }, [records, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
      {/* BEGIN: QuickStatsOverview matching Screen 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5" data-purpose="metrics-dashboard">
        {/* Primary Card: Saldo e Meta Diária (7 cols) */}
        <div className="lg:col-span-7 bg-[#101419] border border-[#1b222a] rounded-2xl p-5 relative overflow-hidden shadow-xl flex flex-col justify-between">
          {/* Subtle Glow Effect */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Title & Badges */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                Saldo Sincronizado
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                  calculatedStats.todayProfitGained > 0
                    ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400'
                    : calculatedStats.todayProfitGained < 0
                    ? 'bg-rose-950/70 border-rose-500/40 text-rose-400'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                }`}
                id="card-today-badge"
              >
                {calculatedStats.todayProfitGained > 0 ? '+' : ''}
                {formatMT(calculatedStats.todayProfitGained)} hoje
              </span>
            </div>

            {/* Main Balance Amount */}
            <div className="flex items-baseline space-x-2">
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono transition-colors"
                id="card-current-balance"
              >
                {formatMT(calculatedStats.currentBalance)}
              </h2>
            </div>

            {/* Goal Progress Meta */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-neutral-300 font-medium">
                  Meta de hoje:{' '}
                  <strong className="text-white font-mono" id="card-today-goal">
                    {formatMT(calculatedStats.todayGoal)}
                  </strong>
                </span>
                <span className="text-amber-400 font-bold font-mono" id="card-today-percent">
                  {calculatedStats.todayProgressPercent}%
                </span>
              </div>

              {/* Custom Progress Bar */}
              <div className="w-full bg-[#1c232c] h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                  id="card-progress-bar"
                  style={{ width: `${Math.min(100, Math.max(0, calculatedStats.todayProgressPercent))}%` }}
                />
              </div>

              <p className="text-xs text-neutral-400 font-normal" id="card-remaining-text">
                {calculatedStats.todayRemaining > 0 ? (
                  <>
                    Faltam{' '}
                    <span className="text-white font-semibold font-mono" id="card-remaining-val">
                      {formatMT(calculatedStats.todayRemaining)}
                    </span>{' '}
                    para fechar o dia
                  </>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    Meta de hoje 100% atingida com sucesso! 🎉
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stop Loss Alert Footer Banner */}
          <div className="mt-5 pt-3.5 border-t border-[#1b222a] flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                Dia{' '}
                <strong className="text-white font-semibold font-mono">
                  {activeRecord?.day || 1} de {config.durationDays}
                </strong>
              </span>
              <span className="text-neutral-600">•</span>
              <span>
                Stop loss em{' '}
                <span className="text-rose-400 font-semibold font-mono" id="card-today-stop">
                  {formatMT(calculatedStats.todayStop)}
                </span>
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Banca Inicial: {formatMT(config.initialBank)}
            </span>
          </div>
        </div>

        {/* Secondary Metrics: Lucro, Prejuízo e Dias (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* Lucro Acumulado */}
          <div className="bg-[#101419] border border-[#1b222a] rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                Lucro Acum.
              </span>
              <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className="text-xl sm:text-2xl font-bold text-amber-400 font-mono tracking-tight"
                id="metric-total-profit"
              >
                {formatMT(calculatedStats.totalProfit)}
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5" id="metric-total-yield">
                {calculatedStats.totalProfit > 0 ? '+' : ''}{calculatedStats.yieldPercent}% de rendimento
              </p>
            </div>
          </div>

          {/* Prejuízo */}
          <div className="bg-[#101419] border border-[#1b222a] rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                Prejuízo
              </span>
              <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className="text-xl sm:text-2xl font-bold text-rose-400 font-mono tracking-tight"
                id="metric-total-loss"
              >
                {formatMT(calculatedStats.totalLoss)}
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5" id="metric-loss-caption">
                {calculatedStats.totalLosses === 0
                  ? 'Nenhum stop atingido'
                  : `${calculatedStats.totalLosses} stop${calculatedStats.totalLosses > 1 ? 's' : ''} registrado${calculatedStats.totalLosses > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Dias OK */}
          <div className="bg-[#101419] border border-[#1b222a] rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                Dias OK
              </span>
              <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className="text-2xl font-extrabold text-white tracking-tight font-mono"
                id="metric-days-ok-ratio"
              >
                {calculatedStats.totalWins} / {calculatedStats.operatedDays > 0 ? calculatedStats.operatedDays : 0}
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5" id="metric-winrate">
                {calculatedStats.operatedDays === 0
                  ? 'Aguardando operações'
                  : `${calculatedStats.winRate}% de assertividade`}
              </p>
            </div>
          </div>

          {/* Ação Rápida / Alternar View */}
          <div className="bg-[#101419] border border-[#1b222a] rounded-2xl p-4 flex flex-col justify-center items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
              id="btn-sync-card"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <button
              onClick={onNavigateToConfig}
              className="w-full py-2 px-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-xs font-medium text-center transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Editar Plano</span>
            </button>
          </div>
        </div>
      </section>
      {/* END: QuickStatsOverview */}

      {/* BEGIN: TableSection */}
      <section
        className="bg-[#0e1216] border border-[#1b222a] rounded-2xl overflow-hidden shadow-2xl"
        data-purpose="daily-records-table"
        id="tabela-diaria"
      >
        {/* Table Header Bar */}
        <div className="px-5 py-4 border-b border-[#1b222a] flex flex-wrap items-center justify-between gap-3 bg-[#11161d]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Plano Diário Progressivo de Metas
            </h3>
            <span className="text-xs text-neutral-500 hidden sm:inline-block">
              | Registro individual dos {config.durationDays} dias
            </span>
          </div>

          {/* Right Status Badge & Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-neutral-400">
              Status geral:{' '}
              <span
                className={`font-semibold ${
                  calculatedStats.operatedDays > 0 && calculatedStats.winRate < 50
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
                id="general-status-badge"
              >
                {calculatedStats.operatedDays > 0 && calculatedStats.winRate < 50
                  ? 'Atenção ao risco'
                  : 'Em conformidade'}
              </span>
            </div>

            {/* Quick Filter buttons */}
            <div className="flex items-center gap-1 bg-[#0a0d10] p-1 rounded-lg border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('WIN')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  statusFilter === 'WIN' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-neutral-400'
                }`}
              >
                WIN
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('LOSS')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  statusFilter === 'LOSS' ? 'bg-rose-950 text-rose-300 font-semibold' : 'text-neutral-400'
                }`}
              >
                LOSS
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDENTE')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  statusFilter === 'PENDENTE' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-neutral-400'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#1c232c] text-neutral-400 text-[11px] uppercase tracking-wider bg-[#0a0d10]/60">
                <th className="py-3.5 px-4 font-semibold w-24" scope="col">
                  Data
                </th>
                <th className="py-3.5 px-4 font-semibold" scope="col">
                  Meta
                </th>
                <th className="py-3.5 px-4 font-semibold" scope="col">
                  Stop Loss
                </th>
                <th className="py-3.5 px-4 font-semibold text-center w-40" scope="col">
                  Resultado
                </th>
                <th className="py-3.5 px-4 font-semibold text-right" scope="col">
                  Lucro Acum.
                </th>
                <th className="py-3.5 px-4 font-semibold text-right" scope="col">
                  Prejuizo Acum.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171e26] font-mono" id="table-body">
              {paginatedRecords.map((record) => {
                const globalIndex = record.day - 1;
                const accum = calculatedStats.runningAccumulators[globalIndex];
                const isFocusDay = record.day === activeRecord?.day && record.status === 'PENDENTE';

                return (
                  <tr
                    key={record.day}
                    className={`transition duration-150 group ${
                      isFocusDay
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-amber-500'
                        : record.status === 'WIN'
                        ? 'hover:bg-[#131921] bg-emerald-950/10'
                        : record.status === 'LOSS'
                        ? 'hover:bg-[#131921] bg-rose-950/15'
                        : 'hover:bg-[#131921] opacity-85'
                    }`}
                    data-row-day={record.day}
                  >
                    {/* DATA Col */}
                    <td className="py-3 px-4 font-sans font-medium text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <span className={isFocusDay ? 'font-semibold text-amber-400' : ''}>
                          Dia {record.day}
                        </span>
                        {isFocusDay && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                    </td>

                    {/* META Col */}
                    <td className="py-3 px-4">
                      <div className={`font-semibold ${isFocusDay ? 'text-white font-bold' : 'text-white'}`}>
                        {formatMT(record.targetBank)}
                      </div>
                      <div
                        className={`text-[11px] ${
                          isFocusDay ? 'text-amber-400/80 font-semibold' : 'text-neutral-500'
                        }`}
                      >
                        ({formatMT(record.targetProfit)})
                      </div>
                    </td>

                    {/* STOP LOSS Col */}
                    <td className="py-3 px-4">
                      <div className="text-neutral-300">{formatMT(record.stopBank)}</div>
                      <div className="text-[11px] text-neutral-500">
                        ({formatMT(record.stopLossAmount)})
                      </div>
                    </td>

                    {/* RESULTADO Col */}
                    <td className="py-3 px-4 text-center font-sans">
                      <select
                        className={`result-selector text-xs py-1 px-3 rounded-lg font-bold cursor-pointer shadow-sm transition-all focus:outline-none ${
                          record.status === 'WIN'
                            ? 'border border-emerald-500/50 bg-[#0d1f17] text-emerald-400 focus:ring-1 focus:ring-emerald-500'
                            : record.status === 'LOSS'
                            ? 'border border-rose-500/50 bg-[#201014] text-rose-400 focus:ring-1 focus:ring-rose-500'
                            : isFocusDay
                            ? 'border border-amber-500 bg-[#1c2117] text-amber-300 focus:ring-1 focus:ring-amber-500'
                            : 'border border-neutral-700 bg-[#14181e] text-neutral-400 font-medium focus:ring-1 focus:ring-neutral-600'
                        }`}
                        value={record.status}
                        onChange={(e) =>
                          handleStatusChange(record.day, e.target.value as DayStatus)
                        }
                      >
                        <option value="WIN">WIN</option>
                        <option value="LOSS">LOSS</option>
                        <option value="PENDENTE">Pendente</option>
                      </select>
                    </td>

                    {/* LUCRO ACUM. Col */}
                    <td
                      className={`py-3 px-4 text-right ${
                        (accum?.accumProfit || 0) > 0
                          ? isFocusDay
                            ? 'text-amber-400 font-bold'
                            : 'text-amber-400/90 font-medium'
                          : 'text-neutral-400'
                      }`}
                    >
                      {formatMT(accum?.accumProfit || 0)}
                    </td>

                    {/* PREJUIZO ACUM. Col */}
                    <td
                      className={`py-3 px-4 text-right ${
                        (accum?.accumLoss || 0) > 0
                          ? 'text-rose-400/90 font-medium'
                          : 'text-neutral-400'
                      }`}
                    >
                      {formatMT(accum?.accumLoss || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination Note */}
        <div className="px-5 py-3 border-t border-[#1b222a] bg-[#0c1014] text-xs text-neutral-500 flex flex-wrap justify-between items-center gap-3">
          <span>
            Exibindo {Math.min(filteredRecords.length, (currentPage - 1) * itemsPerPage + 1)} a{' '}
            {Math.min(filteredRecords.length, currentPage * itemsPerPage)} de {records.length} dias projetados
          </span>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded text-xs font-mono transition cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-[#141920] text-neutral-400 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <span className="text-neutral-400 font-medium font-mono">
            Taxa composta: {config.dailyProfitPercent.toFixed(2)}% ao dia
          </span>
        </div>
      </section>
      {/* END: TableSection */}
    </main>
  );
};
