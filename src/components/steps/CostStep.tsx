import { ArrowRight, Calculator, DollarSign, Star } from 'lucide-react';
import {
  calculateMonthlyLoanPayment,
  formatCurrency,
  getBaselineExpenses,
  getDreamMonthlyCost,
} from '../../lib/calculations';
import { EXPENSE_GROUP_LABELS, EXPENSE_GROUP_ORDER } from '../../lib/defaults';
import type {
  CostType,
  CurrencyCode,
  DreamItem,
  ExpensesConfig,
  FinancingParams,
  TimelineKey,
} from '../../types/dreamline';

const COST_TYPE_OPTIONS: { id: CostType; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'one_time', label: 'One-Time' },
  { id: 'financed', label: 'Finance / Lease' },
  { id: 'free', label: 'Free ($0)' },
];

const BUFFER_PRESETS: { value: number; label: string }[] = [
  { value: 1.0, label: '1.0× (0%)' },
  { value: 1.2, label: '1.2× (+20%)' },
  { value: 1.3, label: "1.3× (Tim's Rule)" },
  { value: 1.5, label: '1.5× (+50%)' },
];

interface CostStepProps {
  timeline: TimelineKey;
  currency: CurrencyCode;
  topFourDreams: DreamItem[];
  expenses: ExpensesConfig;
  onUpdateDream: (id: string, patch: Partial<DreamItem>) => void;
  onUpdateExpenses: (patch: Partial<ExpensesConfig>) => void;
  onUpdateExpenseItem: (
    itemId: string,
    field: 'currentMonthly' | 'trimmedMonthly',
    value: number,
  ) => void;
  onGoToFocusStep: () => void;
  onNextStep: () => void;
}

function parseNumericInput(raw: string): number {
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return 0;
  return num;
}

