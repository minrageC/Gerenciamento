import React from 'react';
import { Eye, EyeOff, RotateCw, Trash2, SlidersHorizontal, LayoutDashboard } from 'lucide-react';
import { PlanConfig } from '../types/bank';
import { formatMT } from '../utils/calculations';

interface TopHeaderProps {
  currentScreen: 'config' | 'dashboard';
  onNavigate: (screen: 'config' | 'dashboard') => void;
  config: PlanConfig;
  balance: number;
  isBalanceVisible: boolean;
  onToggleBalanceVisibility: () => void;
  onSync: () => void;
  onReset: () => void;
  isSyncing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentScreen,
  onNavigate,
  config,
  balance,
  isBalanceVisible,
  onToggleBalanceVisibility,
  onSync,
  onReset,
  isSyncing,
}) => {
  return (
    <header className="border-b border-[#1b2129] bg-[#0c1014]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Ir para o Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Gerenciamento de banca
            </h1>
            <p className="text-xs font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5 uppercase">
              <span className="text-amber-400/90 font-medium">
                Plano de {config.durationDays} dias
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-400/80 font-medium">
                {config.dailyProfitPercent.toFixed(2)}% ao dia
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs between Screen 1 and Screen 2 */}
        <div className="flex items-center p-1 bg-[#11161d] border border-[#1f2730] rounded-xl text-xs font-medium">
          <button
            onClick={() => onNavigate('config')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentScreen === 'config'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configurar Plano</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentScreen === 'dashboard'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard & Metas</span>
          </button>
        </div>

        {/* Right Actions: Balance Badge & Utility Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* User Balance Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111613] border border-[#232b25] shadow-lg shadow-black/40">
            <button
              onClick={onToggleBalanceVisibility}
              aria-label="Alternar visibilidade do saldo"
              className="text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
              title={isBalanceVisible ? 'Ocultar Saldo' : 'Mostrar Saldo'}
              type="button"
            >
              {isBalanceVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-[8px] font-extrabold text-amber-950 shadow-inner">
              MT
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-100 font-mono">
              {isBalanceVisible ? formatMT(balance) : '••••••••'}
            </span>
          </div>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Sincronizar saldo da banca"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-amber-400 transition-transform ${
                isSyncing ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Sincronizar saldo</span>
          </button>

          {/* Reset Plan Button */}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700/60 bg-neutral-800/60 text-neutral-300 text-xs font-medium hover:bg-neutral-800 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Redefinir registros para status pendente"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden lg:inline">Redefinir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
