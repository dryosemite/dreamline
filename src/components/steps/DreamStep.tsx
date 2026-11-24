import { useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { UNBLOCKER_PROMPTS } from '../../lib/defaults';
import type { DreamCategory, DreamItem, TimelineKey } from '../../types/dreamline';

interface ColumnMeta {
  category: DreamCategory;
  code: string;
  title: string;
  description: string;
  placeholder: string;
}

const COLUMNS: ColumnMeta[] = [
  {
    category: 'having',
    code: 'A',
    title: 'Having',
    description: 'Material items, gear, or time-freeing support systems.',
    placeholder: 'e.g., Aston Martin DB9, Personal assistant...',
  },
  {
    category: 'being',
    code: 'B',
    title: 'Being',
    description: 'Skills, physical capabilities, or states — convert each to a Doing.',
    placeholder: 'e.g., Fluent in Spanish, Great cook, Full splits...',
  },
  {
    category: 'doing',
    code: 'C',
    title: 'Doing',
    description: 'Adventures, places to visit, and unforgettable experiences.',
    placeholder: 'e.g., Visit Croatian coast, Learn tango in Buenos Aires...',
  },
];

interface DreamStepProps {
  timeline: TimelineKey;
  dreams: DreamItem[];
  topFourCount: number;
  onAddDream: (category: DreamCategory, title: string) => void;
  onUpdateDream: (id: string, patch: Partial<DreamItem>) => void;
  onDeleteDream: (id: string) => void;
  onToggleTopFour: (id: string) => void;
  onNextStep: () => void;
}

export function DreamStep({
  timeline,
  dreams,
  topFourCount,
  onAddDream,
  onUpdateDream,
  onDeleteDream,
  onToggleTopFour,
  onNextStep,
}: DreamStepProps) {
  const [inputs, setInputs] = useState<Record<DreamCategory, string>>({
    having: '',
    being: '',
    doing: '',
  });
  const [showUnblocker, setShowUnblocker] = useState(false);

  const inputRefs: Record<DreamCategory, React.RefObject<HTMLInputElement | null>> = {
    having: useRef<HTMLInputElement>(null),
    being: useRef<HTMLInputElement>(null),
    doing: useRef<HTMLInputElement>(null),
  };

  function handleAdd(category: DreamCategory) {
    const trimmed = inputs[category].trim();
    if (!trimmed) return;
    onAddDream(category, trimmed);
    setInputs((prev) => ({ ...prev, [category]: '' }));
  }

  function handleApplyPrompt(category: DreamCategory, starter: string) {
    setInputs((prev) => ({ ...prev, [category]: starter }));
    requestAnimationFrame(() => {
      const el = inputRefs[category].current;
      if (el) {
        el.focus();
        el.setSelectionRange(starter.length, starter.length);
      }
    });
  }

  const timelineLabel = timeline === '6m' ? '6 Months' : '12 Months';

  return (
    <section className="space-y-6">
      {/* Mindset Banner */}
      <div className="rounded-2xl border border-border-warm bg-surface p-5 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-soft px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-terracotta uppercase dark:bg-terracotta/20">
              Step 1 · {timelineLabel} Brainstorm
            </div>
            <h2 className="mt-2 font-serif text-2xl leading-snug text-ink sm:text-3xl dark:text-[#f4f1ec]">
              What would excite you if there were no way you could fail?
            </h2>
            <p className="mt-1 text-sm text-ink-muted dark:text-[#a69f95]">
              Imagine you were 10× smarter or already had $100M in the bank. List up to{' '}
              <strong className="font-medium text-ink dark:text-[#f4f1ec]">
                5 dreams per column
              </strong>
              , and turn vague <em>Being</em> goals into concrete <em>Doing</em> milestones.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUnblocker((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-warm bg-surface-muted px-3 py-2 text-xs font-semibold text-ink transition hover:border-terracotta/50 dark:border-[#2c2a27] dark:bg-[#23211e] dark:text-[#f4f1ec]"
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-warm" />
            <span>Stuck? Use Tim&apos;s 5 Unblockers</span>
            {showUnblocker ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {showUnblocker && (
          <div className="mt-4 border-t border-border-warm pt-4 dark:border-[#2c2a27]">
            <p className="mb-2.5 text-xs font-medium text-ink-muted dark:text-[#a69f95]">
              Click any prompt to jump-start the matching column:
            </p>
            <div className="flex flex-wrap gap-2">
              {UNBLOCKER_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleApplyPrompt(prompt.category, prompt.starter)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-warm bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-terracotta hover:text-terracotta dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
                >
                  <span className="font-mono text-[10px] uppercase text-ink-muted dark:text-[#8f887e]">
                    {prompt.category}
                  </span>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Three Columns: Having / Being / Doing */}
      <div className="grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = dreams.filter((d) => d.category === col.category);
          return (
            <div
              key={col.category}
              className="flex flex-col rounded-2xl border border-border-warm bg-surface p-4 shadow-2xs dark:border-[#2c2a27] dark:bg-[#1a1917]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-surface-muted font-mono text-xs font-bold text-ink dark:bg-[#272522] dark:text-[#f4f1ec]">
                      {col.code}
                    </span>
                    <h3 className="font-serif text-2xl text-ink dark:text-[#f4f1ec]">
                      {col.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted dark:text-[#a69f95]">
                    {col.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                    items.length >= 5
                      ? 'bg-sage-soft text-sage dark:bg-sage/20 dark:text-[#6ec49a]'
                      : 'bg-surface-muted text-ink-muted dark:bg-[#272522] dark:text-[#a69f95]'
                  }`}
                >
                  {items.length}/5
                </span>
              </div>

              {/* Quick Inline Add */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd(col.category);
                }}
                className="mt-4 flex gap-2"
              >
                <input
                  ref={inputRefs[col.category]}
                  type="text"
                  value={inputs[col.category]}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [col.category]: e.target.value }))
                  }
                  placeholder={col.placeholder}
                  aria-label={`Add ${col.title} dream`}
                  className="min-w-0 flex-1 rounded-xl border border-border-warm bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec] dark:placeholder:text-[#7c756c]"
                />
                <button
                  type="submit"
                  aria-label={`Add to ${col.title}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-terracotta dark:bg-[#f4f1ec] dark:text-[#141312] dark:hover:bg-terracotta dark:hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>

              {/* Dream Cards */}
              <div className="mt-4 flex-1 space-y-2.5">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border-warm px-3 py-6 text-center text-xs text-ink-muted dark:border-[#2c2a27] dark:text-[#8f887e]">
                    No {col.title.toLowerCase()} dreams yet. Type above and press Enter.
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 transition ${
                        item.isTopFour
                          ? 'border-terracotta/50 bg-terracotta-soft/35 dark:border-terracotta/50 dark:bg-terracotta/10'
                          : 'border-border-warm bg-canvas/70 dark:border-[#2c2a27] dark:bg-[#141312]/70'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleTopFour(item.id)}
                          aria-label={
                            item.isTopFour
                              ? `Unstar ${item.title} from Top 4`
                              : `Star ${item.title} into Top 4`
                          }
                          title={
                            item.isTopFour
                              ? 'In Top 4 (click to remove)'
                              : 'Star into Top 4'
                          }
                          className={`mt-0.5 shrink-0 rounded-md p-1 transition ${
                            item.isTopFour
                              ? 'text-terracotta'
                              : 'text-ink-muted/60 hover:text-terracotta dark:text-[#7c756c]'
                          }`}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={item.isTopFour ? 'currentColor' : 'none'}
                          />
                        </button>

                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            onUpdateDream(item.id, { title: e.target.value })
                          }
                          aria-label="Edit dream title"
                          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none dark:text-[#f4f1ec]"
                        />

                        <button
                          type="button"
                          onClick={() => onDeleteDream(item.id)}
                          aria-label={`Delete ${item.title}`}
                          className="shrink-0 rounded-md p-1 text-ink-muted/60 transition hover:text-red-600 dark:text-[#7c756c] dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {col.category === 'being' && (
                        <div className="mt-2 border-t border-border-warm/70 pt-2 pl-7 dark:border-[#2c2a27]">
                          <label className="block text-[10px] font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
                            Convert Being → Concrete Doing
                          </label>
                          <input
                            type="text"
                            value={item.doingConversion ?? ''}
                            onChange={(e) =>
                              onUpdateDream(item.id, { doingConversion: e.target.value })
                            }
                            placeholder="e.g., Have a 5-min conversation with a native speaker"
                            className="mt-1 w-full rounded-lg border border-border-warm/80 bg-surface px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted/60 focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-warm bg-surface px-5 py-4 dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="text-sm text-ink-muted dark:text-[#a69f95]">
          Brainstormed{' '}
          <strong className="font-semibold text-ink dark:text-[#f4f1ec]">
            {dreams.length}
          </strong>{' '}
          dream{dreams.length === 1 ? '' : 's'} ({topFourCount}/4 starred). Ready to narrow down?
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <span>Select Top 4 Dreams</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
