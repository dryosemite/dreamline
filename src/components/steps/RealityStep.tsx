import { ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatCurrency, type TimelineMetrics } from '../../lib/calculations';
import type { CurrencyCode, IncomeProfile, TimelineKey } from '../../types/dreamline';

interface RealityStepProps {
  timeline: TimelineKey;
  currency: CurrencyCode;
  metrics: TimelineMetrics;
  otherMetrics: TimelineMetrics;
  income: IncomeProfile;
  onUpdateIncome: (patch: Partial<IncomeProfile>) => void;
  onSelectTimeline: (timeline: TimelineKey) => void;
  onNextStep: () => void;
}

function parseNonNegative(raw: string): number {
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return 0;
  return num;
}

export function RealityStep({
  timeline,
  currency,
  metrics,
  otherMetrics,
  income,
  onUpdateIncome,
  onSelectTimeline,
  onNextStep,
}: RealityStepProps) {
  const otherTimeline: TimelineKey = timeline === '6m' ? '12m' : '6m';
  const totalTmi = Math.max(metrics.tmi, 1);

  const segments = [
    {
      label: 'Baseline Living',
      amount: metrics.baselineMonthly,
      color: 'bg-[#3b3732] dark:bg-[#7c756c]',
    },
    {
      label: `${Math.round((metrics.bufferMultiplier - 1) * 100)}% Cushion`,
      amount: metrics.bufferAmount,
      color: 'bg-[#8f887e] dark:bg-[#524d47]',
    },
    {
      label: 'A · Having',
      amount: metrics.havingMonthly,
      color: 'bg-terracotta',
    },
    {
      label: 'B · Being',
      amount: metrics.beingMonthly,
      color: 'bg-amber-warm',
    },
    {
      label: 'C · Doing',
      amount: metrics.doingMonthly,
      color: 'bg-sage',
    },
  ];

  const hasCurrentIncome = income.currentMonthlyIncome > 0;

  return (
    <section className="space-y-6">
      {/* Hero Numbers: TMI & TDI */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border-warm bg-surface p-6 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]">
          <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
            Target Monthly Income (TMI) · {timeline === '6m' ? '6-Month' : '12-Month'}
          </div>
          <div className="mt-2 font-mono text-4xl font-bold tracking-tight tabular-nums text-ink sm:text-5xl dark:text-[#f4f1ec]">
            {formatCurrency(metrics.tmi, currency, 0)}
            <span className="ml-1.5 text-lg font-normal text-ink-muted dark:text-[#8f887e]">
              /mo
            </span>
          </div>
          <p className="mt-3 font-mono text-xs text-ink-muted dark:text-[#a69f95]">
            {formatCurrency(metrics.havingMonthly, currency, 0)} (A) +{' '}
            {formatCurrency(metrics.beingMonthly, currency, 0)} (B) +{' '}
            {formatCurrency(metrics.doingMonthly, currency, 0)} (C) +{' '}
            {formatCurrency(metrics.bufferedExpenses, currency, 0)} ({metrics.bufferMultiplier.toFixed(2)}×
            exp)
          </p>
        </div>

        <div className="rounded-2xl border border-terracotta/40 bg-terracotta-soft/40 p-6 shadow-2xs dark:border-terracotta/40 dark:bg-terracotta/12">
          <div className="text-[11px] font-semibold tracking-wider text-terracotta uppercase">
            Target Daily Income (TDI = TMI ÷ 30)
          </div>
          <div className="mt-2 font-mono text-4xl font-bold tracking-tight tabular-nums text-terracotta sm:text-5xl">
            {formatCurrency(metrics.tdi, currency, 2)}
            <span className="ml-1.5 text-lg font-normal text-ink-muted dark:text-[#c7bfb4]">
              /day
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted dark:text-[#d0c9be]">
            Living your {timeline === '6m' ? '6-month' : '12-month'} ideal lifestyle equates to{' '}
            <strong className="font-mono text-ink dark:text-[#f4f1ec]">
              {formatCurrency(metrics.targetAnnual, currency, 0)}/yr
            </strong>{' '}
            in cash flow — no multi-million nest egg required first.
          </p>
        </div>
      </div>

      {/* Composition Bar */}
      <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <h3 className="font-serif text-2xl text-ink dark:text-[#f4f1ec]">
          Where Every Dollar of Your TMI Goes
        </h3>
        <div className="mt-4 flex h-5 w-full overflow-hidden rounded-full bg-surface-muted dark:bg-[#23211e]">
          {segments.map((seg) => {
            const pct = (seg.amount / totalTmi) * 100;
            if (pct <= 0.3) return null;
            return (
              <div
                key={seg.label}
                style={{ width: `${pct}%` }}
                title={`${seg.label}: ${formatCurrency(seg.amount, currency, 0)} (${pct.toFixed(1)}%)`}
                className={`${seg.color} h-full transition-all`}
              />
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {segments.map((seg) => {
            const pct = metrics.tmi > 0 ? (seg.amount / metrics.tmi) * 100 : 0;
            return (
              <div
                key={seg.label}
                className="rounded-xl border border-border-warm/70 bg-canvas px-3 py-2 dark:border-[#2c2a27] dark:bg-[#141312]"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted dark:text-[#a69f95]">
                  <span className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                  <span className="truncate">{seg.label}</span>
                </div>
                <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink dark:text-[#f4f1ec]">
                  {formatCurrency(seg.amount, currency, 0)}
                </div>
                <div className="font-mono text-[10px] tabular-nums text-ink-muted dark:text-[#8f887e]">
                  {pct.toFixed(0)}% of TMI
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relative Income & Gap + 6m vs 12m Comparison */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Relative Income Calculator */}
        <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs lg:col-span-7 dark:border-[#2c2a27] dark:bg-[#1a1917]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-terracotta" />
            <h3 className="font-serif text-2xl text-ink dark:text-[#f4f1ec]">
              Relative Income &amp; Reality Gap
            </h3>
          </div>
          <p className="mt-1 text-xs text-ink-muted dark:text-[#a69f95]">
            Tim&apos;s rule: optimize <strong>Relative Income ($/hour)</strong>, not raw annual salary.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                Current Income / Mo
              </label>
              <input
                type="number"
                min={0}
                step="100"
                value={income.currentMonthlyIncome || ''}
                placeholder="4000"
                onChange={(e) =>
                  onUpdateIncome({
                    currentMonthlyIncome: parseNonNegative(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-border-warm bg-canvas px-3 py-2 font-mono text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                Current Hrs / Wk
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={income.currentWeeklyHours || ''}
                onChange={(e) =>
                  onUpdateIncome({
                    currentWeeklyHours: parseNonNegative(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-border-warm bg-canvas px-3 py-2 font-mono text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                Ideal Hrs / Wk
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={income.targetWeeklyHours || ''}
                onChange={(e) =>
                  onUpdateIncome({
                    targetWeeklyHours: parseNonNegative(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-border-warm bg-canvas px-3 py-2 font-mono text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-3.5 ${
                hasCurrentIncome && metrics.isFunded
                  ? 'border-sage/40 bg-sage-soft/60 dark:border-sage/40 dark:bg-sage/15'
                  : 'border-border-warm bg-canvas dark:border-[#2c2a27] dark:bg-[#141312]'
              }`}
            >
              <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
                {hasCurrentIncome && metrics.isFunded ? 'Surplus Above TMI' : 'Daily Gap to Close'}
              </div>
              {hasCurrentIncome ? (
                metrics.isFunded ? (
                  <div className="mt-1 flex items-center gap-2 font-mono text-xl font-bold tabular-nums text-sage dark:text-[#6ec49a]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>+{formatCurrency(Math.abs(metrics.monthlyGap), currency, 0)}/mo</span>
                  </div>
                ) : (
                  <div className="mt-1 font-mono text-xl font-bold tabular-nums text-terracotta">
                    +{formatCurrency(metrics.dailyGap, currency, 2)}/day
                    <span className="ml-2 text-xs font-normal text-ink-muted dark:text-[#a69f95]">
                      ({formatCurrency(metrics.monthlyGap, currency, 0)}/mo)
                    </span>
                  </div>
                )
              ) : (
                <div className="mt-1 text-xs text-ink-muted dark:text-[#8f887e]">
                  Enter current monthly income above to see your exact daily gap.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-warm bg-canvas p-3.5 dark:border-[#2c2a27] dark:bg-[#141312]">
              <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
                Relative Hourly Income
              </div>
              <div className="mt-1 flex items-baseline gap-2 font-mono text-sm tabular-nums">
                <span className="text-ink-muted dark:text-[#a69f95]">
                  Now: {formatCurrency(metrics.currentRelativeHourly, currency, 0)}/hr
                </span>
                <span>→</span>
                <span className="text-lg font-bold text-ink dark:text-[#f4f1ec]">
                  Goal: {formatCurrency(metrics.targetRelativeHourly, currency, 0)}/hr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6M vs 12M Side-by-Side Comparison */}
        <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs lg:col-span-5 dark:border-[#2c2a27] dark:bg-[#1a1917]">
          <h3 className="font-serif text-2xl text-ink dark:text-[#f4f1ec]">
            6-Month vs. 12-Month
          </h3>
          <p className="mt-1 text-xs text-ink-muted dark:text-[#a69f95]">
            Compare your short-term sprints side by side.
          </p>

          <div className="mt-4 space-y-2.5">
            {[
              { key: timeline, data: metrics, isCurrent: true },
              { key: otherTimeline, data: otherMetrics, isCurrent: false },
            ]
              .sort((a, b) => (a.key === '6m' ? -1 : b.key === '6m' ? 1 : 0))
              .map((row) => (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => onSelectTimeline(row.key)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition ${
                    row.isCurrent
                      ? 'border-terracotta bg-terracotta-soft/30 dark:border-terracotta dark:bg-terracotta/15'
                      : 'border-border-warm bg-canvas hover:border-terracotta/40 dark:border-[#2c2a27] dark:bg-[#141312]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-ink dark:text-[#f4f1ec]">
                      {row.key === '6m' ? '6-Month Dreamline' : '12-Month Dreamline'}
                      {row.isCurrent && (
                        <span className="ml-2 rounded-full bg-terracotta px-2 py-0.5 text-[10px] text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-ink-muted dark:text-[#a69f95]">
                      {row.data.topFourCount}/4 Top Dreams ·{' '}
                      {formatCurrency(row.data.dreamsMonthlyTotal, currency, 0)}/mo in dreams
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-base font-bold tabular-nums text-ink dark:text-[#f4f1ec]">
                      {formatCurrency(row.data.tmi, currency, 0)}/mo
                    </div>
                    <div className="font-mono text-xs tabular-nums text-terracotta">
                      {formatCurrency(row.data.tdi, currency, 0)}/day
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-warm bg-surface px-5 py-4 dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="text-sm text-ink-muted dark:text-[#a69f95]">
          Math is clear. Now lock in the first micro-step within 48 hours.
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <span>Launch Immediate Steps</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
