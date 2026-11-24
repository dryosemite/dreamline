import {
  calculateTimelineMetrics,
  formatCurrency,
  formatTargetDate,
  getDreamMonthlyCost,
  getTimelineCountdown,
} from './calculations';
import { createInitialState } from './defaults';
import type { DreamlineState, TimelineKey } from '../types/dreamline';

export const STORAGE_KEY = 'dreamline:v1:state';

function isValidState(candidate: unknown): candidate is DreamlineState {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Record<string, unknown>;
  if (obj.version !== 1) return false;
  if (!obj.timelines || typeof obj.timelines !== 'object') return false;
  const timelines = obj.timelines as Record<string, unknown>;
  if (!timelines['6m'] || !timelines['12m']) return false;
  if (!obj.expenses || typeof obj.expenses !== 'object') return false;
  if (!obj.income || typeof obj.income !== 'object') return false;
  return true;
}

export function loadState(): DreamlineState {
  const fallback = createInitialState();
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) return fallback;

    return {
      ...fallback,
      ...parsed,
      expenses: {
        ...fallback.expenses,
        ...parsed.expenses,
      },
      income: {
        ...fallback.income,
        ...parsed.income,
      },
      fearSetting: {
        ...fallback.fearSetting,
        ...(parsed.fearSetting || {}),
      },
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: DreamlineState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function exportToJson(state: DreamlineState): string {
  return JSON.stringify(state, null, 2);
}

export function importFromJson(raw: string): { ok: true; state: DreamlineState } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) {
      return {
        ok: false,
        error: 'Invalid Dreamline JSON file: expected Dreamline v1 schema.',
      };
    }
    const base = createInitialState();
    return {
      ok: true,
      state: {
        ...base,
        ...parsed,
        expenses: { ...base.expenses, ...parsed.expenses },
        income: { ...base.income, ...parsed.income },
        fearSetting: { ...base.fearSetting, ...(parsed.fearSetting || {}) },
      },
    };
  } catch {
    return { ok: false, error: 'Could not parse JSON file.' };
  }
}

function renderTimelineMarkdown(state: DreamlineState, timeline: TimelineKey): string {
  const dreams = state.timelines[timeline].dreams;
  const metrics = calculateTimelineMetrics(dreams, timeline, state.expenses, state.income);
  const countdown = getTimelineCountdown(state.startDate, timeline);
  const label = timeline === '6m' ? '6-Month Dreamline' : '12-Month Dreamline';

  const lines: string[] = [
    `## ${label} (Target: ${formatTargetDate(countdown.targetDate)})`,
    '',
    `- **Target Monthly Income (TMI):** ${formatCurrency(metrics.tmi, state.currency, 0)} / mo`,
    `- **Target Daily Income (TDI):** ${formatCurrency(metrics.tdi, state.currency, 2)} / day`,
    `- **Top 4 Dreams Cost (A + B + C):** ${formatCurrency(metrics.dreamsMonthlyTotal, state.currency, 0)} / mo`,
    `- **Baseline Expenses × ${metrics.bufferMultiplier.toFixed(2)}:** ${formatCurrency(metrics.bufferedExpenses, state.currency, 0)} / mo`,
    '',
    '### Top 4 Dreams & Micro-Actions',
  ];

  if (metrics.topFourDreams.length === 0) {
    lines.push('_No Top 4 dreams selected yet._', '');
  } else {
    for (const dream of metrics.topFourDreams) {
      const monthly = getDreamMonthlyCost(dream, timeline);
      const conversion =
        dream.category === 'being' && dream.doingConversion?.trim()
          ? ` → _Doing:_ ${dream.doingConversion.trim()}`
          : '';
      lines.push(
        `- **[${dream.category.toUpperCase()}] ${dream.title}**${conversion} (${formatCurrency(monthly, state.currency, 0)}/mo)`,
      );
      lines.push(
        `  - [${dream.actions.now.done ? 'x' : ' '}] **Now:** ${dream.actions.now.text || '—'}`,
      );
      lines.push(
        `  - [${dream.actions.tomorrow.done ? 'x' : ' '}] **Tomorrow:** ${dream.actions.tomorrow.text || '—'}`,
      );
      lines.push(
        `  - [${dream.actions.dayAfter.done ? 'x' : ' '}] **Day After:** ${dream.actions.dayAfter.text || '—'}`,
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportToMarkdown(state: DreamlineState): string {
  const header = [
    '# My Dreamline — Ideal Lifestyle Design',
    `Start Date: ${state.startDate} | Currency: ${state.currency}`,
    '',
  ].join('\n');

  return [
    header,
    renderTimelineMarkdown(state, '6m'),
    renderTimelineMarkdown(state, '12m'),
  ].join('\n');
}
