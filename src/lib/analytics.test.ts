import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateMonthlyProjection,
  calculateMonthComparison,
  detectBudgetAlerts,
  detectBehaviorInsights,
  formatProjectionMessage,
  formatComparisonMessage,
  formatCurrency,
  type MonthlyProjection,
  type MonthComparison,
} from './analytics';
import type { Expense } from '../types/database';

describe('Analytics Module', () => {
  describe('Basic Functionality Tests', () => {
    it('should calculate projection with valid data', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          user_id: 'user1',
          description: 'Test',
          amount: 100,
          category: 'food',
          date: '2024-02-01',
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
        },
      ];
      const income = 3000;
      const currentDate = new Date('2024-02-15');

      const result = calculateMonthlyProjection(expenses, income, currentDate);

      expect(result).toBeDefined();
      expect(typeof result.projectedBalance).toBe('number');
      expect(typeof result.averageDailySpending).toBe('number');
      expect(typeof result.remainingDays).toBe('number');
    });

    it('should format projection message correctly', () => {
      const projection: MonthlyProjection = {
        projectedBalance: 2500,
        averageDailySpending: 100,
        remainingDays: 15,
        confidence: 'medium'
      };
      const message = formatProjectionMessage(projection);
      expect(message).toContain('Mantendo esse ritmo');
      expect(message).toContain('R$');
      expect(message).toContain('2.500,00');
    });

    it('should format comparison message for increase', () => {
      const comparison: MonthComparison = {
        currentTotal: 1000,
        previousTotal: 800,
        percentageChange: 25,
        isIncrease: true,
        categoryComparisons: []
      };
      const message = formatComparisonMessage(comparison);
      expect(message).toContain('a mais');
      expect(message).toContain('%');
    });

    it('should format comparison message for decrease', () => {
      const comparison: MonthComparison = {
        currentTotal: 800,
        previousTotal: 1000,
        percentageChange: -20,
        isIncrease: false,
        categoryComparisons: []
      };
      const message = formatComparisonMessage(comparison);
      expect(message).toContain('a menos');
      expect(message).toContain('%');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: predictive-analytics, Property 1: Monthly projection calculation accuracy
     * For any set of expenses, income amount, current date, and month boundaries,
     * the calculated monthly projection should equal:
     * current_balance - (total_expenses / days_elapsed * days_remaining)
     */
    it('Property 1: Monthly projection calculation accuracy', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              user_id: fc.uuid(),
              description: fc.string({ minLength: 1, maxLength: 50 }),
              amount: fc.double({ min: 0.01, max: 10000, noNaN: true }),
              category: fc.constantFrom('food', 'transport', 'entertainment', 'health'),
              date: fc.date({ min: new Date('2024-02-01'), max: new Date('2024-02-28') }).map((d) => d.toISOString().split('T')[0]),
              created_at: fc.constant('2024-02-01'),
              updated_at: fc.constant('2024-02-01'),
            }),
            { minLength: 1 } // Ensure at least one expense
          ),
          fc.double({ min: 1000, max: 50000, noNaN: true }),
          fc.date({ min: new Date('2024-02-04'), max: new Date('2024-02-28') }), // Start from day 4 to ensure we have expenses before current date
          (expenses, income, currentDate) => {
            // Ensure at least one expense is before the current date
            const expensesBeforeCurrentDate = expenses.filter(e => new Date(e.date) < currentDate);
            fc.pre(expensesBeforeCurrentDate.length > 0);
            
            // Calculate current balance (income minus all expenses so far)
            const totalExpenses = expensesBeforeCurrentDate.reduce((sum, exp) => sum + exp.amount, 0);
            const currentBalance = income - totalExpenses;
            
            const result = calculateMonthlyProjection(expenses, currentBalance, currentDate);

            // Should not be null since we have expenses before current date and >= 3 days elapsed
            expect(result).not.toBeNull();
            
            if (result) {
              // Calculate expected values manually
              const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
              const daysElapsed = currentDate.getDate();
              const daysRemaining = daysInMonth - daysElapsed;
              const avgDailySpending = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
              const expectedProjection = currentBalance - avgDailySpending * daysRemaining;

              // Allow small floating point differences
              expect(Math.abs(result.projectedBalance - expectedProjection)).toBeLessThan(0.01);
              expect(Math.abs(result.averageDailySpending - avgDailySpending)).toBeLessThan(0.01);
              expect(result.remainingDays).toBe(daysRemaining);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: predictive-analytics, Property 2: Projection message format
     * For any calculated projection value, the displayed message should contain
     * the text "Mantendo esse ritmo, seu saldo final será de R$" followed by
     * the formatted projection amount
     */
    it('Property 2: Projection message format', () => {
      fc.assert(
        fc.property(fc.double({ min: -100000, max: 100000, noNaN: true }), (projectedBalance) => {
          const projection: MonthlyProjection = {
            projectedBalance,
            averageDailySpending: 100,
            remainingDays: 10,
            confidence: 'medium'
          };
          const message = formatProjectionMessage(projection);

          expect(message).toContain('Mantendo esse ritmo');
          expect(message).toContain('seu saldo final será de');
          expect(message).toContain('R$');
          // Check that the formatted currency appears in the message (BRL format uses comma for decimals)
          const formattedCurrency = formatCurrency(projectedBalance);
          expect(message).toContain(formattedCurrency);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: predictive-analytics, Property 4: Month-over-month percentage calculation
     * For any two sets of expenses from different months, the percentage change
     * should equal: ((current_total - previous_total) / previous_total) * 100
     */
    it('Property 4: Month-over-month percentage calculation', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              user_id: fc.uuid(),
              description: fc.string({ minLength: 1, maxLength: 50 }),
              amount: fc.double({ min: 0.01, max: 10000, noNaN: true }),
              category: fc.constantFrom('food', 'transport', 'entertainment'),
              date: fc.constant('2024-02-01'),
              created_at: fc.constant('2024-02-01'),
              updated_at: fc.constant('2024-02-01'),
            })
          ),
          fc.array(
            fc.record({
              id: fc.uuid(),
              user_id: fc.uuid(),
              description: fc.string({ minLength: 1, maxLength: 50 }),
              amount: fc.double({ min: 0.01, max: 10000, noNaN: true }),
              category: fc.constantFrom('food', 'transport', 'entertainment'),
              date: fc.constant('2024-01-01'),
              created_at: fc.constant('2024-01-01'),
              updated_at: fc.constant('2024-01-01'),
            }),
            { minLength: 1 } // Ensure previous month has at least one expense
          ),
          (currentExpenses, previousExpenses) => {
            const result = calculateMonthComparison(currentExpenses, previousExpenses);

            const currentTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const expectedPercentage = ((currentTotal - previousTotal) / previousTotal) * 100;

            expect(Math.abs(result.percentageChange - expectedPercentage)).toBeLessThan(0.01);
            expect(result.currentTotal).toBeCloseTo(currentTotal, 2);
            expect(result.previousTotal).toBeCloseTo(previousTotal, 2);
            expect(result.isIncrease).toBe(currentTotal > previousTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: predictive-analytics, Property 5: Comparison message correctness
     * For any current and previous month totals where they differ, the message
     * should indicate "a mais" when current > previous and "a menos" when
     * current < previous, with the correct percentage value
     */
    it('Property 5: Comparison message correctness', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 100, max: 10000, noNaN: true }),
          fc.double({ min: 100, max: 10000, noNaN: true }),
          (currentTotal, previousTotal) => {
            // Skip when they're equal
            fc.pre(Math.abs(currentTotal - previousTotal) > 0.01);

            const percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
            const isIncrease = currentTotal > previousTotal;
            
            const comparison: MonthComparison = {
              currentTotal,
              previousTotal,
              percentageChange,
              isIncrease,
              categoryComparisons: []
            };
            
            const message = formatComparisonMessage(comparison);

            if (currentTotal > previousTotal) {
              expect(message).toContain('a mais');
            } else {
              expect(message).toContain('a menos');
            }

            expect(message).toContain('%');
            expect(message).toContain('mês passado');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
