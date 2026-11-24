import { describe, expect, it } from 'vitest';
import {
  calculateMonthlyLoanPayment,
  calculateTimelineMetrics,
  getBaselineExpenses,
  getDreamMonthlyCost,
  getTimelineCountdown,
} from './calculations';
import { createDreamItem, createInitialState, createTimFerrissSampleState } from './defaults';

describe('Dreamline Calculations Engine', () => {
  it('computes 0% APR financing without NaN or division errors', () => {
    const monthly = calculateMonthlyLoanPayment({
      totalPrice: 12000,
      downPayment: 2000,
      months: 10,
      annualRatePct: 0,
    });
    expect(monthly).toBeCloseTo(1000, 5);
  });

  it('computes amortized monthly payment accurately for interest-bearing loans', () => {
    const monthly = calculateMonthlyLoanPayment({
      totalPrice: 136000,
      downPayment: 20000,
      months: 72,
      annualRatePct: 6.5,
    });
    // Principal 116,000 over 72 months at 6.5% APR ≈ $1,950.00
    expect(monthly).toBeGreaterThan(1945);
    expect(monthly).toBeLessThan(1955);
  });

  it('prorates one-time dream costs over 6m and 12m timelines', () => {
    const dream = createDreamItem('doing', 'Croatia Trip', {
      costType: 'one_time',
      amount: 2400,
    });
    expect(getDreamMonthlyCost(dream, '6m')).toBeCloseTo(400, 5);
    expect(getDreamMonthlyCost(dream, '12m')).toBeCloseTo(200, 5);
  });

  it('calculates exact TMI and TDI using 1.3x buffer formula', () => {
    const state = createInitialState();
    state.expenses.mode = 'quick';
    state.expenses.quickMonthly = 2000;
    state.expenses.bufferMultiplier = 1.3;
    state.income.currentMonthlyIncome = 3000;
    state.income.currentWeeklyHours = 40;
    state.income.targetWeeklyHours = 15;

    const dreams = [
      createDreamItem('having', 'VA', { isTopFour: true, costType: 'monthly', amount: 400 }),
      createDreamItem('being', 'Language', { isTopFour: true, costType: 'monthly', amount: 200 }),
      createDreamItem('doing', 'Trip', { isTopFour: true, costType: 'one_time', amount: 1800 }),
      // Extra non-top-4 item should not inflate TMI
      createDreamItem('having', 'Ignored', { isTopFour: false, costType: 'monthly', amount: 9999 }),
    ];

    const metrics = calculateTimelineMetrics(dreams, '6m', state.expenses, state.income);

    expect(metrics.topFourCount).toBe(3);
    expect(metrics.havingMonthly).toBeCloseTo(400, 5);
    expect(metrics.beingMonthly).toBeCloseTo(200, 5);
    expect(metrics.doingMonthly).toBeCloseTo(300, 5); // 1800 / 6
    expect(metrics.dreamsMonthlyTotal).toBeCloseTo(900, 5);
    expect(metrics.baselineMonthly).toBeCloseTo(2000, 5);
    expect(metrics.bufferedExpenses).toBeCloseTo(2600, 5);
    expect(metrics.tmi).toBeCloseTo(3500, 5);
    expect(metrics.tdi).toBeCloseTo(3500 / 30, 5);
    expect(metrics.monthlyGap).toBeCloseTo(500, 5);
    expect(metrics.isFunded).toBe(false);
    expect(metrics.targetRelativeHourly).toBeGreaterThan(metrics.currentRelativeHourly);
  });

  it('detects funded surplus when current monthly income exceeds TMI', () => {
    const state = createInitialState();
    state.expenses.quickMonthly = 1000;
    state.income.currentMonthlyIncome = 2500;
    const metrics = calculateTimelineMetrics([], '6m', state.expenses, state.income);
    expect(metrics.tmi).toBeCloseTo(1300, 5);
    expect(metrics.monthlyGap).toBeCloseTo(-1200, 5);
    expect(metrics.isFunded).toBe(true);
  });

  it('computes detailed expense trimming savings accurately', () => {
    const sample = createTimFerrissSampleState();
    const summary = getBaselineExpenses(sample.expenses);
    expect(summary.currentDetailedTotal).toBeGreaterThan(summary.trimmedDetailedTotal);
    expect(summary.monthlySavings).toBe(
      summary.currentDetailedTotal - summary.trimmedDetailedTotal,
    );
    expect(summary.baselineMonthly).toBe(summary.trimmedDetailedTotal);
  });

  it('computes valid metrics for Tim Ferriss Sample Dataset', () => {
    const sample = createTimFerrissSampleState();
    const metrics6m = calculateTimelineMetrics(
      sample.timelines['6m'].dreams,
      '6m',
      sample.expenses,
      sample.income,
    );
    const metrics12m = calculateTimelineMetrics(
      sample.timelines['12m'].dreams,
      '12m',
      sample.expenses,
      sample.income,
    );

    expect(metrics6m.topFourCount).toBe(4);
    expect(metrics12m.topFourCount).toBe(4);
    expect(metrics6m.tmi).toBeGreaterThan(5000);
    expect(metrics6m.tdi).toBeCloseTo(metrics6m.tmi / 30, 5);
    expect(metrics6m.actionStats.nextNowAction).not.toBeNull();
  });

  it('computes exact 6-month and 12-month countdown dates', () => {
    const start = '2026-01-15';
    const now = new Date(2026, 2, 15); // March 15, 2026
    const cd6 = getTimelineCountdown(start, '6m', now);
    const cd12 = getTimelineCountdown(start, '12m', now);

    expect(cd6.targetDate.getFullYear()).toBe(2026);
    expect(cd6.targetDate.getMonth()).toBe(6); // July
    expect(cd12.targetDate.getFullYear()).toBe(2027);
    expect(cd6.daysRemaining).toBeGreaterThan(0);
    expect(cd12.totalDays).toBeGreaterThan(cd6.totalDays);
  });
});
