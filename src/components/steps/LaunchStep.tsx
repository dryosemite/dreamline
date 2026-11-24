import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Star,
} from 'lucide-react';
import {
  formatCurrency,
  formatTargetDate,
  getDreamMonthlyCost,
  getTimelineCountdown,
  type TimelineMetrics,
} from '../../lib/calculations';
import { MICRO_ACTION_SUGGESTIONS } from '../../lib/defaults';
import type { CurrencyCode, DreamItem, TimelineKey } from '../../types/dreamline';

type ActionHorizon = 'now' | 'tomorrow' | 'dayAfter';

const HORIZON_LABELS: { key: ActionHorizon; title: string; hint: string }[] = [
  { key: 'now', title: 'Now (Today)', hint: '5–10 min micro-step right now' },
  { key: 'tomorrow', title: 'Tomorrow', hint: 'Do before 11:00 AM' },
  { key: 'dayAfter', title: 'Day After', hint: 'Keep the momentum alive' },
];

interface LaunchStepProps {
  timeline: TimelineKey;
  startDate: string;
  currency: CurrencyCode;
  metrics: TimelineMetrics;
  onUpdateStartDate: (date: string) => void;
  onUpdateAction: (
    dreamId: string,
    horizon: ActionHorizon,
    patch: { text?: string; done?: boolean },
  ) => void;
  onGoToFocusStep: () => void;
}

