import { AlertCircle, ArrowRight, Compass, Star } from 'lucide-react';
import type { DreamCategory, DreamItem, TimelineKey } from '../../types/dreamline';

const CATEGORY_BADGE: Record<DreamCategory, { label: string; badgeClass: string }> = {
  having: {
    label: 'A · Having',
    badgeClass: 'bg-surface-muted text-ink dark:bg-[#272522] dark:text-[#f4f1ec]',
  },
  being: {
    label: 'B · Being',
    badgeClass: 'bg-amber-soft text-amber-warm dark:bg-amber-warm/20 dark:text-[#eab354]',
  },
  doing: {
    label: 'C · Doing',
    badgeClass: 'bg-sage-soft text-sage dark:bg-sage/20 dark:text-[#6ec49a]',
  },
};

interface FocusStepProps {
  timeline: TimelineKey;
  dreams: DreamItem[];
  topFourWarning: string | null;
  onToggleTopFour: (id: string) => void;
  onGoToDreamStep: () => void;
  onNextStep: () => void;
}

export function FocusStep({
  timeline,
  dreams,
  topFourWarning,
  onToggleTopFour,
  onGoToDreamStep,
  onNextStep,
}: FocusStepProps) {
  const topFour = dreams.filter((d) => d.isTopFour);
  const timelineLabel = timeline === '6m' ? '6-Month' : '12-Month';

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-soft px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-terracotta uppercase dark:bg-terracotta/20">
              Step 2 · Tim&apos;s Top 4 Filter
            </div>
            <h2 className="mt-2 font-serif text-2xl text-ink sm:text-3xl dark:text-[#f4f1ec]">
              Pick only the 4 dreams that would change it all
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-[#a69f95]">
              Trying to fund 15 goals at once creates overwhelm. Star your top 4{' '}
              {timelineLabel} dreams across Having, Being, and Doing.
            </p>
          </div>

          <div className="rounded-2xl border border-border-warm bg-canvas px-4 py-3 text-center dark:border-[#2c2a27] dark:bg-[#141312]">
            <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
              Selected
            </div>
            <div className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-ink dark:text-[#f4f1ec]">
              <span className={topFour.length === 4 ? 'text-sage dark:text-[#6ec49a]' : 'text-terracotta'}>
                {topFour.length}
              </span>
              <span className="text-ink-muted dark:text-[#7c756c]"> / 4</span>
            </div>
          </div>
        </div>

        {topFourWarning && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-terracotta/40 bg-terracotta-soft px-3.5 py-2.5 text-xs font-medium text-terracotta dark:bg-terracotta/15"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{topFourWarning}</span>
          </div>
        )}
      </div>

      {dreams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-warm bg-surface px-6 py-12 text-center dark:border-[#2c2a27] dark:bg-[#1a1917]">
          <Compass className="mx-auto h-8 w-8 text-ink-muted" />
          <h3 className="mt-3 font-serif text-2xl text-ink dark:text-[#f4f1ec]">
            Your {timelineLabel} board is still empty
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted dark:text-[#a69f95]">
            Brainstorm a few ideas across Having, Being, and Doing first — even 4 rough items is plenty.
          </p>
          <button
            type="button"
            onClick={onGoToDreamStep}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span>Go to Step 1: Dream</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dreams.map((dream) => {
            const meta = CATEGORY_BADGE[dream.category];
            return (
              <button
                key={dream.id}
                type="button"
                onClick={() => onToggleTopFour(dream.id)}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                  dream.isTopFour
                    ? 'border-terracotta bg-terracotta-soft/30 shadow-xs dark:border-terracotta dark:bg-terracotta/15'
                    : 'border-border-warm bg-surface hover:border-terracotta/40 dark:border-[#2c2a27] dark:bg-[#1a1917]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                        dream.isTopFour
                          ? 'bg-terracotta text-white'
                          : 'bg-surface-muted text-ink-muted dark:bg-[#272522] dark:text-[#8f887e]'
                      }`}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={dream.isTopFour ? 'currentColor' : 'none'}
                      />
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold leading-snug text-ink dark:text-[#f4f1ec]">
                    {dream.title}
                  </h3>

                  {dream.category === 'being' && dream.doingConversion?.trim() && (
                    <p className="mt-1.5 text-xs text-ink-muted dark:text-[#a69f95]">
                      <span className="font-semibold text-ink dark:text-[#d8d2c9]">Doing:</span>{' '}
                      {dream.doingConversion}
                    </p>
                  )}
                </div>

                <div className="mt-4 text-[11px] font-medium text-ink-muted dark:text-[#8f887e]">
                  {dream.isTopFour ? 'Selected in Top 4 — click to remove' : 'Click to star into Top 4'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-warm bg-surface px-5 py-4 dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="text-sm text-ink-muted dark:text-[#a69f95]">
          {topFour.length === 0
            ? 'Star 1 to 4 dreams above to calculate their monthly cash flow.'
            : `${topFour.length} dream${topFour.length === 1 ? '' : 's'} locked into your Top 4.`}
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <span>Price Your Top 4</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
