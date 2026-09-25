import { DayRecord, PlanConfig } from '../types/bank';

export const formatMT = (val: number): string => {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const parts = absVal.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  return `${isNegative ? '-' : ''}MT ${integerPart},${decimalPart}`;
};

export const formatCurrency = formatMT;
export const formatBRL = formatMT; // Alias for backward compatibility

export const formatNumber = (val: number): string => {
  const parts = Math.abs(val).toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${val < 0 ? '-' : ''}${integerPart},${parts[1]}`;
};

/**
 * Calculates the required daily rate compounded over N days to go from initial to final.
 * Final = Initial * (1 + rate)^days  =>  rate = (Final / Initial)^(1 / days) - 1
 */
export const calculateRequiredDailyRate = (
  initial: number,
  finalGoal: number,
  days: number
): number => {
  if (initial <= 0 || days <= 0 || finalGoal <= initial) return 0;
  const rate = Math.pow(finalGoal / initial, 1 / days) - 1;
  return Number((rate * 100).toFixed(2));
};

export const generatePlanRecords = (
  config: PlanConfig,
  existingRecords?: DayRecord[]
): DayRecord[] => {
  const records: DayRecord[] = [];
  let projectedBank = config.initialBank;
  const dailyRate = config.dailyProfitPercent / 100;
  const stopRate = config.dailyStopPercent / 100;

  for (let i = 1; i <= config.durationDays; i++) {
    const existing = existingRecords?.find((r) => r.day === i);
    const targetProfit = projectedBank * dailyRate;
    const targetBank = projectedBank + targetProfit;
    const stopLossAmount = projectedBank * stopRate;
    const stopBank = projectedBank - stopLossAmount;

    records.push({
      day: i,
      dateFormatted: existing?.dateFormatted || `Dia ${i}`,
      startBank: projectedBank,
      targetProfit,
      targetBank,
      stopLossAmount,
      stopBank,
      status: existing ? existing.status : 'PENDENTE',
    });

    // Advance projected bank to next day target
    projectedBank = targetBank;
  }

  return records;
};

/**
 * Default preset matching the user's uploaded Screen 2
 */
export const getDefaultPlanConfig = (): PlanConfig => ({
  initialBank: 5000,
  finalGoal: 1000000,
  durationDays: 79,
  startDate: '16 de setembro',
  dailyProfitPercent: 7.0,
  dailyStopPercent: 20.0,
});

export const getDefaultPlanRecords = (): DayRecord[] => {
  const config = getDefaultPlanConfig();
  const records = generatePlanRecords(config);

  // Set Day 1 to 6 as WIN (as shown in image 3)
  for (let i = 0; i < 6; i++) {
    if (records[i]) {
      records[i].status = 'WIN';
    }
  }

  // Day 7 is in progress (PENDENTE)
  if (records[6]) {
    records[6].status = 'PENDENTE';
  }

  return records;
};
