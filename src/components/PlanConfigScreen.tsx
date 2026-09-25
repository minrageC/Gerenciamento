import React, { useState, useEffect } from 'react';
import { PlanConfig } from '../types/bank';
import { calculateRequiredDailyRate, formatMT } from '../utils/calculations';
import { Calendar, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';

interface PlanConfigScreenProps {
  initialConfig: PlanConfig;
  onGeneratePlan: (newConfig: PlanConfig) => void;
  onQuickLoadPreset: (presetKey: 'screen1' | 'screen2') => void;
}

export const PlanConfigScreen: React.FC<PlanConfigScreenProps> = ({
  initialConfig,
  onGeneratePlan,
  onQuickLoadPreset,
}) => {
  const [bancaInicial, setBancaInicial] = useState<number>(initialConfig.initialBank);
  const [metaFinal, setMetaFinal] = useState<number>(initialConfig.finalGoal);
  const [duracaoDias, setDuracaoDias] = useState<number>(initialConfig.durationDays);
  const [customDays, setCustomDays] = useState<string>('');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(
    ![7, 15, 30, 60, 79, 90].includes(initialConfig.durationDays)
  );
  const [dataInicio, setDataInicio] = useState<string>(initialConfig.startDate);
  const [lucroDiario, setLucroDiario] = useState<number>(initialConfig.dailyProfitPercent);
  const [stopLoss, setStopLoss] = useState<number>(initialConfig.dailyStopPercent);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string>('');

  useEffect(() => {
    setBancaInicial(initialConfig.initialBank);
    setMetaFinal(initialConfig.finalGoal);
    setDuracaoDias(initialConfig.durationDays);
    setDataInicio(initialConfig.startDate);
    setLucroDiario(initialConfig.dailyProfitPercent);
    setStopLoss(initialConfig.dailyStopPercent);
    setIsCustomDuration(![7, 15, 30, 60, 79, 90].includes(initialConfig.durationDays));
  }, [initialConfig]);

  const handleAutoCalculateDailyRate = () => {
    const days = isCustomDuration ? (parseInt(customDays, 10) || 30) : duracaoDias;
    const computedRate = calculateRequiredDailyRate(bancaInicial, metaFinal, days);
    if (computedRate > 0) {
      setLucroDiario(computedRate);
      setSubmitFeedback(`Taxa calculada: ${computedRate}% ao dia para atingir a meta!`);
      setTimeout(() => setSubmitFeedback(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveDays = isCustomDuration
      ? Math.max(1, parseInt(customDays, 10) || 30)
      : duracaoDias;

    const newConfig: PlanConfig = {
      initialBank: Number(bancaInicial) || 5000,
      finalGoal: Number(metaFinal) || 100000,
      durationDays: effectiveDays,
      startDate: dataInicio || '16 de setembro',
      dailyProfitPercent: Number(lucroDiario) || 7.0,
      dailyStopPercent: Number(stopLoss) || 20.0,
    };

    setIsSubmitting(true);
    setSubmitFeedback('Calculando Projeção com Juros Compostos...');

    setTimeout(() => {
      setSubmitFeedback('Plano Gerado com Sucesso!');
      setTimeout(() => {
        setIsSubmitting(false);
        onGeneratePlan(newConfig);
      }, 500);
    }, 450);
  };

  // Preview projection
  const daysPreview = isCustomDuration ? (parseInt(customDays, 10) || 30) : duracaoDias;
  const projectedFinalBank = bancaInicial * Math.pow(1 + lucroDiario / 100, daysPreview);

  return (
    <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center my-4 sm:my-8 px-4">
      {/* Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Modelos rápidos dos prints enviados:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuickLoadPreset('screen1')}
            className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-[#141814] hover:bg-[#1a211a] text-amber-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Carregar Print 1 (30d • 10.5%)
          </button>
          <button
            type="button"
            onClick={() => onQuickLoadPreset('screen2')}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-[#0f1714] hover:bg-[#15231e] text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Carregar Print 2 (79d • 7.0%)
          </button>
        </div>
      </div>

      {/* Main Card Wrapper matching Screen 1 */}
      <div
        className="w-full bg-[#0c100e]/95 border border-[#1f2722] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl relative backdrop-blur-md"
        data-purpose="plan-configuration-card"
      >
        {/* Card Section Header: Gerenciamento de Banca */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1b1c14] border border-[#3b3418] flex items-center justify-center text-[#e5a019] shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-100 leading-tight">
              Gerenciamento de Banca
            </h1>
            <p className="text-[11px] font-medium tracking-wider text-[#9ba89f] uppercase mt-0.5">
              Configure seu plano
            </p>
          </div>
        </div>

        {/* Inner Form Section */}
        <section aria-labelledby="form-title" className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-medium text-zinc-100" id="form-title">
              Configure seu Plano
            </h2>
            <p className="text-xs sm:text-sm text-[#7d8b82] mt-1">
              Defina suas metas financeiras e parâmetros de gerenciamento.
            </p>
          </div>

          <form className="space-y-6" id="planForm" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Row 1, Col 1: Banca Inicial */}
              <div className="space-y-2" data-purpose="input-initial-bank">
                <label className="block text-xs font-medium text-[#92a096]" htmlFor="banca-inicial">
                  Banca Inicial (MT)
                </label>
                <input
                  className="w-full bg-[#121714] border border-[#232b26] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#415347] focus:ring-1 focus:ring-[#415347] transition duration-150 font-mono"
                  id="banca-inicial"
                  name="bancaInicial"
                  type="number"
                  step="any"
                  value={bancaInicial}
                  onChange={(e) => setBancaInicial(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              {/* Row 1, Col 2: Meta Final */}
              <div className="space-y-2" data-purpose="input-final-goal">
                <label className="block text-xs font-medium text-[#92a096]" htmlFor="meta-final">
                  Meta Final (MT)
                </label>
                <input
                  autoComplete="off"
                  className="w-full bg-[#121714] border border-[#28322c] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#4b5e52] focus:ring-1 focus:ring-[#4b5e52] transition duration-150 font-mono"
                  id="meta-final"
                  name="metaFinal"
                  type="number"
                  step="any"
                  value={metaFinal}
                  onChange={(e) => setMetaFinal(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              {/* Row 2, Col 1: Duração (Dias) */}
              <div className="space-y-2" data-purpose="input-duration">
                <label className="block text-xs font-medium text-[#92a096]" htmlFor="duracao-dias">
                  Duração (Dias)
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-[#121714] border border-[#232b26] rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-[#415347] focus:ring-1 focus:ring-[#415347] transition duration-150 pr-10 cursor-pointer"
                    id="duracao-dias"
                    name="duracaoDias"
                    value={isCustomDuration ? 'custom' : duracaoDias}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomDuration(true);
                        setCustomDays(duracaoDias.toString());
                      } else {
                        setIsCustomDuration(false);
                        setDuracaoDias(parseInt(e.target.value, 10));
                      }
                    }}
                  >
                    <option value="7">7 Dias</option>
                    <option value="15">15 Dias</option>
                    <option value="30">30 Dias</option>
                    <option value="60">60 Dias</option>
                    <option value="79">79 Dias (Modelo Trader Pro)</option>
                    <option value="90">90 Dias</option>
                    <option value="custom">Outro (Personalizado)...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {isCustomDuration && (
                  <div className="mt-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Digite a quantidade de dias (ex: 45)"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      className="w-full bg-[#121714] border border-amber-500/40 rounded-xl px-4 py-2 text-xs text-amber-300 placeholder-zinc-500 focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Row 2, Col 2: Data de Início */}
              <div className="space-y-2" data-purpose="input-start-date">
                <label className="block text-xs font-medium text-[#92a096]" htmlFor="data-inicio">
                  Data de Início
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    className="w-full bg-[#121714] border border-[#232b26] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#415347] focus:ring-1 focus:ring-[#415347] transition duration-150"
                    id="data-inicio"
                    name="dataInicio"
                    type="text"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3, Col 1: Lucro Diário % (Ideal) */}
              <div className="space-y-2" data-purpose="input-daily-profit">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#92a096]" htmlFor="lucro-diario">
                    Lucro Diário % (Ideal)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoCalculateDailyRate}
                    className="text-[11px] text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Calcular a porcentagem diária exata necessária para atingir a meta no tempo estipulado"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Calcular pela meta</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-[#121714] border border-[#232b26] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#415347] focus:ring-1 focus:ring-[#415347] transition duration-150 font-mono"
                    id="lucro-diario"
                    name="lucroDiario"
                    type="number"
                    step="0.01"
                    value={lucroDiario}
                    onChange={(e) => setLucroDiario(parseFloat(e.target.value) || 0)}
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 text-xs font-mono">
                    % ao dia
                  </div>
                </div>
              </div>

              {/* Row 3, Col 2: Stop Loss Diário % */}
              <div className="space-y-2" data-purpose="input-stop-loss">
                <label className="block text-xs font-medium text-[#92a096]" htmlFor="stop-loss">
                  Stop Loss Diário %
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#121714] border border-[#232b26] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#415347] focus:ring-1 focus:ring-[#415347] transition duration-150 font-mono"
                    id="stop-loss"
                    name="stopLoss"
                    type="number"
                    step="0.1"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 text-xs font-mono">
                    % de limite
                  </div>
                </div>
              </div>
            </div>

            {/* Projection Summary Box */}
            <div className="p-4 rounded-xl bg-[#0f1412] border border-[#1e2721] text-xs text-neutral-300 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-neutral-400">Projeção estimada ao final dos {daysPreview} dias:</span>
                <span className="ml-2 font-mono font-bold text-amber-400 text-sm">
                  {formatMT(projectedFinalBank)}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Stop loss do 1º dia: <span className="font-mono text-rose-400">{formatMT(bancaInicial * (stopLoss / 100))}</span>
              </div>
            </div>

            {/* Submit Feedback */}
            {submitFeedback && (
              <div className="text-center text-xs font-medium text-amber-400 animate-pulse">
                {submitFeedback}
              </div>
            )}

            {/* Action Button: Gerar Plano */}
            <div className="pt-3 sm:pt-4" data-purpose="submit-action">
              <button
                className="w-full py-3.5 px-6 rounded-2xl bg-[#df971b] hover:bg-[#c98614] active:scale-[0.99] text-[#12130f] font-semibold text-sm sm:text-base tracking-wide transition-all duration-150 shadow-md shadow-amber-900/20 focus:outline-none focus:ring-2 focus:ring-[#df971b] focus:ring-offset-2 focus:ring-offset-[#0c100e] cursor-pointer flex items-center justify-center gap-2"
                id="btn-gerar-plano"
                type="submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Gerando Plano...' : 'Gerar Plano'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};
