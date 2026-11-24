import type { CurrencyCode, StepId, TimelineKey } from '../types/dreamline';
import {
  formatCurrency,
  getTimelineCountdown,
  type TimelineMetrics,
} from '../lib/calculations';

interface RealityStripProps {
  metrics: TimelineMetrics;
  currency: CurrencyCode;
  timeline: TimelineKey;
  startDate: string;
  onJumpToStep: (step: StepId) => void;
}

export function RealityStrip({
  metrics,
  currency,
  timeline,
  startDate,
  onJumpToStep,
}: RealityStripProps) {
  const countdown = getTimelineCountdown(startDate, timeline);

  return (
    <div className="no-print sticky top-0 z-30 border-b border-border-warm bg-canvas/95 backdrop-blur-md dark:border-[#2c2a27] dark:bg-[#141312]/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* TMI & TDI Live Readout */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-7">
          <button
            type="button"
            onClick={() => onJumpToStep('reality')}
            className="group text-left"
            title="Jump to Reality Check"
          >
            <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase group-hover:text-terracotta dark:text-[#a69f95]">
              Target Monthly (TMI)
            </div>
            <div className="font-mono text-base font-semibold tabular-nums text-ink sm:text-lg dark:text-[#f4f1ec]">
              {formatCurrency(metrics.tmi, currency, 0)}
              <span className="ml-1 text-xs font-normal text-ink-muted dark:text-[#8f887e]">
                /mo
              </span>
            </div>
          </button>

          <div className="h-7 w-px bg-border-warm dark:bg-[#2c2a27]" />

          <button
            type="button"
            onClick={() => onJumpToStep('reality')}
            className="group text-left"
            title="Jump to Reality Check"
          >
            <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase group-hover:text-terracotta dark:text-[#a69f95]">
              Target Daily (TDI)
            </div>
            <div className="font-mono text-base font-semibold tabular-nums text-terracotta sm:text-lg">
              {formatCurrency(metrics.tdi, currency, 0)}
              <span className="ml-1 text-xs font-normal text-ink-muted dark:text-[#8f887e]">
                /day
              </span>
            </div>
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onJumpToStep('focus')}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-warm bg-surface px-3 py-1 text-xs font-medium text-ink transition hover:border-terracotta/50 dark:border-[#2c2a27] dark:bg-[#1f1e1b] dark:text-[#f4f1ec]"
          >
            <span className="text-ink-muted dark:text-[#a69f95]">Top 4:</span>
            <span className="font-mono font-semibold tabular-nums">
              {metrics.topFourCount}/4
            </span>
          </button>

          <button
            type="button"
            onClick={() => onJumpToStep('launch')}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-warm bg-surface px-3 py-1 text-xs font-medium text-ink transition hover:border-sage/50 dark:border-[#2c2a27] dark:bg-[#1f1e1b] dark:text-[#f4f1ec]"
          >
            <span className="text-ink-muted dark:text-[#a69f95]">Steps:</span>
            <span className="font-mono font-semibold tabular-nums text-sage dark:text-[#6ec49a]">
              {metrics.actionStats.completedSteps}/{metrics.actionStats.totalSteps}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onJumpToStep('launch')}
            className="hidden items-center gap-1.5 rounded-full border border-border-warm bg-surface px-3 py-1 text-xs font-medium text-ink transition hover:border-terracotta/50 sm:inline-flex dark:border-[#2c2a27] dark:bg-[#1f1e1b] dark:text-[#f4f1ec]"
          >
            <span className="font-mono font-semibold tabular-nums">
              {countdown.daysRemaining}d
            </span>
            <span className="text-ink-muted dark:text-[#a69f95]">left</span>
          </button>
        </div>
      </div>
    </div>
  );
}
