import { ArrowLeft, CopyCheck, Sparkles } from 'lucide-react';

interface SampleBannerProps {
  onExitSample: () => void;
  onAdoptSample: () => void;
}

export function SampleBanner({ onExitSample, onAdoptSample }: SampleBannerProps) {
  return (
    <div className="no-print border-b border-terracotta/30 bg-terracotta-soft px-4 py-2.5 text-ink dark:border-terracotta/40 dark:bg-terracotta/15 dark:text-[#f4f1ec]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-terracotta" />
          <span>
            <strong>Exploring Tim Ferriss&apos;s Sample Dreamline</strong> — your own saved
            Dreamline is untouched.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAdoptSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-terracotta/40 bg-surface px-3 py-1.5 text-xs font-semibold text-terracotta transition hover:bg-terracotta hover:text-white dark:bg-[#1c1a18]"
          >
            <CopyCheck className="h-3.5 w-3.5" />
            Use Sample as My Starting Point
          </button>
          <button
            type="button"
            onClick={onExitSample}
            className="inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to My Dreamline
          </button>
        </div>
      </div>
    </div>
  );
}
