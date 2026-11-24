import { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-warm bg-surface shadow-xl dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="flex items-center justify-between border-b border-border-warm px-5 py-4 dark:border-[#2c2a27]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-terracotta" />
            <h2
              id="guide-modal-title"
              className="font-serif text-2xl text-ink dark:text-[#f4f1ec]"
            >
              Tim Ferriss&apos;s Dreamlining Method
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Method Guide"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-[#a69f95] dark:hover:bg-[#272522]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm leading-relaxed text-ink-muted dark:text-[#c7bfb4]">
          <div className="rounded-xl bg-terracotta-soft/45 p-4 text-ink dark:bg-terracotta/15 dark:text-[#f4f1ec]">
            <p className="font-serif text-lg italic">
              &ldquo;The opposite of happiness isn&apos;t sadness — it&apos;s boredom. Ask
              what would excite you, not what sounds realistic.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-[#f4f1ec]">
              1. Think in 6-Month &amp; 12-Month Sprints
            </h3>
            <p className="mt-1">
              Never plan 5 or 10 years out. Short deadlines create immediate clarity and urgency.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-[#f4f1ec]">
              2. Have, Be, Do — and Convert Being → Doing
            </h3>
            <p className="mt-1">
              List up to 5 dreams per column assuming failure is impossible. Then translate every
              abstract <strong>Being</strong> item into an observable action:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              <li>
                <em>&ldquo;Be fluent in Chinese&rdquo;</em> →{' '}
                <strong>&ldquo;Hold a 5-minute conversation with a native speaker.&rdquo;</strong>
              </li>
              <li>
                <em>&ldquo;Be a great cook&rdquo;</em> →{' '}
                <strong>&ldquo;Cook a full holiday dinner without recipes or help.&rdquo;</strong>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-[#f4f1ec]">
              3. Star Only Your Top 4 Dreams
            </h3>
            <p className="mt-1">
              Narrowing your list to 4 high-impact dreams prevents overwhelm and reveals how
              affordable your ideal lifestyle actually is.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-[#f4f1ec]">
              4. Exact Ideal Lifestyle Costing Formulas
            </h3>
            <div className="mt-2 rounded-xl border border-border-warm bg-canvas p-3 font-mono text-xs text-ink dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]">
              <div>TMI = A (Having) + B (Being) + C (Doing) + (1.3 × Baseline Expenses)</div>
              <div className="mt-1 text-terracotta">TDI = TMI ÷ 30</div>
            </div>
            <p className="mt-2 text-xs">
              Price big purchases via monthly cash flow (lease/financing) and prorate one-time
              trips across 6 or 12 months. The 1.3× multiplier adds a 30% safety &amp; savings
              cushion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-[#f4f1ec]">
              5. Execute Step 1 Immediately
            </h3>
            <p className="mt-1">
              Write 3 micro-actions for each Top 4 dream (<strong>Now</strong>,{' '}
              <strong>Tomorrow before 11 AM</strong>, <strong>Day After</strong>) and take the
              first 5-to-10-minute step before leaving.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-border-warm px-5 py-3 dark:border-[#2c2a27]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white dark:bg-[#f4f1ec] dark:text-[#141312]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
