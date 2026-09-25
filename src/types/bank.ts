export type DayStatus = 'WIN' | 'LOSS' | 'PENDENTE';

export interface PlanConfig {
  initialBank: number;
  finalGoal: number;
  durationDays: number;
  startDate: string;
  dailyProfitPercent: number;
  dailyStopPercent: number;
}

export interface DayRecord {
  day: number;
  dateFormatted: string;
  startBank: number;
  targetProfit: number;
  targetBank: number;
  stopLossAmount: number;
  stopBank: number;
  status: DayStatus;
}

export interface PlanState {
  config: PlanConfig;
  records: DayRecord[];
  activeDay: number;
  isBalanceVisible: boolean;
  syncedBalance: number;
}
