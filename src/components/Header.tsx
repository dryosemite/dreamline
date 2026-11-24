import {
  BookOpen,
  Compass,
  Download,
  Moon,
  ShieldAlert,
  Sparkles,
  Sun,
} from 'lucide-react';
import { formatTargetDate, getTimelineCountdown } from '../lib/calculations';
import type { CurrencyCode, TimelineKey } from '../types/dreamline';

const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'BRL', 'ARS', 'CAD', 'AUD', 'MXN'];

interface HeaderProps {
  activeTimeline: TimelineKey;
  startDate: string;
  currency: CurrencyCode;
  theme: 'light' | 'dark';
  isSamplePreview: boolean;
  onChangeTimeline: (timeline: TimelineKey) => void;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onToggleTheme: () => void;
  onToggleSample: () => void;
  onOpenFearSetting: () => void;
  onOpenGuide: () => void;
  onOpenExport: () => void;
}

export function Header({
  activeTimeline,
  startDate,
  currency,
  theme,
  isSamplePreview,
  onChangeTimeline,
  onChangeCurrency,
  onToggleTheme,
  onToggleSample,
  onOpenFearSetting,
  onOpenGuide,
  onOpenExport,
}: HeaderProps) {
  const cd6 = getTimelineCountdown(startDate, '6m');
  const cd12 = getTimelineCountdown(startDate, '12m');

  return (
    <header className="no-print border-b border-border-warm bg-surface/90 backdrop-blur-md dark:border-[#2c2a27] dark:bg-[#1a1917]/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/12 text-terracotta dark:bg-terracotta/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl leading-none tracking-tight text-ink dark:text-[#f4f1ec]">
              Dreamline
            </h1>
            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-ink-muted uppercase dark:text-[#a69f95]">
              Ideal Lifestyle Design
            </p>
          </div>
        </div>

        {/* Dual Short-Term Timeline Switch */}
        <div
          className="inline-flex rounded-xl border border-border-warm bg-surface-muted p-1 dark:border-[#2c2a27] dark:bg-[#23211e]"
          role="tablist"
          aria-label="Dreamline timeline"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTimeline === '6m'}
            onClick={() => onChangeTimeline('6m')}
            className={`rounded-lg px-3 py-1.5 text-left transition ${
              activeTimeline === '6m'
                ? 'bg-surface text-ink shadow-xs dark:bg-[#141312] dark:text-[#f4f1ec]'
                : 'text-ink-muted hover:text-ink dark:text-[#a69f95] dark:hover:text-[#f4f1ec]'
            }`}
          >
            <div className="text-xs font-semibold leading-tight">6 Months</div>
            <div className="text-[10px] text-ink-muted dark:text-[#8f887e]">
              {formatTargetDate(cd6.targetDate)}
            </div>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTimeline === '12m'}
            onClick={() => onChangeTimeline('12m')}
            className={`rounded-lg px-3 py-1.5 text-left transition ${
              activeTimeline === '12m'
                ? 'bg-surface text-ink shadow-xs dark:bg-[#141312] dark:text-[#f4f1ec]'
                : 'text-ink-muted hover:text-ink dark:text-[#a69f95] dark:hover:text-[#f4f1ec]'
            }`}
          >
            <div className="text-xs font-semibold leading-tight">12 Months</div>
            <div className="text-[10px] text-ink-muted dark:text-[#8f887e]">
              {formatTargetDate(cd12.targetDate)}
            </div>
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onToggleSample}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              isSamplePreview
                ? 'border-terracotta bg-terracotta text-white'
                : 'border-border-warm bg-surface text-ink hover:bg-surface-muted dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec] dark:hover:bg-[#2c2a27]'
            }`}
            title="Explore Tim Ferriss's 4-Hour Workweek sample without touching your saved data"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isSamplePreview ? 'Viewing Sample' : "Tim's Sample"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFearSetting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-warm bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-muted dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec] dark:hover:bg-[#2c2a27]"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-terracotta" />
            <span className="hidden sm:inline">Fear-Setting</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-warm bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-muted dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec] dark:hover:bg-[#2c2a27]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Method Guide</span>
          </button>

          <label className="sr-only" htmlFor="currency-select">
            Currency
          </label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
            className="rounded-lg border border-border-warm bg-surface px-2 py-1.5 font-mono text-xs font-medium text-ink transition focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec]"
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-warm bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-muted dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec] dark:hover:bg-[#2c2a27]"
            title="Print PDF, Export Markdown or JSON"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Export / Print</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-warm bg-surface text-ink transition hover:bg-surface-muted dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec] dark:hover:bg-[#2c2a27]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
