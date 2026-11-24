import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { PrintWorksheet } from './components/PrintWorksheet';
import { RealityStrip } from './components/RealityStrip';
import { SampleBanner } from './components/SampleBanner';
import { StepNav } from './components/StepNav';
import { ExportModal } from './components/modals/ExportModal';
import { FearSettingModal } from './components/modals/FearSettingModal';
import { GuideModal } from './components/modals/GuideModal';
import { CostStep } from './components/steps/CostStep';
import { DreamStep } from './components/steps/DreamStep';
import { FocusStep } from './components/steps/FocusStep';
import { LaunchStep } from './components/steps/LaunchStep';
import { RealityStep } from './components/steps/RealityStep';
import { calculateTimelineMetrics } from './lib/calculations';
import {
  createDreamItem,
  createInitialState,
  createTimFerrissSampleState,
} from './lib/defaults';
import { loadState, saveState } from './lib/storage';
import type {
  DreamCategory,
  DreamItem,
  DreamlineState,
  ExpensesConfig,
  FearSettingData,
  IncomeProfile,
  StepId,
  TimelineKey,
} from './types/dreamline';

export function App() {
  const [userState, setUserState] = useState<DreamlineState>(() => loadState());
  const [isSamplePreview, setIsSamplePreview] = useState(false);
  const [sampleState, setSampleState] = useState<DreamlineState>(() =>
    createTimFerrissSampleState(),
  );
  const [topFourWarning, setTopFourWarning] = useState<string | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  const [isFearOpen, setIsFearOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const activeState = isSamplePreview ? sampleState : userState;

  useEffect(() => {
    saveState(userState);
  }, [userState]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', userState.theme === 'dark');
  }, [userState.theme]);

  useEffect(() => {
    return () => {
      if (warningTimerRef.current) {
        window.clearTimeout(warningTimerRef.current);
      }
    };
  }, []);

  function updateActiveState(updater: (prev: DreamlineState) => DreamlineState) {
    if (isSamplePreview) {
      setSampleState(updater);
    } else {
      setUserState(updater);
    }
  }

  function showTopFourGuardrail() {
    setTopFourWarning(
      "Tim's Rule: Pick only 4 dreams per timeline to avoid overwhelm. Unstar one first.",
    );
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    warningTimerRef.current = window.setTimeout(() => {
      setTopFourWarning(null);
    }, 4500);
  }

  const timeline = activeState.activeTimeline;
  const otherTimeline: TimelineKey = timeline === '6m' ? '12m' : '6m';
  const currentDreams = activeState.timelines[timeline].dreams;
  const metrics = calculateTimelineMetrics(
    currentDreams,
    timeline,
    activeState.expenses,
    activeState.income,
  );
  const otherMetrics = calculateTimelineMetrics(
    activeState.timelines[otherTimeline].dreams,
    otherTimeline,
    activeState.expenses,
    activeState.income,
  );

  function handleAddDream(category: DreamCategory, title: string) {
    const newDream = createDreamItem(category, title);
    updateActiveState((prev) => ({
      ...prev,
      timelines: {
        ...prev.timelines,
        [prev.activeTimeline]: {
          dreams: [...prev.timelines[prev.activeTimeline].dreams, newDream],
        },
      },
    }));
  }

  function handleUpdateDream(id: string, patch: Partial<DreamItem>) {
    updateActiveState((prev) => ({
      ...prev,
      timelines: {
        ...prev.timelines,
        [prev.activeTimeline]: {
          dreams: prev.timelines[prev.activeTimeline].dreams.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        },
      },
    }));
  }

  function handleDeleteDream(id: string) {
    updateActiveState((prev) => ({
      ...prev,
      timelines: {
        ...prev.timelines,
        [prev.activeTimeline]: {
          dreams: prev.timelines[prev.activeTimeline].dreams.filter((d) => d.id !== id),
        },
      },
    }));
  }

  function handleToggleTopFour(id: string) {
    const target = currentDreams.find((d) => d.id === id);
    if (!target) return;

    if (!target.isTopFour) {
      const currentTopCount = currentDreams.filter((d) => d.isTopFour).length;
      if (currentTopCount >= 4) {
        showTopFourGuardrail();
        return;
      }
    }

    setTopFourWarning(null);
    handleUpdateDream(id, { isTopFour: !target.isTopFour });
  }

  function handleUpdateExpenses(patch: Partial<ExpensesConfig>) {
    updateActiveState((prev) => ({
      ...prev,
      expenses: { ...prev.expenses, ...patch },
    }));
  }

  function handleUpdateExpenseItem(
    itemId: string,
    field: 'currentMonthly' | 'trimmedMonthly',
    value: number,
  ) {
    updateActiveState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        items: prev.expenses.items.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item,
        ),
      },
    }));
  }

  function handleUpdateIncome(patch: Partial<IncomeProfile>) {
    updateActiveState((prev) => ({
      ...prev,
      income: { ...prev.income, ...patch },
    }));
  }

  function handleUpdateAction(
    dreamId: string,
    horizon: 'now' | 'tomorrow' | 'dayAfter',
    patch: { text?: string; done?: boolean },
  ) {
    updateActiveState((prev) => ({
      ...prev,
      timelines: {
        ...prev.timelines,
        [prev.activeTimeline]: {
          dreams: prev.timelines[prev.activeTimeline].dreams.map((d) => {
            if (d.id !== dreamId) return d;
            const prevStep = d.actions[horizon];
            const nextDone = patch.done !== undefined ? patch.done : prevStep.done;
            return {
              ...d,
              actions: {
                ...d.actions,
                [horizon]: {
                  ...prevStep,
                  ...patch,
                  completedAt: nextDone
                    ? prevStep.completedAt ?? new Date().toISOString()
                    : undefined,
                },
              },
            };
          }),
        },
      },
    }));
  }

  function handleUpdateFearSetting(next: FearSettingData) {
    updateActiveState((prev) => ({ ...prev, fearSetting: next }));
  }

  function handleToggleSample() {
    if (!isSamplePreview) {
      setSampleState(createTimFerrissSampleState());
      setIsSamplePreview(true);
    } else {
      setIsSamplePreview(false);
    }
    setTopFourWarning(null);
  }

  function handleAdoptSample() {
    setUserState({
      ...sampleState,
      theme: userState.theme,
    });
    setIsSamplePreview(false);
    setTopFourWarning(null);
  }

  function handleSetStep(step: StepId) {
    setTopFourWarning(null);
    updateActiveState((prev) => ({ ...prev, activeStep: step }));
  }

  function handleSetTimeline(nextTimeline: TimelineKey) {
    setTopFourWarning(null);
    updateActiveState((prev) => ({ ...prev, activeTimeline: nextTimeline }));
  }

  return (
    <div className="min-h-screen bg-canvas text-ink dark:bg-[#141312] dark:text-[#f4f1ec]">
      <Header
        activeTimeline={activeState.activeTimeline}
        startDate={activeState.startDate}
        currency={activeState.currency}
        theme={userState.theme}
        isSamplePreview={isSamplePreview}
        onChangeTimeline={handleSetTimeline}
        onChangeCurrency={(currency) =>
          updateActiveState((prev) => ({ ...prev, currency }))
        }
        onToggleTheme={() =>
          setUserState((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
        onToggleSample={handleToggleSample}
        onOpenFearSetting={() => setIsFearOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {isSamplePreview && (
        <SampleBanner
          onExitSample={() => setIsSamplePreview(false)}
          onAdoptSample={handleAdoptSample}
        />
      )}

      <RealityStrip
        metrics={metrics}
        currency={activeState.currency}
        timeline={activeState.activeTimeline}
        startDate={activeState.startDate}
        onJumpToStep={handleSetStep}
      />

      <StepNav activeStep={activeState.activeStep} onSelectStep={handleSetStep} />

      <main className="no-print mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {activeState.activeStep === 'dream' && (
          <DreamStep
            timeline={activeState.activeTimeline}
            dreams={currentDreams}
            topFourCount={metrics.topFourCount}
            onAddDream={handleAddDream}
            onUpdateDream={handleUpdateDream}
            onDeleteDream={handleDeleteDream}
            onToggleTopFour={handleToggleTopFour}
            onNextStep={() => handleSetStep('focus')}
          />
        )}

        {activeState.activeStep === 'focus' && (
          <FocusStep
            timeline={activeState.activeTimeline}
            dreams={currentDreams}
            topFourWarning={topFourWarning}
            onToggleTopFour={handleToggleTopFour}
            onGoToDreamStep={() => handleSetStep('dream')}
            onNextStep={() => handleSetStep('cost')}
          />
        )}

        {activeState.activeStep === 'cost' && (
          <CostStep
            timeline={activeState.activeTimeline}
            currency={activeState.currency}
            topFourDreams={metrics.topFourDreams}
            expenses={activeState.expenses}
            onUpdateDream={handleUpdateDream}
            onUpdateExpenses={handleUpdateExpenses}
            onUpdateExpenseItem={handleUpdateExpenseItem}
            onGoToFocusStep={() => handleSetStep('focus')}
            onNextStep={() => handleSetStep('reality')}
          />
        )}

        {activeState.activeStep === 'reality' && (
          <RealityStep
            timeline={activeState.activeTimeline}
            currency={activeState.currency}
            metrics={metrics}
            otherMetrics={otherMetrics}
            income={activeState.income}
            onUpdateIncome={handleUpdateIncome}
            onSelectTimeline={handleSetTimeline}
            onNextStep={() => handleSetStep('launch')}
          />
        )}

        {activeState.activeStep === 'launch' && (
          <LaunchStep
            timeline={activeState.activeTimeline}
            startDate={activeState.startDate}
            currency={activeState.currency}
            metrics={metrics}
            onUpdateStartDate={(startDate) =>
              updateActiveState((prev) => ({ ...prev, startDate }))
            }
            onUpdateAction={handleUpdateAction}
            onGoToFocusStep={() => handleSetStep('focus')}
          />
        )}
      </main>

      <FearSettingModal
        isOpen={isFearOpen}
        data={activeState.fearSetting}
        onChange={handleUpdateFearSetting}
        onClose={() => setIsFearOpen(false)}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <ExportModal
        isOpen={isExportOpen}
        state={activeState}
        isSamplePreview={isSamplePreview}
        onImportState={(next) => {
          setIsSamplePreview(false);
          setUserState(next);
        }}
        onResetState={() => setUserState(createInitialState())}
        onClose={() => setIsExportOpen(false)}
      />

      <PrintWorksheet state={activeState} />
    </div>
  );
}

export default App;
