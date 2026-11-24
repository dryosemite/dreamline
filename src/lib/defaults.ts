import type {
  DreamCategory,
  DreamItem,
  DreamlineState,
  ExpenseGroup,
  ExpenseItem,
} from '../types/dreamline';

export const EXPENSE_GROUP_LABELS: Record<ExpenseGroup, string> = {
  housing: 'Housing & Living',
  debt: 'Debt & Loans',
  insurance: 'Insurance',
  food: 'Food & Sustenance',
  utilities: 'Utilities & Comms',
  transport: 'Transport',
  lifestyle: 'Education, Lifestyle & Misc',
};

export const EXPENSE_GROUP_ORDER: ExpenseGroup[] = [
  'housing',
  'debt',
  'insurance',
  'food',
  'utilities',
  'transport',
  'lifestyle',
];

export const DEFAULT_EXPENSE_ITEMS: ExpenseItem[] = [
  { id: 'exp-rent', group: 'housing', label: 'Rent / Mortgage', currentMonthly: 1500, trimmedMonthly: 1500 },
  { id: 'exp-prop-tax', group: 'housing', label: 'Property Taxes', currentMonthly: 0, trimmedMonthly: 0 },
  { id: 'exp-heat-elec', group: 'housing', label: 'Heating / Electricity', currentMonthly: 140, trimmedMonthly: 120 },
  { id: 'exp-water', group: 'housing', label: 'Water', currentMonthly: 40, trimmedMonthly: 40 },

  { id: 'exp-cc-min', group: 'debt', label: 'Credit Card Minimums', currentMonthly: 0, trimmedMonthly: 0 },
  { id: 'exp-car-loan', group: 'debt', label: 'Car Payments', currentMonthly: 0, trimmedMonthly: 0 },
  { id: 'exp-other-loan', group: 'debt', label: 'Other Loan Payments', currentMonthly: 0, trimmedMonthly: 0 },

  { id: 'exp-car-ins', group: 'insurance', label: 'Car Insurance', currentMonthly: 120, trimmedMonthly: 110 },
  { id: 'exp-home-ins', group: 'insurance', label: 'Home / Renters Insurance', currentMonthly: 35, trimmedMonthly: 35 },
  { id: 'exp-life-ins', group: 'insurance', label: 'Life Insurance', currentMonthly: 0, trimmedMonthly: 0 },
  { id: 'exp-health-ins', group: 'insurance', label: 'Health / Dental Insurance', currentMonthly: 220, trimmedMonthly: 220 },

  { id: 'exp-groceries', group: 'food', label: 'Groceries', currentMonthly: 420, trimmedMonthly: 360 },
  { id: 'exp-eating-out', group: 'food', label: 'Eating Out', currentMonthly: 260, trimmedMonthly: 140 },

  { id: 'exp-phone', group: 'utilities', label: 'Telephone / Mobile', currentMonthly: 65, trimmedMonthly: 45 },
  { id: 'exp-internet', group: 'utilities', label: 'Internet / Cable', currentMonthly: 75, trimmedMonthly: 60 },

  { id: 'exp-gas', group: 'transport', label: 'Gasoline', currentMonthly: 130, trimmedMonthly: 100 },
  { id: 'exp-transit', group: 'transport', label: 'Public Transportation', currentMonthly: 40, trimmedMonthly: 40 },

  { id: 'exp-edu', group: 'lifestyle', label: 'Education / Tuition', currentMonthly: 0, trimmedMonthly: 0 },
  { id: 'exp-subs', group: 'lifestyle', label: 'Subscriptions (Online & Offline)', currentMonthly: 110, trimmedMonthly: 35 },
  { id: 'exp-memberships', group: 'lifestyle', label: 'Memberships', currentMonthly: 85, trimmedMonthly: 45 },
  { id: 'exp-misc', group: 'lifestyle', label: 'Miscellaneous', currentMonthly: 150, trimmedMonthly: 80 },
];

