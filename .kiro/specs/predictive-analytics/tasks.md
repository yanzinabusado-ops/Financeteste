# Implementation Plan

- [x] 1. Create database migration for analytics tables




  - Create migration file for category_budgets and dismissed_insights tables
  - Add RLS policies for both tables
  - Create indexes for performance optimization
  - _Requirements: 3.2, 5.5_

- [x] 2. Implement core analytics service module





  - [x] 2.1 Create analytics.ts service file with TypeScript interfaces


    - Define MonthlyProjection, MonthComparison, BudgetAlert, and BehaviorInsight interfaces
    - Define helper types for ExpenseAggregation, TimePeriod, and BudgetStatus
    - _Requirements: 1.1, 2.1, 3.3, 4.1_

  - [x] 2.2 Implement monthly projection calculation function


    - Calculate average daily spending from expense data
    - Compute remaining days in current month
    - Apply projection formula: current_balance - (avg_daily_spending * remaining_days)
    - Handle edge case for insufficient data (< 3 days)
    - _Requirements: 1.1, 1.5_

  - [ ]* 2.3 Write property test for monthly projection calculation
    - **Property 1: Monthly projection calculation accuracy**
    - **Validates: Requirements 1.1, 1.5**

  - [ ]* 2.4 Write property test for projection recalculation
    - **Property 3: Projection recalculation on expense changes**
    - **Validates: Requirements 1.4**

  - [x] 2.5 Implement month-over-month comparison function


    - Calculate total spending for current and previous months
    - Compute percentage change between periods
    - Generate category-level comparisons
    - Handle edge case when no previous month data exists
    - _Requirements: 2.1, 2.5_

  - [ ]* 2.6 Write property test for comparison calculations
    - **Property 4: Month-over-month percentage calculation**
    - **Property 6: Category-level comparison accuracy**
    - **Validates: Requirements 2.1, 2.5**

  - [x] 2.7 Implement budget alert detection function


    - Check spending against budget limits for each category
    - Generate warning alerts at 80% threshold
    - Generate critical alerts at 100% threshold
    - Return array of BudgetAlert objects
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 2.8 Write property test for budget threshold alerts
    - **Property 8: Budget threshold alerts**
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [x] 2.9 Implement behavioral insight detection functions


    - Create recurring expense detector (3+ similar expenses at regular intervals)
    - Create dominant category detector (>40% of total spending)
    - Create spending consistency detector (variance < 20% of mean)
    - Create spending spike detector (expense > 2x average)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 2.10 Write property tests for insight detection
    - **Property 10: Recurring expense detection**
    - **Property 11: Dominant category detection**
    - **Property 12: Spending consistency detection**
    - **Property 13: Spending spike detection**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [x] 2.11 Implement insight prioritization and filtering


    - Sort insights by priority (critical > warning > info)
    - Limit output to maximum 3 insights
    - Validate message length (max 100 characters)
    - Filter out dismissed insights within 24-hour window
    - _Requirements: 4.5, 5.1, 5.4, 5.5_

  - [ ]* 2.12 Write property tests for insight constraints
    - **Property 14: Insight count limit**
    - **Property 15: Insight message length constraint**
    - **Property 16: Insight priority ordering**
    - **Validates: Requirements 4.5, 5.1, 5.4**

- [x] 3. Implement message formatting utilities





  - [x] 3.1 Create message formatter for projection results


    - Format message: "Mantendo esse ritmo, seu saldo final será de R$ X"
    - Handle currency formatting with BRL conventions
    - Handle insufficient data message
    - _Requirements: 1.2, 1.3_

  - [ ]* 3.2 Write property test for projection message format
    - **Property 2: Projection message format**
    - **Validates: Requirements 1.2**

  - [x] 3.3 Create message formatter for comparison results

    - Format increase message: "Você gastou X% a mais que no mês passado"
    - Format decrease message: "Você gastou X% a menos que no mês passado"
    - Handle percentage formatting
    - _Requirements: 2.2, 2.3_

  - [ ]* 3.4 Write property test for comparison message correctness
    - **Property 5: Comparison message correctness**
    - **Validates: Requirements 2.2, 2.3**

- [x] 4. Create database service functions for budgets




  - [x] 4.1 Implement budget CRUD operations


    - Create function to save category budget limit
    - Create function to fetch budget limits for user and month
    - Create function to update existing budget limit
    - Create function to delete budget limit
    - _Requirements: 3.1, 3.2_

  - [ ]* 4.2 Write property test for budget persistence
    - **Property 7: Budget limit persistence**
    - **Validates: Requirements 3.2**

  - [x] 4.3 Implement dismissed insights operations


    - Create function to save dismissed insight with 24-hour expiry
    - Create function to fetch active dismissed insights
    - Create cleanup function to remove expired dismissals
    - _Requirements: 5.5_

  - [ ]* 4.4 Write property test for dismissed insight cooldown
    - **Property 17: Dismissed insight cooldown**
    - **Validates: Requirements 5.5**

- [x] 5. Update database types



  - [x] 5.1 Extend database.ts with new table types

    - Add CategoryBudget interface to Database type
    - Add DismissedInsight interface to Database type
    - Export type aliases for new tables
    - _Requirements: 3.2, 5.5_