export function CostStep({
  timeline,
  currency,
  topFourDreams,
  expenses,
  onUpdateDream,
  onUpdateExpenses,
  onUpdateExpenseItem,
  onGoToFocusStep,
  onNextStep,
}: CostStepProps) {
  const timelineMonths = timeline === '6m' ? 6 : 12;
  const expenseSummary = getBaselineExpenses(expenses);
  const dreamsTotalMonthly = topFourDreams.reduce(
    (sum, d) => sum + getDreamMonthlyCost(d, timeline),
    0,
  );

  function handleCostTypeChange(dream: DreamItem, nextType: CostType) {
    if (nextType === 'financed') {
      const financing: FinancingParams = dream.financing ?? {
        totalPrice: dream.amount > 0 ? dream.amount : 30000,
        downPayment: 3000,
        months: 60,
        annualRatePct: 6,
      };
      onUpdateDream(dream.id, {
        costType: 'financed',
        financing,
        amount: calculateMonthlyLoanPayment(financing),
      });
      return;
    }

    onUpdateDream(dream.id, {
      costType: nextType,
      amount: nextType === 'free' ? 0 : dream.amount,
    });
  }

  function handleFinancingChange(dream: DreamItem, patch: Partial<FinancingParams>) {
    const current: FinancingParams = dream.financing ?? {
      totalPrice: 30000,
      downPayment: 3000,
      months: 60,
      annualRatePct: 6,
    };
    const updated = { ...current, ...patch };
    onUpdateDream(dream.id, {
      costType: 'financed',
      financing: updated,
      amount: calculateMonthlyLoanPayment(updated),
    });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-soft px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-terracotta uppercase dark:bg-terracotta/20">
          Step 3 · Ideal Lifestyle Costing
        </div>
        <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl dark:text-[#f4f1ec]">
          Convert sticker prices into monthly cash flow
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted dark:text-[#a69f95]">
          One-time adventures divide automatically across your{' '}
          <strong className="font-medium text-ink dark:text-[#f4f1ec]">
            {timelineMonths}-month
          </strong>{' '}
          timeline. Pair your Top 4 dream costs with your baseline expenses and Tim&apos;s{' '}
          <strong className="font-medium text-ink dark:text-[#f4f1ec]">1.3× buffer</strong>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Top 4 Dream Cost Cards */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink dark:text-[#f4f1ec]">
              Top 4 Dreams Cash Flow
            </h3>
            <span className="font-mono text-sm font-semibold tabular-nums text-terracotta">
              {formatCurrency(dreamsTotalMonthly, currency, 0)} / mo
            </span>
          </div>

          {topFourDreams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-warm bg-surface px-6 py-10 text-center dark:border-[#2c2a27] dark:bg-[#1a1917]">
              <Star className="mx-auto h-7 w-7 text-ink-muted" />
              <p className="mt-2 text-sm font-medium text-ink dark:text-[#f4f1ec]">
                No Top 4 dreams selected yet for this timeline.
              </p>
              <button
                type="button"
                onClick={onGoToFocusStep}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                <span>Select Top 4 Dreams</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topFourDreams.map((dream) => {
                const monthly = getDreamMonthlyCost(dream, timeline);
                const fin = dream.financing ?? {
                  totalPrice: 30000,
                  downPayment: 3000,
                  months: 60,
                  annualRatePct: 6,
                };

                return (
                  <div
                    key={dream.id}
                    className="rounded-2xl border border-border-warm bg-surface p-4 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
                          {dream.category}
                        </div>
                        <h4 className="text-base font-semibold text-ink dark:text-[#f4f1ec]">
                          {dream.title}
                        </h4>
                        {dream.category === 'being' && dream.doingConversion?.trim() && (
                          <p className="mt-0.5 text-xs text-ink-muted dark:text-[#a69f95]">
                            Doing: {dream.doingConversion}
                          </p>
                        )}
                      </div>
                      <div className="rounded-xl bg-surface-muted px-3 py-1.5 text-right dark:bg-[#23211e]">
                        <div className="text-[10px] font-medium text-ink-muted uppercase dark:text-[#8f887e]">
                          Monthly Impact
                        </div>
                        <div className="font-mono text-sm font-semibold tabular-nums text-ink dark:text-[#f4f1ec]">
                          {formatCurrency(monthly, currency, 0)} / mo
                        </div>
                      </div>
                    </div>

                    {/* Cost Type Selector */}
                    <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl bg-surface-muted p-1 sm:grid-cols-4 dark:bg-[#23211e]">
                      {COST_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleCostTypeChange(dream, opt.id)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                            dream.costType === opt.id
                              ? 'bg-surface text-ink shadow-2xs dark:bg-[#141312] dark:text-[#f4f1ec]'
                              : 'text-ink-muted hover:text-ink dark:text-[#a69f95]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Amount Inputs */}
                    {dream.costType === 'monthly' && (
                      <div className="mt-3 flex items-center gap-3">
                        <label className="text-xs font-medium text-ink-muted dark:text-[#a69f95]">
                          Monthly Cost ({currency})
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="10"
                          value={dream.amount || ''}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateDream(dream.id, {
                              amount: parseNumericInput(e.target.value),
                            })
                          }
                          className="w-36 rounded-xl border border-border-warm bg-canvas px-3 py-1.5 font-mono text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
                        />
                      </div>
                    )}

                    {dream.costType === 'one_time' && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="text-xs font-medium text-ink-muted dark:text-[#a69f95]">
                          Total One-Time Cost ({currency})
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="50"
                          value={dream.amount || ''}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateDream(dream.id, {
                              amount: parseNumericInput(e.target.value),
                            })
                          }
                          className="w-36 rounded-xl border border-border-warm bg-canvas px-3 py-1.5 font-mono text-sm tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
                        />
                        <span className="text-xs text-ink-muted dark:text-[#a69f95]">
                          ÷ {timelineMonths} mo ={' '}
                          <strong className="font-mono text-ink dark:text-[#f4f1ec]">
                            {formatCurrency(monthly, currency, 0)}/mo
                          </strong>
                        </span>
                      </div>
                    )}

                    {dream.costType === 'financed' && (
                      <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-xl border border-border-warm/80 bg-canvas p-3 sm:grid-cols-4 dark:border-[#2c2a27] dark:bg-[#141312]">
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                            Sticker Price
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={fin.totalPrice}
                            onChange={(e) =>
                              handleFinancingChange(dream, {
                                totalPrice: parseNumericInput(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-border-warm bg-surface px-2 py-1 font-mono text-xs tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                            Down Payment
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={fin.downPayment}
                            onChange={(e) =>
                              handleFinancingChange(dream, {
                                downPayment: parseNumericInput(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-border-warm bg-surface px-2 py-1 font-mono text-xs tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                            Term (Mo)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={fin.months}
                            onChange={(e) =>
                              handleFinancingChange(dream, {
                                months: Math.max(1, parseNumericInput(e.target.value)),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-border-warm bg-surface px-2 py-1 font-mono text-xs tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                            APR %
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            value={fin.annualRatePct}
                            onChange={(e) =>
                              handleFinancingChange(dream, {
                                annualRatePct: parseNumericInput(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-border-warm bg-surface px-2 py-1 font-mono text-xs tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Baseline Monthly Expenses & 1.3x Buffer */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-border-warm bg-surface p-4 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-terracotta" />
                <h3 className="font-serif text-2xl text-ink dark:text-[#f4f1ec]">
                  Baseline Expenses
                </h3>
              </div>

              <div className="inline-flex rounded-lg bg-surface-muted p-0.5 dark:bg-[#23211e]">
                <button
                  type="button"
                  onClick={() => onUpdateExpenses({ mode: 'quick' })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    expenses.mode === 'quick'
                      ? 'bg-surface text-ink shadow-2xs dark:bg-[#141312] dark:text-[#f4f1ec]'
                      : 'text-ink-muted dark:text-[#a69f95]'
                  }`}
                >
                  Quick Estimate
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateExpenses({ mode: 'detailed' })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    expenses.mode === 'detailed'
                      ? 'bg-surface text-ink shadow-2xs dark:bg-[#141312] dark:text-[#f4f1ec]'
                      : 'text-ink-muted dark:text-[#a69f95]'
                  }`}
                >
                  Full 21-Item Audit
                </button>
              </div>
            </div>

            {expenses.mode === 'quick' ? (
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-ink-muted dark:text-[#a69f95]">
                  Streamlined Monthly Living Expenses ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  step="50"
                  value={expenses.quickMonthly || ''}
                  placeholder="2500"
                  onChange={(e) =>
                    onUpdateExpenses({
                      quickMonthly: parseNumericInput(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-border-warm bg-canvas px-3.5 py-2.5 font-mono text-lg font-semibold tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
                />
                <p className="text-xs text-ink-muted dark:text-[#8f887e]">
                  Include rent, food, insurance, bills, and transport — minus subscriptions or
                  clutter you can trim. Switch to <em>Full 21-Item Audit</em> anytime to audit line
                  by line.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {expenseSummary.monthlySavings > 0 && (
                  <div className="rounded-xl bg-sage-soft px-3 py-2 text-xs font-medium text-sage dark:bg-sage/20 dark:text-[#6ec49a]">
                    Trimming non-essentials frees{' '}
                    <strong className="font-mono">
                      {formatCurrency(expenseSummary.monthlySavings, currency, 0)}/mo
                    </strong>{' '}
                    ({formatCurrency(expenseSummary.trimmedDetailedTotal, currency, 0)} vs{' '}
                    {formatCurrency(expenseSummary.currentDetailedTotal, currency, 0)} current).
                  </div>
                )}

                <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
                  {EXPENSE_GROUP_ORDER.map((group) => {
                    const groupItems = expenses.items.filter((i) => i.group === group);
                    return (
                      <div key={group}>
                        <div className="mb-1.5 text-[11px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
                          {EXPENSE_GROUP_LABELS[group]}
                        </div>
                        <div className="space-y-1.5">
                          {groupItems.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-12 items-center gap-2 rounded-lg bg-canvas px-2.5 py-1.5 text-xs dark:bg-[#141312]"
                            >
                              <span className="col-span-6 truncate text-ink dark:text-[#f4f1ec]">
                                {item.label}
                              </span>
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  min={0}
                                  aria-label={`${item.label} current monthly`}
                                  title="Current monthly"
                                  value={item.currentMonthly}
                                  onChange={(e) =>
                                    onUpdateExpenseItem(
                                      item.id,
                                      'currentMonthly',
                                      parseNumericInput(e.target.value),
                                    )
                                  }
                                  className="w-full rounded border border-border-warm bg-surface px-1.5 py-1 text-right font-mono text-[11px] tabular-nums text-ink-muted focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#a69f95]"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  min={0}
                                  aria-label={`${item.label} trimmed monthly`}
                                  title="Trimmed baseline"
                                  value={item.trimmedMonthly}
                                  onChange={(e) =>
                                    onUpdateExpenseItem(
                                      item.id,
                                      'trimmedMonthly',
                                      parseNumericInput(e.target.value),
                                    )
                                  }
                                  className="w-full rounded border border-border-warm bg-surface px-1.5 py-1 text-right font-mono text-[11px] font-semibold tabular-nums text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between border-t border-border-warm pt-2 text-[11px] text-ink-muted dark:border-[#2c2a27] dark:text-[#a69f95]">
                  <span>Left column: Current</span>
                  <span>Right column: Trimmed Baseline</span>
                </div>
              </div>
            )}

            {/* 1.3x Buffer Selector */}
            <div className="mt-5 border-t border-border-warm pt-4 dark:border-[#2c2a27]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink dark:text-[#f4f1ec]">
                  Safety &amp; Savings Cushion
                </span>
                <span className="font-mono text-xs font-semibold text-terracotta">
                  {expenses.bufferMultiplier.toFixed(2)}×
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {BUFFER_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onUpdateExpenses({ bufferMultiplier: preset.value })}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition ${
                      Math.abs(expenses.bufferMultiplier - preset.value) < 0.01
                        ? 'border-terracotta bg-terracotta-soft text-terracotta dark:bg-terracotta/20'
                        : 'border-border-warm bg-canvas text-ink-muted hover:text-ink dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#a69f95]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2 text-xs dark:bg-[#23211e]">
                <span className="text-ink-muted dark:text-[#a69f95]">
                  Buffered Baseline ({formatCurrency(expenseSummary.baselineMonthly, currency, 0)}{' '}
                  × {expenses.bufferMultiplier.toFixed(2)})
                </span>
                <span className="font-mono font-semibold tabular-nums text-ink dark:text-[#f4f1ec]">
                  {formatCurrency(
                    expenseSummary.baselineMonthly * expenses.bufferMultiplier,
                    currency,
                    0,
                  )}
                  /mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-warm bg-surface px-5 py-4 dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="flex items-center gap-2 text-sm text-ink-muted dark:text-[#a69f95]">
          <Calculator className="h-4 w-4 text-terracotta" />
          <span>Ready for the reality check? See your exact TMI and TDI.</span>
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <span>Reveal TMI &amp; TDI</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