export function cloneDefaultExpenseItems(): ExpenseItem[] {
  return DEFAULT_EXPENSE_ITEMS.map((item) => ({ ...item }));
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDreamItem(
  category: DreamCategory,
  title: string,
  overrides: Partial<DreamItem> = {},
): DreamItem {
  return {
    id: createId('dream'),
    category,
    title,
    doingConversion: category === 'being' ? '' : undefined,
    isTopFour: false,
    costType: 'free',
    amount: 0,
    actions: {
      now: { text: '', done: false },
      tomorrow: { text: '', done: false },
      dayAfter: { text: '', done: false },
    },
    ...overrides,
  };
}

export interface UnblockerPrompt {
  id: string;
  label: string;
  category: DreamCategory;
  starter: string;
}

export const UNBLOCKER_PROMPTS: UnblockerPrompt[] = [
  {
    id: 'place',
    label: '1 place to visit',
    category: 'doing',
    starter: 'Spend 2 weeks in ',
  },
  {
    id: 'lifetime',
    label: '1 memory of a lifetime',
    category: 'doing',
    starter: 'Bucket-list experience: ',
  },
  {
    id: 'daily',
    label: '1 daily ritual',
    category: 'doing',
    starter: 'Daily ritual: ',
  },
  {
    id: 'weekly',
    label: '1 weekly ritual',
    category: 'doing',
    starter: 'Every weekend: ',
  },
  {
    id: 'learn',
    label: '1 thing to learn',
    category: 'being',
    starter: 'Become conversational in ',
  },
  {
    id: 'leverage',
    label: '1 time-freeing asset',
    category: 'having',
    starter: 'Dedicated personal assistant / ',
  },
];

export const MICRO_ACTION_SUGGESTIONS: Record<'now' | 'tomorrow' | 'dayAfter', string[]> = {
  now: [
    'Research 3 concrete options & prices (10 min)',
    'Send 1 direct inquiry or outreach email',
    'Book first intro call / trial session',
  ],
  tomorrow: [
    'Before 11 AM: schedule test drive, flight hold, or tutor',
    'Block 45 minutes on calendar for deep setup',
    'Compare top 2 quotes and pick one',
  ],
  dayAfter: [
    'Confirm first paid or scheduled commitment',
    'Complete 15-minute daily practice session',
    'Share deadline with an accountability partner',
  ],
};

export function createInitialState(): DreamlineState {
  return {
    version: 1,
    currency: 'USD',
    startDate: getTodayIsoDate(),
    timelines: {
      '6m': { dreams: [] },
      '12m': { dreams: [] },
    },
    expenses: {
      mode: 'quick',
      quickMonthly: 2500,
      items: cloneDefaultExpenseItems(),
      bufferMultiplier: 1.3,
    },
    income: {
      currentMonthlyIncome: 0,
      currentWeeklyHours: 40,
      targetWeeklyHours: 15,
    },
    fearSetting: {
      prompt: 'What if I commit to my 6-month Dreamline and restructure my work around TMI?',
      fears: [
        {
          id: 'fear-1',
          define: 'My side income or freelance pipeline dips during the transition.',
          prevent: 'Keep 3 months of baseline expenses saved and launch experiments before cutting hours.',
          repair: 'Pick up a short-term contract or return to salaried consulting within 30 days.',
          impact: 5,
        },
      ],
      benefits: 'Gain 25+ hours/week of autonomy, test an exciting mini-retirement, and build location independence.',
      costOfInaction: {
        sixMonths: 'Six more months trading evenings and energy for goals that are not mine.',
        oneYear: 'Same routine, deeper boredom, and zero proof of what my ideal lifestyle actually costs.',
        threeYears: 'Looking back wishing I had started a small 6-month experiment when the stakes were low.',
      },
    },
    activeTimeline: '6m',
    activeStep: 'dream',
    theme: 'light',
  };
}

export function createTimFerrissSampleState(): DreamlineState {
  const today = getTodayIsoDate();

  return {
    version: 1,
    currency: 'USD',
    startDate: today,
    timelines: {
      '6m': {
        dreams: [
          {
            id: 'tf-6m-1',
            category: 'having',
            title: 'Aston Martin DB9 (leased / financed cash flow)',
            isTopFour: true,
            costType: 'financed',
            amount: 2003,
            financing: {
              totalPrice: 136000,
              downPayment: 20000,
              months: 72,
              annualRatePct: 6.5,
            },
            notes: 'Tim Ferriss 4HWW classic example: price the monthly cash flow instead of waiting for $136k cash.',
            actions: {
              now: {
                text: 'Call 2 exotic dealers to confirm lease & financing terms',
                done: true,
              },
              tomorrow: {
                text: 'Schedule showroom test drive before 11 AM',
                done: false,
              },
              dayAfter: {
                text: 'Verify insurance quote and set exact monthly target',
                done: false,
              },
            },
          },
          {
            id: 'tf-6m-2',
            category: 'having',
            title: 'Dedicated Virtual Assistant (15 hrs/week)',
            isTopFour: false,
            costType: 'monthly',
            amount: 450,
            actions: {
              now: { text: '', done: false },
              tomorrow: { text: '', done: false },
              dayAfter: { text: '', done: false },
            },
          },
          {
            id: 'tf-6m-3',
            category: 'being',
            title: 'Fluent in conversational Mandarin Chinese',
            doingConversion: 'Have a 5-minute unscripted conversation with a native speaker',
            isTopFour: true,
            costType: 'monthly',
            amount: 240,
            actions: {
              now: {
                text: 'Book three 30-min 1-on-1 online tutor sessions this week',
                done: true,
              },
              tomorrow: {
                text: 'Prepare 20 high-frequency survival phrases before 11 AM',
                done: false,
              },
              dayAfter: {
                text: 'Complete first live tutor call and record audio review',
                done: false,
              },
            },
          },
          {
            id: 'tf-6m-4',
            category: 'being',
            title: 'Full side splits & high athletic mobility',
            doingConversion: 'Hold full side splits cleanly for 30 seconds on video',
            isTopFour: false,
            costType: 'free',
            amount: 0,
            actions: {
              now: { text: '', done: false },
              tomorrow: { text: '', done: false },
              dayAfter: { text: '', done: false },
            },
          },
          {
            id: 'tf-6m-5',
            category: 'doing',
            title: 'Spend 3 weeks exploring the Croatian coast',
            isTopFour: true,
            costType: 'one_time',
            amount: 2400,
            notes: 'Airfare + coastal apartment prorated over 6 months ($400/mo).',
            actions: {
              now: {
                text: 'Check flight alerts to Split & Dubrovnik and save 3 apartment listings',
                done: false,
              },
              tomorrow: {
                text: 'Email local co-working host in Split to verify fiber internet speeds',
                done: false,
              },
              dayAfter: {
                text: 'Lock travel window on calendar and hold refundable lodging',
                done: false,
              },
            },
          },
          {
            id: 'tf-6m-6',
            category: 'doing',
            title: 'Compete in tango in Buenos Aires',
            isTopFour: true,
            costType: 'one_time',
            amount: 1800,
            actions: {
              now: {
                text: 'Find top-rated private tango coach in Palermo for 2-week intensive',
                done: false,
              },
              tomorrow: {
                text: 'Take one local intro tango class tomorrow evening',
                done: false,
              },
              dayAfter: {
                text: 'Message coach in Buenos Aires to reserve morning lessons',
                done: false,
              },
            },
          },
        ],
      },
      '12m': {
        dreams: [
          {
            id: 'tf-12m-1',
            category: 'having',
            title: 'Compact minimalist home studio & espresso setup',
            isTopFour: true,
            costType: 'one_time',
            amount: 3600,
            actions: {
              now: {
                text: 'List top 3 studio upgrades and eliminate clutter in current desk space',
                done: false,
              },
              tomorrow: {
                text: 'Order ergonomic chair & desk hardware quote',
                done: false,
              },
              dayAfter: {
                text: 'Sell unused electronics on local marketplace',
                done: false,
              },
            },
          },
          {
            id: 'tf-12m-2',
            category: 'being',
            title: 'Accomplished cook of 10 signature dinners',
            doingConversion: 'Cook a full 4-course dinner party from scratch without notes',
            isTopFour: true,
            costType: 'monthly',
            amount: 180,
            actions: {
              now: {
                text: 'Pick 3 foundational dishes and buy pantry staples',
                done: false,
              },
              tomorrow: {
                text: 'Invite 4 friends for a Sunday dinner test run',
                done: false,
              },
              dayAfter: {
                text: 'Practice knife skills & sauce prep for 30 minutes',
                done: false,
              },
            },
          },
          {
            id: 'tf-12m-3',
            category: 'doing',
            title: 'Live a 3-month mini-retirement in Berlin & Tokyo',
            isTopFour: true,
            costType: 'one_time',
            amount: 9600,
            actions: {
              now: {
                text: 'Audit current lease sublet rules and mail-forwarding options',
                done: false,
              },
              tomorrow: {
                text: 'Price 6-week furnished apartments in Kreuzberg and Shibuya',
                done: false,
              },
              dayAfter: {
                text: 'Verify visa requirements and remote client coverage plan',
                done: false,
              },
            },
          },
          {
            id: 'tf-12m-4',
            category: 'doing',
            title: 'Write & launch a niche automated micro-product',
            isTopFour: true,
            costType: 'monthly',
            amount: 250,
            actions: {
              now: {
                text: 'Draft 1-page landing test and pick 5 target customer interviews',
                done: false,
              },
              tomorrow: {
                text: 'Run 2 customer discovery calls before 11 AM',
                done: false,
              },
              dayAfter: {
                text: 'Publish pre-order test page and measure conversion',
                done: false,
              },
            },
          },
        ],
      },
    },
    expenses: {
      mode: 'detailed',
      quickMonthly: 2920,
      items: cloneDefaultExpenseItems(),
      bufferMultiplier: 1.3,
    },
    income: {
      currentMonthlyIncome: 6200,
      currentWeeklyHours: 45,
      targetWeeklyHours: 12,
    },
    fearSetting: {
      prompt: 'What if I take a 6-week mini-retirement abroad and automate my business to 12 hrs/week?',
      fears: [
        {
          id: 'tf-fear-1',
          define: 'A key client leaves while I am traveling in a different time zone.',
          prevent: 'Hand off routine checks to a trained VA and hold overlapping morning office hours twice a week.',
          repair: 'Reach out to 10 warm leads or launch a quick sprint offer within 2 weeks.',
          impact: 6,
        },
        {
          id: 'tf-fear-2',
          define: 'Unexpected travel or healthcare costs exceed my monthly budget.',
          prevent: 'Keep the 1.3× Dreamline buffer active and buy international health/travel coverage.',
          repair: 'Pause discretionary dining and cut trip length by 1 week if needed.',
          impact: 4,
        },
      ],
      benefits: 'Prove location independence works, experience Croatia and Buenos Aires while young, and reclaim 33 hours/week.',
      costOfInaction: {
        sixMonths: 'Another half-year postponing travel while working 45+ hours indoors.',
        oneYear: 'Permanent regret that the window for effortless adventure quietly slipped away.',
        threeYears: 'Golden handcuffs tighten until taking 3 weeks off feels nearly impossible.',
      },
    },
    activeTimeline: '6m',
    activeStep: 'dream',
    theme: 'light',
  };
}
