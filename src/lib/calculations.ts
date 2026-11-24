import type {
  CurrencyCode,
  DreamItem,
  ExpensesConfig,
  FinancingParams,
  IncomeProfile,
  TimelineKey,
} from '../types/dreamline';

const WEEKS_PER_MONTH = 4.333;

export function sanitizePositive(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/**
 * Computes monthly amortized payment for financed/leased items.
 * Handles 0% APR cleanly without division by zero.
 */
export function calculateMonthlyLoanPayment(params: FinancingParams): number {
  const totalPrice = sanitizePositive(params.totalPrice);
  const downPayment = Math.min(sanitizePositive(params.downPayment), totalPrice);
  const principal = Math.max(0, totalPrice - downPayment);
  const months = Math.max(1, Math.round(sanitizePositive(params.months) || 1));
  const annualRatePct = sanitizePositive(params.annualRatePct);

  if (principal === 0) return 0;
  if (annualRatePct === 0) {
    return principal / months;
  }

  const monthlyRate = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

/**
 * Converts a dream item's cost definition into monthly cash flow
 * for the selected timeline ('6m' or '12m').
 */
export function getDreamMonthlyCost(
  dream: Pick<DreamItem, 'costType' | 'amount' | 'financing'>,
  timeline: TimelineKey,
): number {
  const monthsInTimeline = timeline === '6m' ? 6 : 12;

  switch (dream.costType) {
    case 'free':
      return 0;
    case 'monthly':
      return sanitizePositive(dream.amount);
    case 'one_time':
      return sanitizePositive(dream.amount) / monthsInTimeline;
    case 'financed':
      if (dream.financing) {
        return calculateMonthlyLoanPayment(dream.financing);
      }
      return sanitizePositive(dream.amount);
  }
}

export interface BaselineExpenseSummary {
  baselineMonthly: number;
  currentDetailedTotal: number;
  trimmedDetailedTotal: number;
  monthlySavings: number;
}

export function getBaselineExpenses(
  expenses: ExpensesConfig,
): BaselineExpenseSummary {
  const currentDetailedTotal = expenses.items.reduce(
    (sum, item) => sum + sanitizePositive(item.currentMonthly),
    0,
  );
  const trimmedDetailedTotal = expenses.items.reduce(
    (sum, item) => sum + sanitizePositive(item.trimmedMonthly),
    0,
  );
  const monthlySavings = Math.max(0, currentDetailedTotal - trimmedDetailedTotal);
  const baselineMonthly =
    expenses.mode === 'quick'
      ? sanitizePositive(expenses.quickMonthly)
      : trimmedDetailedTotal;

  return {
    baselineMonthly,
    currentDetailedTotal,
    trimmedDetailedTotal,
    monthlySavings,
  };
}

export interface TimelineActionStats {
  totalSteps: number;
  plannedSteps: number;
  completedSteps: number;
  nextNowAction: {
    dreamId: string;
    dreamTitle: string;
    stepText: string;
  } | null;
}

export interface TimelineMetrics {
  topFourDreams: DreamItem[];
  topFourCount: number;
  havingMonthly: number;
  beingMonthly: number;
  doingMonthly: number;
  dreamsMonthlyTotal: number;
  baselineMonthly: number;
  bufferMultiplier: number;
  bufferAmount: number;
  bufferedExpenses: number;
  tmi: number;
  tdi: number;
  targetAnnual: number;
  monthlyGap: number;
  dailyGap: number;
  isFunded: boolean;
  currentRelativeHourly: number;
  targetRelativeHourly: number;
  actionStats: TimelineActionStats;
}

export function calculateTimelineMetrics(
  dreams: DreamItem[],
  timeline: TimelineKey,
  expenses: ExpensesConfig,
  income: IncomeProfile,
): TimelineMetrics {
  const topFourDreams = dreams.filter((d) => d.isTopFour).slice(0, 4);

  let havingMonthly = 0;
  let beingMonthly = 0;
  let doingMonthly = 0;

  for (const dream of topFourDreams) {
    const monthly = getDreamMonthlyCost(dream, timeline);
    if (dream.category === 'having') havingMonthly += monthly;
    else if (dream.category === 'being') beingMonthly += monthly;
    else doingMonthly += monthly;
  }

  const dreamsMonthlyTotal = havingMonthly + beingMonthly + doingMonthly;
  const { baselineMonthly } = getBaselineExpenses(expenses);
  const bufferMultiplier = Math.max(1, sanitizePositive(expenses.bufferMultiplier) || 1.3);
  const bufferedExpenses = baselineMonthly * bufferMultiplier;
  const bufferAmount = bufferedExpenses - baselineMonthly;

  const tmi = dreamsMonthlyTotal + bufferedExpenses;
  const tdi = tmi / 30;
  const targetAnnual = tmi * 12;

  const currentMonthlyIncome = sanitizePositive(income.currentMonthlyIncome);
  const monthlyGap = tmi - currentMonthlyIncome;
  const dailyGap = monthlyGap / 30;
  const isFunded = monthlyGap <= 0;

  const currentWeeklyHours = sanitizePositive(income.currentWeeklyHours);
  const targetWeeklyHours = sanitizePositive(income.targetWeeklyHours);

  const currentRelativeHourly =
    currentWeeklyHours > 0
      ? currentMonthlyIncome / (currentWeeklyHours * WEEKS_PER_MONTH)
      : 0;
  const targetRelativeHourly =
    targetWeeklyHours > 0 ? tmi / (targetWeeklyHours * WEEKS_PER_MONTH) : 0;

  let plannedSteps = 0;
  let completedSteps = 0;
  let nextNowAction: TimelineActionStats['nextNowAction'] = null;

  for (const dream of topFourDreams) {
    const steps = [dream.actions.now, dream.actions.tomorrow, dream.actions.dayAfter];
    for (const step of steps) {
      if (step.text.trim().length > 0) plannedSteps += 1;
      if (step.done) completedSteps += 1;
    }

    if (!nextNowAction && !dream.actions.now.done) {
      const candidateText =
        dream.actions.now.text.trim() ||
        (dream.category === 'being' && dream.doingConversion?.trim()
          ? `First 10-min step for: ${dream.doingConversion.trim()}`
          : `First 10-min step for: ${dream.title}`);
      nextNowAction = {
        dreamId: dream.id,
        dreamTitle: dream.title,
        stepText: candidateText,
      };
    }
  }

  return {
    topFourDreams,
    topFourCount: topFourDreams.length,
    havingMonthly,
    beingMonthly,
    doingMonthly,
    dreamsMonthlyTotal,
    baselineMonthly,
    bufferMultiplier,
    bufferAmount,
    bufferedExpenses,
    tmi,
    tdi,
    targetAnnual,
    monthlyGap,
    dailyGap,
    isFunded,
    currentRelativeHourly,
    targetRelativeHourly,
    actionStats: {
      totalSteps: topFourDreams.length * 3,
      plannedSteps,
      completedSteps,
      nextNowAction,
    },
  };
}

export interface TimelineCountdown {
  startDate: Date;
  targetDate: Date;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  percentElapsed: number;
}

function parseIsoLocalDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day);
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function getTimelineCountdown(
  startDateStr: string,
  timeline: TimelineKey,
  now: Date = new Date(),
): TimelineCountdown {
  const startDate = parseIsoLocalDate(startDateStr);
  const monthsToAdd = timeline === '6m' ? 6 : 12;
  const targetDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + monthsToAdd,
    startDate.getDate(),
  );

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 86_400_000;
  const totalDays = Math.max(
    1,
    Math.round((targetDate.getTime() - startDate.getTime()) / msPerDay),
  );
  const rawElapsed = Math.round((today.getTime() - startDate.getTime()) / msPerDay);
  const daysElapsed = Math.min(totalDays, Math.max(0, rawElapsed));
  const daysRemaining = Math.max(
    0,
    Math.round((targetDate.getTime() - today.getTime()) / msPerDay),
  );
  const percentElapsed = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

  return {
    startDate,
    targetDate,
    totalDays,
    daysElapsed,
    daysRemaining,
    percentElapsed,
  };
}

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  BRL: 'pt-BR',
  ARS: 'es-AR',
  CAD: 'en-CA',
  AUD: 'en-AU',
  MXN: 'es-MX',
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  decimals = 0,
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe);
}

export function formatTargetDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
