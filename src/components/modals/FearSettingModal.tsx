import { useEffect } from 'react';
import { Plus, ShieldAlert, Trash2, X } from 'lucide-react';
import { createId } from '../../lib/defaults';
import type { FearItem, FearSettingData } from '../../types/dreamline';

interface FearSettingModalProps {
  isOpen: boolean;
  data: FearSettingData;
  onChange: (next: FearSettingData) => void;
  onClose: () => void;
}

export function FearSettingModal({
  isOpen,
  data,
  onChange,
  onClose,
}: FearSettingModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function addFearRow() {
    const newRow: FearItem = {
      id: createId('fear'),
      define: '',
      prevent: '',
      repair: '',
      impact: 5,
    };
    onChange({ ...data, fears: [...data.fears, newRow] });
  }

  function updateFearRow(id: string, patch: Partial<FearItem>) {
    onChange({
      ...data,
      fears: data.fears.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function deleteFearRow(id: string) {
    onChange({
      ...data,
      fears: data.fears.filter((f) => f.id !== id),
    });
  }

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fear-setting-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-warm bg-surface shadow-xl dark:border-[#2c2a27] dark:bg-[#1a1917]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-warm px-5 py-4 dark:border-[#2c2a27]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-terracotta" />
            <div>
              <h2
                id="fear-setting-title"
                className="font-serif text-2xl leading-none text-ink dark:text-[#f4f1ec]"
              >
                Fear-Setting (Chapter 3 Companion)
              </h2>
              <p className="mt-1 text-xs text-ink-muted dark:text-[#a69f95]">
                Clear the terror of specificity before taking action on your Dreamline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Fear-Setting"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-[#a69f95] dark:hover:bg-[#272522]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Prompt */}
          <div>
            <label className="block text-xs font-semibold tracking-wider text-ink-muted uppercase dark:text-[#a69f95]">
              What decision or leap are you considering?
            </label>
            <input
              type="text"
              value={data.prompt}
              onChange={(e) => onChange({ ...data, prompt: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-border-warm bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
            />
          </div>

          {/* Page 1: Define / Prevent / Repair */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-ink dark:text-[#f4f1ec]">
                1. Define · Prevent · Repair
              </h3>
              <button
                type="button"
                onClick={addFearRow}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink hover:bg-terracotta hover:text-white dark:bg-[#23211e] dark:text-[#f4f1ec]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Scenario</span>
              </button>
            </div>

            <div className="space-y-3">
              {data.fears.map((fear, idx) => (
                <div
                  key={fear.id}
                  className="rounded-xl border border-border-warm bg-canvas p-3.5 dark:border-[#2c2a27] dark:bg-[#141312]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                      Worst Case #{idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[11px] text-ink-muted dark:text-[#a69f95]">
                        <span>Impact (1–10):</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={fear.impact}
                          onChange={(e) =>
                            updateFearRow(fear.id, {
                              impact: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                            })
                          }
                          className="w-12 rounded border border-border-warm bg-surface px-1.5 py-0.5 text-center font-mono text-xs text-ink dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteFearRow(fear.id)}
                        aria-label="Remove fear row"
                        className="text-ink-muted hover:text-red-600 dark:text-[#8f887e]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-terracotta uppercase">
                        Define (Worst case)
                      </label>
                      <textarea
                        rows={2}
                        value={fear.define}
                        onChange={(e) => updateFearRow(fear.id, { define: e.target.value })}
                        placeholder="What is the worst thing that could happen?"
                        className="mt-1 w-full rounded-lg border border-border-warm bg-surface p-2 text-xs text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-amber-warm uppercase">
                        Prevent (Reduce odds)
                      </label>
                      <textarea
                        rows={2}
                        value={fear.prevent}
                        onChange={(e) => updateFearRow(fear.id, { prevent: e.target.value })}
                        placeholder="How could you prevent it?"
                        className="mt-1 w-full rounded-lg border border-border-warm bg-surface p-2 text-xs text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-sage uppercase dark:text-[#6ec49a]">
                        Repair (Recover)
                      </label>
                      <textarea
                        rows={2}
                        value={fear.repair}
                        onChange={(e) => updateFearRow(fear.id, { repair: e.target.value })}
                        placeholder="How would you bounce back if it occurred?"
                        className="mt-1 w-full rounded-lg border border-border-warm bg-surface p-2 text-xs text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page 2: Benefits */}
          <div>
            <h3 className="font-serif text-xl text-ink dark:text-[#f4f1ec]">
              2. Benefits of an Attempt or Partial Success
            </h3>
            <textarea
              rows={2}
              value={data.benefits}
              onChange={(e) => onChange({ ...data, benefits: e.target.value })}
              placeholder="Confidence, new skills, financial upside, freedom..."
              className="mt-2 w-full rounded-xl border border-border-warm bg-canvas p-3 text-xs text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
            />
          </div>

          {/* Page 3: Cost of Inaction */}
          <div>
            <h3 className="font-serif text-xl text-ink dark:text-[#f4f1ec]">
              3. The Cost of Inaction (Status Quo Risk)
            </h3>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              {[
                { key: 'sixMonths' as const, label: 'In 6 Months' },
                { key: 'oneYear' as const, label: 'In 1 Year' },
                { key: 'threeYears' as const, label: 'In 3 Years' },
              ].map((col) => (
                <div key={col.key}>
                  <label className="block text-[11px] font-semibold text-ink-muted uppercase dark:text-[#a69f95]">
                    {col.label}
                  </label>
                  <textarea
                    rows={3}
                    value={data.costOfInaction[col.key]}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        costOfInaction: {
                          ...data.costOfInaction,
                          [col.key]: e.target.value,
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border-warm bg-canvas p-2.5 text-xs text-ink focus:border-terracotta focus:outline-none dark:border-[#2c2a27] dark:bg-[#141312] dark:text-[#f4f1ec]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border-warm px-5 py-3 dark:border-[#2c2a27]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            Done &amp; Return to Dreamline
          </button>
        </div>
      </div>
    </div>
  );
}