- [x] 6. Create MonthlyProjectionCard component





  - [x] 6.1 Build React component for projection display


    - Fetch current month expenses and income
    - Calculate projection using analytics service
    - Display projection message with formatted currency
    - Show spending rate and remaining days
    - Update in real-time when expenses change
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 6.2 Write unit tests for MonthlyProjectionCard
    - Test component renders with valid data
    - Test insufficient data message display
    - Test real-time update on expense change
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 7. Create ComparisonInsights component





  - [x] 7.1 Build React component for month comparison


    - Fetch current and previous month expenses
    - Calculate comparison using analytics service
    - Display overall comparison message
    - Show category-level comparison breakdown
    - Handle case when no previous data exists
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 7.2 Write unit tests for ComparisonInsights
    - Test component renders comparison correctly
    - Test increase/decrease message display
    - Test category breakdown rendering
    - Test no previous data handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

-

- [x] 8. Create BudgetManager component


  - [x] 8.1 Build React component for budget management


    - Create form interface for setting category budgets
    - Implement save functionality using database service
    - Display current budget limits for all categories
    - Show visual progress bars for each category
    - Use color coding (green/yellow/red) based on percentage
    - _Requirements: 3.1, 3.2_

  - [ ]* 8.2 Write unit tests for BudgetManager
    - Test form submission and save
    - Test budget display rendering
    - Test progress bar calculations
    - Test color coding logic
    - _Requirements: 3.1, 3.2_

- [x] 9. Create BudgetAlerts component





  - [x] 9.1 Build React component for budget alerts


    - Fetch budget limits and current spending
    - Generate alerts using analytics service
    - Display warning alerts (80% threshold) with yellow styling
    - Display critical alerts (100% threshold) with red styling
    - Implement dismiss functionality with 24-hour cooldown
    - Use non-intrusive notification style
    - _Requirements: 3.3, 3.4, 3.5, 5.5_

  - [ ]* 9.2 Write unit tests for BudgetAlerts
    - Test alert generation at thresholds
    - Test alert styling and display
    - Test dismiss functionality
    - Test cooldown period enforcement
    - _Requirements: 3.3, 3.4, 3.5, 5.5_

- [x] 10. Create BehaviorInsights component




  - [x] 10.1 Build React component for behavioral insights


    - Fetch expense data for analysis
    - Generate insights using analytics service
    - Display maximum 3 prioritized insights
    - Use clear, concise messaging (max 100 chars)
    - Implement dismiss functionality
    - Style insights based on type (warning/info/success)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.4, 5.5_

  - [ ]* 10.2 Write unit tests for BehaviorInsights
    - Test insight generation and display
    - Test 3-insight limit enforcement
    - Test message length validation
    - Test priority ordering
    - Test dismiss functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.4, 5.5_

- [x] 11. Integrate analytics components into Dashboard




  - [x] 11.1 Update Dashboard component layout

    - Import all new analytics components
    - Add MonthlyProjectionCard to summary section
    - Add ComparisonInsights below summary cards
    - Add BudgetManager as collapsible section
    - Add BudgetAlerts as floating notifications
    - Add BehaviorInsights in dedicated insights panel
    - Maintain existing layout structure
    - Ensure responsive design on mobile
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ]* 11.2 Write integration tests for Dashboard
    - Test all analytics components render correctly
    - Test data flow between components
    - Test layout preservation
    - Test responsive behavior
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 12. Implement performance optimizations




  - [x] 12.1 Add memoization to expensive calculations


    - Use React.useMemo for projection calculations
    - Use React.useMemo for comparison calculations
    - Use React.useMemo for insight generation
    - Cache previous month data fetches
    - _Requirements: 6.3_

  - [x] 12.2 Add debouncing for real-time updates


    - Debounce projection recalculation on rapid expense additions
    - Debounce insight regeneration
    - Use 300ms debounce delay
    - _Requirements: 6.3_

  - [ ]* 12.3 Write property test for calculation performance
    - **Property 18: Analytics calculation performance**
    - **Validates: Requirements 6.3**

- [x] 13. Add error handling and edge cases





  - [x] 13.1 Implement error boundaries for analytics components


    - Wrap analytics components in error boundaries
    - Display fallback UI on errors
    - Log errors for debugging
    - _Requirements: All_

  - [x] 13.2 Handle edge cases in calculations


    - Handle division by zero in percentage calculations
    - Handle empty expense arrays
    - Handle missing or null values
    - Handle future dates in expense data
    - Display appropriate fallback messages
    - _Requirements: All_

  - [ ]* 13.3 Write unit tests for error handling
    - Test error boundary behavior
    - Test edge case handling
    - Test fallback message display
    - _Requirements: All_

- [x] 14. Checkpoint - Ensure all tests pass






  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Update existing FinancialInsights component







  - [x] 15.1 Refactor to use new analytics service




    - Replace inline insight generation with analytics service calls
    - Integrate new behavioral insights
    - Maintain backward compatibility
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 16. Add accessibility features





  - [x] 16.1 Implement ARIA labels and semantic HTML

    - Add proper ARIA labels to all analytics components
    - Use semantic HTML elements
    - Add screen reader announcements for dynamic updates
    - Ensure keyboard navigation works for all interactive elements
    - _Requirements: 6.2_


  - [x] 16.2 Implement colorblind-friendly indicators

    - Add text indicators alongside color coding
    - Use patterns in addition to colors for progress bars
    - Test with colorblind simulation tools
    - _Requirements: 6.4_


- [ ] 17. Final checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.
