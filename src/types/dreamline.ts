export type TimelineKey = '6m' | '12m';

export type DreamCategory = 'having' | 'being' | 'doing';

export type CostType = 'monthly' | 'one_time' | 'financed' | 'free';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'BRL'
  | 'ARS'
  | 'CAD'
  | 'AUD'
  | 'MXN';

export type StepId = 'dream' | 'focus' | 'cost' | 'reality' | 'launch';

export interface ActionStep {
  text: string;
  done: boolean;
  completedAt?: string;
}

export interface FinancingParams {
  totalPrice: number;
  downPayment: number;
  months: number;
  annualRatePct: number;
}

export interface DreamItem {
  id: string;
  category: DreamCategory;
  title: string;
  doingConversion?: string;
  isTopFour: boolean;
  costType: CostType;
  amount: number;
  financing?: FinancingParams;
  notes?: string;
  achieved?: boolean;
  actions: {
    now: ActionStep;
    tomorrow: ActionStep;
    dayAfter: ActionStep;
  };
}

export type ExpenseGroup =
  | 'housing'
  | 'debt'
  | 'insurance'
  | 'food'
  | 'utilities'
  | 'transport'
  | 'lifestyle';

export interface ExpenseItem {
  id: string;
  group: ExpenseGroup;
  label: string;
  currentMonthly: number;
  trimmedMonthly: number;
}

export interface ExpensesConfig {
  mode: 'quick' | 'detailed';
  quickMonthly: number;
  items: ExpenseItem[];
  bufferMultiplier: number;
}

export interface IncomeProfile {
  currentMonthlyIncome: number;
  currentWeeklyHours: number;
  targetWeeklyHours: number;
}

export interface FearItem {
  id: string;
  define: string;
  prevent: string;
  repair: string;
  impact: number;
}

export interface FearSettingData {
  prompt: string;
  fears: FearItem[];
  benefits: string;
  costOfInaction: {
    sixMonths: string;
    oneYear: string;
    threeYears: string;
  };
}

export interface TimelineData {
  dreams: DreamItem[];
}

export interface DreamlineState {
  version: 1;
  currency: CurrencyCode;
  startDate: string;
  timelines: Record<TimelineKey, TimelineData>;
  expenses: ExpensesConfig;
  income: IncomeProfile;
  fearSetting: FearSettingData;
  activeTimeline: TimelineKey;
  activeStep: StepId;
  theme: 'light' | 'dark';
}
