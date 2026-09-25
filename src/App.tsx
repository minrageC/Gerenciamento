import React, { useState, useEffect } from 'react';
import { PlanConfig, DayRecord } from './types/bank';
import {
  getDefaultPlanConfig,
  getDefaultPlanRecords,
  generatePlanRecords,
} from './utils/calculations';
import { TopHeader } from './components/TopHeader';
import { PlanConfigScreen } from './components/PlanConfigScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { Toast } from './components/Toast';

const STORAGE_KEY_CONFIG = 'trader_pro_bank_config';
const STORAGE_KEY_RECORDS = 'trader_pro_bank_records';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'config' | 'dashboard'>('dashboard');
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize config
  const [config, setConfig] = useState<PlanConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return getDefaultPlanConfig();
  });

  // Initialize records
  const [records, setRecords] = useState<DayRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return getDefaultPlanRecords();
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // Ignore
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch {
      // Ignore
    }
  }, [records]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // State for reset confirmation modal (to avoid window.confirm issues in iframe)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Calculate current total balance based purely on compound targets and stop losses
  const currentCalculatedBalance = React.useMemo(() => {
    let bal = config.initialBank;
    records.forEach((rec) => {
      if (rec.status === 'WIN') {
        bal += rec.targetProfit;
      } else if (rec.status === 'LOSS') {
        bal = Math.max(0, bal - rec.stopLossAmount);
      }
    });
    return bal;
  }, [config, records]);

  // Handle plan generation from Screen 1
  const handleGeneratePlan = (newConfig: PlanConfig) => {
    setConfig(newConfig);
    const newRecords = generatePlanRecords(newConfig);
    setRecords(newRecords);
    setCurrentScreen('dashboard');
    showToast(`Novo plano de ${newConfig.durationDays} dias gerado com sucesso!`);
  };

  // Update all records (from inline table selects)
  const handleUpdateAllRecords = (updatedRecords: DayRecord[]) => {
    setRecords(updatedRecords);
    showToast('Banca e projeções recalculadas!');
  };

  // Preset loaders for the two screens provided by the user
  const handleQuickLoadPreset = (presetKey: 'screen1' | 'screen2') => {
    if (presetKey === 'screen1') {
      const p1Config: PlanConfig = {
        initialBank: 5000,
        finalGoal: 100000,
        durationDays: 30,
        startDate: '16 de setembro',
        dailyProfitPercent: 10.5,
        dailyStopPercent: 10.0,
      };
      setConfig(p1Config);
      const p1Records = generatePlanRecords(p1Config);
      setRecords(p1Records);
      setCurrentScreen('config');
      showToast('Modelo da Imagem 1 carregado (30 Dias • 10.5% ao dia)');
    } else {
      const p2Config = getDefaultPlanConfig();
      setConfig(p2Config);
      const p2Records = getDefaultPlanRecords();
      setRecords(p2Records);
      setCurrentScreen('dashboard');
      showToast('Modelo da Imagem 2 carregado (79 Dias • 7.0% ao dia • Dias 1 a 6 WIN)');
    }
  };

  // Sync action simulation
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Saldo sincronizado em tempo real!');
    }, 600);
  };

  // Reset plan action: direct and reliable execution
  const handleConfirmReset = () => {
    const resetRecords = records.map((r) => ({
      ...r,
      status: 'PENDENTE' as const,
    }));
    setRecords(resetRecords);
    setIsResetConfirmOpen(false);
    showToast('Plano redefinido: todos os dias estão pendentes!');
  };

  return (
    <div className="min-h-screen text-slate-200 antialiased flex flex-col justify-between select-none">
      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* Main Top Bar matching contract & screenshots */}
      <TopHeader
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        config={config}
        balance={currentCalculatedBalance}
        isBalanceVisible={isBalanceVisible}
        onToggleBalanceVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
        onSync={handleSync}
        onReset={() => setIsResetConfirmOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Active Screen View */}
      {currentScreen === 'config' ? (
        <PlanConfigScreen
          initialConfig={config}
          onGeneratePlan={handleGeneratePlan}
          onQuickLoadPreset={handleQuickLoadPreset}
        />
      ) : (
        <DashboardScreen
          config={config}
          records={records}
          onUpdateAllRecords={handleUpdateAllRecords}
          onNavigateToConfig={() => setCurrentScreen('config')}
          onSync={handleSync}
          isSyncing={isSyncing}
        />
      )}

      {/* Footer matching Screen 2 */}
      <footer
        className="border-t border-[#161c23] bg-[#0a0d10] py-4 text-center text-xs text-neutral-500 mt-6"
        data-purpose="page-footer"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Painel Profissional de Gerenciamento • Metodologia de Juros Compostos Diários</span>
          <span className="font-mono text-neutral-400">Trader Pro v2.5</span>
        </div>
      </footer>

      {/* In-app Confirmation Modal for Redefinir Plano */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11171f] border border-[#232c37] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Redefinir Plano?</h3>
                <p className="text-xs text-neutral-400">Status dos dias para Pendente</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Tem certeza de que deseja zerar os resultados diários e voltar todos os dias para o status <strong className="text-amber-400 font-semibold">Pendente</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition cursor-pointer"
              >
                Sim, Redefinir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
