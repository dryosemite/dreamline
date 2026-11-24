import { Calculator, Compass, DollarSign, Rocket, Star } from 'lucide-react';
import type { StepId } from '../types/dreamline';

interface StepMeta {
  id: StepId;
  num: number;
  title: string;
  subtitle: string;
  icon: typeof Compass;
}

const STEPS: StepMeta[] = [
  { id: 'dream', num: 1, title: 'Dream', subtitle: 'Have · Be · Do', icon: Compass },
  { id: 'focus', num: 2, title: 'Focus', subtitle: 'Pick Top 4', icon: Star },
  { id: 'cost', num: 3, title: 'Cost', subtitle: 'Cash Flow', icon: DollarSign },
  { id: 'reality', num: 4, title: 'Reality', subtitle: 'TMI & TDI', icon: Calculator },
  { id: 'launch', num: 5, title: 'Launch', subtitle: 'Now · Tomorrow', icon: Rocket },
];

interface StepNavProps {
  activeStep: StepId;
  onSelectStep: (step: StepId) => void;
}

export function StepNav({ activeStep, onSelectStep }: StepNavProps) {
  return (
    <nav aria-label="Dreamline workflow steps" className="no-print mx-auto max-w-7xl px-4 pt-5 sm:px-6">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const active = activeStep === step.id;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelectStep(step.id)}
                aria-current={active ? 'step' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-terracotta bg-surface shadow-xs dark:border-terracotta dark:bg-[#1e1d1a]'
                    : 'border-border-warm/80 bg-surface-muted/60 text-ink-muted hover:border-border-warm hover:bg-surface dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#a69f95] dark:hover:bg-[#22201d]'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    active
                      ? 'bg-terracotta text-white'
                      : 'bg-surface text-ink-muted dark:bg-[#272522] dark:text-[#b8b1a7]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div
                    className={`truncate text-xs font-semibold sm:text-sm ${
                      active ? 'text-ink dark:text-[#f4f1ec]' : ''
                    }`}
                  >
                    {step.num}. {step.title}
                  </div>
                  <div className="truncate text-[11px] text-ink-muted dark:text-[#8f887e]">
                    {step.subtitle}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
