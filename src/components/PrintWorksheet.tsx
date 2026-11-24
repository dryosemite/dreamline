import {
  calculateTimelineMetrics,
  formatCurrency,
  formatTargetDate,
  getDreamMonthlyCost,
  getTimelineCountdown,
} from '../lib/calculations';
import type { DreamlineState, TimelineKey } from '../types/dreamline';

interface PrintWorksheetProps {
  state: DreamlineState;
}

function PrintTimelineSection({
  state,
  timeline,
}: {
  state: DreamlineState;
  timeline: TimelineKey;
}) {
  const dreams = state.timelines[timeline].dreams;
  const metrics = calculateTimelineMetrics(dreams, timeline, state.expenses, state.income);
  const countdown = getTimelineCountdown(state.startDate, timeline);

  return (
    <div className="mb-6 break-inside-avoid border border-neutral-300 p-4">
      <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2">
        <h2 className="font-serif text-xl font-bold">
          {timeline === '6m' ? '6-Month Dreamline' : '12-Month Dreamline'} (Target:{' '}
          {formatTargetDate(countdown.targetDate)})
        </h2>
        <div className="font-mono text-sm font-bold">
          TMI: {formatCurrency(metrics.tmi, state.currency, 0)}/mo · TDI:{' '}
          {formatCurrency(metrics.tdi, state.currency, 2)}/day
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2 bg-neutral-100 p-2 font-mono text-xs">
        <div>Having (A): {formatCurrency(metrics.havingMonthly, state.currency, 0)}</div>
        <div>Being (B): {formatCurrency(metrics.beingMonthly, state.currency, 0)}</div>
        <div>Doing (C): {formatCurrency(metrics.doingMonthly, state.currency, 0)}</div>
        <div>
          Expenses × {metrics.bufferMultiplier.toFixed(2)}:{' '}
          {formatCurrency(metrics.bufferedExpenses, state.currency, 0)}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {metrics.topFourDreams.length === 0 ? (
          <p className="text-xs text-neutral-500">No Top 4 dreams selected yet.</p>
        ) : (
          metrics.topFourDreams.map((dream) => (
            <div key={dream.id} className="border-t border-neutral-200 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>
                  [{dream.category.toUpperCase()}] {dream.title}
                  {dream.category === 'being' && dream.doingConversion?.trim()
                    ? ` → Doing: ${dream.doingConversion}`
                    : ''}
                </span>
                <span className="font-mono">
                  {formatCurrency(getDreamMonthlyCost(dream, timeline), state.currency, 0)}/mo
                </span>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  {dream.actions.now.done ? '☑' : '☐'} <strong>Now:</strong>{' '}
                  {dream.actions.now.text || '__________________'}
                </div>
                <div>
                  {dream.actions.tomorrow.done ? '☑' : '☐'} <strong>Tomorrow:</strong>{' '}
                  {dream.actions.tomorrow.text || '__________________'}
                </div>
                <div>
                  {dream.actions.dayAfter.done ? '☑' : '☐'} <strong>Day After:</strong>{' '}
                  {dream.actions.dayAfter.text || '__________________'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function PrintWorksheet({ state }: PrintWorksheetProps) {
  return (
    <div className="print-only hidden bg-white p-2 text-black">
      <div className="mb-4 flex items-baseline justify-between border-b-2 border-black pb-2">
        <div>
          <h1 className="font-serif text-3xl">Dreamline — Ideal Lifestyle Worksheet</h1>
          <p className="text-xs text-neutral-600">
            Tim Ferriss 4-Hour Workweek Formula · TMI = A + B + C + (1.3 × Monthly Expenses) · TDI
            = TMI ÷ 30
          </p>
        </div>
        <div className="font-mono text-xs">
          Start: {state.startDate} · Currency: {state.currency}
        </div>
      </div>

      <PrintTimelineSection state={state} timeline="6m" />
      <PrintTimelineSection state={state} timeline="12m" />
    </div>
  );
}