export function LaunchStep({
  timeline,
  startDate,
  currency,
  metrics,
  onUpdateStartDate,
  onUpdateAction,
  onGoToFocusStep,
}: LaunchStepProps) {
  const countdown = getTimelineCountdown(startDate, timeline);
  const nextNow = metrics.actionStats.nextNowAction;

  const [timerDurationSec, setTimerDurationSec] = useState(600); // 10 min default
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  function selectTimerPreset(sec: number) {
    setTimerRunning(false);
    setTimerDurationSec(sec);
    setSecondsLeft(sec);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <section className="space-y-6">
      {/* Top Row: Countdown + Do Step 1 Now Focus Timer */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs lg:col-span-5 dark:border-[#2c2a27] dark:bg-[#1a1917]">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-soft px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-terracotta uppercase dark:bg-terracotta/20">
              Step 5 · Execution Launch
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-[#a69f95]">
              <Calendar className="h-3.5 w-3.5" />
              <label htmlFor="start-date-input">Start:</label>
              <input
                id="start-date-input"
                type="date"
                value={startDate}
                onChange={(e) => e.target.value && onUpdateStartDate(e.target.value)}
                className="rounded-lg border border-border-warm bg-canvas px-2 py-0.5 font-mono text-xs text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-3xl font-bold tabular-nums text-ink dark:text-[#f4f1ec]">
                {countdown.daysRemaining} days
              </div>
              <div className="text-xs text-ink-muted dark:text-[#a69f95]">
                until {formatTargetDate(countdown.targetDate)} ({timeline === '6m' ? '6-Month' : '12-Month'} Target)
              </div>
            </div>
            <div className="text-right font-mono text-xs font-semibold tabular-nums text-sage dark:text-[#6ec49a]">
              {metrics.actionStats.completedSteps}/{metrics.actionStats.totalSteps} done
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted dark:bg-[#23211e]">
            <div
              className="h-full rounded-full bg-terracotta transition-all"
              style={{ width: `${Math.max(4, countdown.percentElapsed)}%` }}
            />
          </div>
        </div>

        {/* Built-in 10-Min Action Timer */}
        <div className="rounded-2xl border border-terracotta/40 bg-terracotta-soft/35 p-5 shadow-2xs lg:col-span-7 dark:border-terracotta/40 dark:bg-terracotta/12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-terracotta uppercase">
                <Clock className="h-3.5 w-3.5" />
                <span>Tim&apos;s Rule: Take Step 1 Immediately</span>
              </div>
              {nextNow ? (
                <>
                  <h3 className="mt-1.5 truncate text-base font-semibold text-ink dark:text-[#f4f1ec]">
                    {nextNow.stepText}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-ink-muted dark:text-[#c7bfb4]">
                    Dream: {nextNow.dreamTitle}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-1.5 text-base font-semibold text-sage dark:text-[#6ec49a]">
                    All &ldquo;Now&rdquo; steps completed!
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-muted dark:text-[#c7bfb4]">
                    Check off Tomorrow&apos;s steps below before 11:00 AM.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="font-mono text-3xl font-bold tabular-nums text-ink dark:text-[#f4f1ec]">
                {mm}:{ss}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => selectTimerPreset(300)}
                  className={`rounded-md px-2 py-1 font-mono text-[11px] font-medium ${
                    timerDurationSec === 300
                      ? 'bg-ink text-white dark:bg-[#f4f1ec] dark:text-[#141312]'
                      : 'bg-surface/80 text-ink-muted dark:bg-[#23211e] dark:text-[#a69f95]'
                  }`}
                >
                  5m
                </button>
                <button
                  type="button"
                  onClick={() => selectTimerPreset(600)}
                  className={`rounded-md px-2 py-1 font-mono text-[11px] font-medium ${
                    timerDurationSec === 600
                      ? 'bg-ink text-white dark:bg-[#f4f1ec] dark:text-[#141312]'
                      : 'bg-surface/80 text-ink-muted dark:bg-[#23211e] dark:text-[#a69f95]'
                  }`}
                >
                  10m
                </button>
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="inline-flex items-center gap-1 rounded-lg bg-terracotta px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{timerRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  type="button"
                  aria-label="Reset focus timer"
                  onClick={() => selectTimerPreset(timerDurationSec)}
                  className="rounded-lg border border-border-warm bg-surface p-1.5 text-ink-muted hover:text-ink dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#a69f95]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                {nextNow && (
                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      onUpdateAction(nextNow.dreamId, 'now', { done: true });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Done</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Dream Action Cards */}
      {metrics.topFourDreams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-warm bg-surface px-6 py-12 text-center dark:border-[#2c2a27] dark:bg-[#1a1917]">
          <Star className="mx-auto h-8 w-8 text-ink-muted" />
          <h3 className="mt-3 font-serif text-2xl text-ink dark:text-[#f4f1ec]">
            Pick your Top 4 dreams to generate launch steps
          </h3>
          <button
            type="button"
            onClick={onGoToFocusStep}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span>Go to Step 2: Focus</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {metrics.topFourDreams.map((dream: DreamItem) => {
            const monthly = getDreamMonthlyCost(dream, timeline);
            return (
              <div
                key={dream.id}
                className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-terracotta uppercase">
                      {dream.category}
                    </span>
                    <h3 className="mt-0.5 text-lg font-semibold text-ink dark:text-[#f4f1ec]">
                      {dream.title}
                    </h3>
                    {dream.category === 'being' && dream.doingConversion?.trim() && (
                      <p className="mt-0.5 text-xs text-ink-muted dark:text-[#a69f95]">
                        Doing milestone: {dream.doingConversion}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-lg bg-surface-muted px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-ink dark:bg-[#23211e] dark:text-[#f4f1ec]">
                    {formatCurrency(monthly, currency, 0)}/mo
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {HORIZON_LABELS.map((h) => {
                    const step = dream.actions[h.key];
                    const suggestions = MICRO_ACTION_SUGGESTIONS[h.key];
                    return (
                      <div
                        key={h.key}
                        className={`rounded-xl border p-3 transition ${
                          step.done
                            ? 'border-sage/40 bg-sage-soft/35 dark:border-sage/40 dark:bg-sage/10'
                            : 'border-border-warm bg-canvas dark:border-[#2c2a27] dark:bg-[#141312]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateAction(dream.id, h.key, { done: !step.done })
                            }
                            aria-label={`Toggle ${h.title} for ${dream.title}`}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                              step.done
                                ? 'border-sage bg-sage text-white'
                                : 'border-border-warm bg-surface text-transparent hover:border-terracotta dark:border-[#3c3833] dark:bg-[#1a1917]'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink dark:text-[#f4f1ec]">
                                {h.title}
                              </span>
                              <span className="text-[10px] text-ink-muted dark:text-[#8f887e]">
                                {h.hint}
                              </span>
                            </div>

                            <input
                              type="text"
                              value={step.text}
                              onChange={(e) =>
                                onUpdateAction(dream.id, h.key, { text: e.target.value })
                              }
                              placeholder={`Write a tiny ${h.title.toLowerCase()} action...`}
                              className={`mt-1 w-full bg-transparent text-sm focus:outline-none ${
                                step.done
                                  ? 'text-ink-muted line-through dark:text-[#8f887e]'
                                  : 'text-ink placeholder:text-ink-muted/60 dark:text-[#f4f1ec]'
                              }`}
                            />

                            {!step.text.trim() && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {suggestions.map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() =>
                                      onUpdateAction(dream.id, h.key, { text: chip })
                                    }
                                    className="rounded-md border border-border-warm bg-surface px-2 py-0.5 text-[10px] text-ink-muted transition hover:border-terracotta hover:text-terracotta dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#a69f95]"
                                  >
                                    + {chip}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
