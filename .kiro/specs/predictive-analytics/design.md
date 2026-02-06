# Design Document: Predictive Analytics

## Overview

This design document outlines the implementation of predictive and comparative analytics features for the FinanceControl application. The system will provide users with intelligent financial insights including month-end projections, comparative analysis with previous periods, category-based budget management, and behavioral pattern detection. All features will integrate seamlessly with the existing React/TypeScript frontend and Supabase backend while maintaining the current UI/UX design.

## Architecture

### High-Level Architecture

The analytics system follows a layered architecture:

1. **Data Layer**: Supabase PostgreSQL database with new tables for budget limits and analytics metadata
2. **Service Layer**: TypeScript modules for calculations, projections, and insight generation
3. **Presentation Layer**: React components that display analytics data within the existing dashboard

### Component Interaction Flow

```
User Dashboard
    ↓
Analytics Components (React)
    ↓
Analytics Service Layer (TypeScript)
    ↓
Supabase Client
    ↓
PostgreSQL Database
```

### Key Design Principles

- **Non-intrusive**: Analytics features integrate into existing UI without disrupting current workflows
- **Performance-first**: All calculations performed client-side with cached results
- **Progressive enhancement**: Features degrade gracefully when insufficient data exists
- **Real-time updates**: Analytics recalculate immediately when expenses change

## Components and Interfaces

### 1. Database Schema Extensions

#### Category Budgets Table

```typescript
interface CategoryBudget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  month_year: string;
  created_at: string;
  updated_at: string;
}
```

#### Dismissed Insights Table

```typescript
interface DismissedInsight {
  id: string;
  user_id: string;
  insight_key: string;
  dismissed_at: string;
  expires_at: string;
}
```

### 2. Analytics Service Module

**File**: `src/lib/analytics.ts`

```typescript
interface MonthlyProjection {
  projectedBalance: number;
  averageDailySpending: number;
  remainingDays: number;
  confidence: 'low' | 'medium' | 'high';
}

interface MonthComparison {
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
  isIncrease: boolean;
  categoryComparisons: CategoryComparison[];
}

interface CategoryComparison {
  category: string;
  currentAmount: number;
  previousAmount: number;
  percentageChange: number;
}

interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  level: 'warning' | 'critical';
}

interface BehaviorInsight {
  type: 'recurring' | 'dominant_category' | 'spike' | 'consistent';
  message: string;
  priority: number;
}
```

### 3. React Components

#### MonthlyProjectionCard Component
- Displays projected month-end balance
- Shows spending rate and remaining days
- Updates in real-time as expenses change

#### ComparisonInsights Component
- Shows month-over-month comparison
- Displays category-level comparisons
- Highlights significant changes

#### BudgetManager Component
- Interface for setting category budgets
- Displays current spending vs limits
- Shows visual progress bars with color coding

#### BudgetAlerts Component
- Displays threshold alerts (80%, 100%)
- Non-intrusive notification style
- Dismissible with 24-hour cooldown

#### BehaviorInsights Component
- Shows up to 3 prioritized insights
- Actionable recommendations
- Clean, concise messaging

## Data Models

### Expense Aggregation Model

```typescript
interface ExpenseAggregation {
  totalAmount: number;
  count: number;
  averageAmount: number;
  categoryBreakdown: Map<string, number>;
  dailyAverage: number;
  weeklyAverage: number;
}
```

### Time Period Model

```typescript
interface TimePeriod {
  startDate: Date;
  endDate: Date;
  monthYear: string;
  daysInPeriod: number;
  daysElapsed: number;
  daysRemaining: number;
}
```

### Budget Status Model

```typescript
interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework analysis, the following consolidations were identified:

- Properties 1.1 and 1.5 both test the projection calculation formula - these can be combined into a single comprehensive property
- Properties 2.2 and 2.3 test message formatting for increase/decrease scenarios - these can be combined into one property that handles both cases
- Properties 3.3 and 3.4 test threshold alerts at different levels - these can be combined into a single property that validates all threshold levels
- Properties 4.1, 4.2, 4.3, and 4.4 all test insight detection - while distinct, they should be verified to ensure each provides unique validation value

All other properties provide unique validation and should be retained.

### Correctness Properties

Property 1: Monthly projection calculation accuracy
*For any* set of expenses, income amount, current date, and month boundaries, the calculated monthly projection should equal: current_balance - (total_expenses / days_elapsed * days_remaining)
**Validates: Requirements 1.1, 1.5**

Property 2: Projection message format
*For any* calculated projection value, the displayed message should contain the text "Mantendo esse ritmo, seu saldo final será de R$" followed by the formatted projection amount
**Validates: Requirements 1.2**

Property 3: Projection recalculation on expense changes
*For any* initial expense set and projection, adding or removing an expense should result in a different projection value that reflects the new spending rate
**Validates: Requirements 1.4**

Property 4: Month-over-month percentage calculation
*For any* two sets of expenses from different months, the percentage change should equal: ((current_total - previous_total) / previous_total) * 100
**Validates: Requirements 2.1**

Property 5: Comparison message correctness
*For any* current and previous month totals where they differ, the message should indicate "a mais" when current > previous and "a menos" when current < previous, with the correct percentage value
**Validates: Requirements 2.2, 2.3**

Property 6: Category-level comparison accuracy
*For any* two sets of categorized expenses, each category should have a comparison showing the percentage change between periods
**Validates: Requirements 2.5**

Property 7: Budget limit persistence
*For any* budget limit value set for a category, retrieving that budget limit from the database should return the same value
**Validates: Requirements 3.2**

Property 8: Budget threshold alerts
*For any* category with a budget limit and expense set, when spending reaches 80% of the limit a warning alert should be generated, and when reaching 100% a critical alert should be generated
**Validates: Requirements 3.3, 3.4, 3.5**

Property 9: Monthly budget reset invariant
*For any* set of budget limits, when transitioning to a new month, all budget limit values should remain unchanged while category spending totals reset to zero
**Validates: Requirements 3.6**

Property 10: Recurring expense detection
*For any* set of expenses containing at least 3 expenses in the same category with similar amounts (within 10% variance) occurring at regular intervals (within 3 days variance), the system should generate a recurring expense insight
**Validates: Requirements 4.1**

Property 11: Dominant category detection
*For any* expense set where a single category's total exceeds 40% of the overall total, the system should generate a dominant category insight
**Validates: Requirements 4.2**

Property 12: Spending consistency detection
*For any* expense set with daily spending variance below 20% of the mean, the system should generate a consistency insight
**Validates: Requirements 4.3**

Property 13: Spending spike detection
*For any* expense set containing at least one expense with amount greater than 2x the average expense amount, the system should generate a spike alert insight
**Validates: Requirements 4.4**

Property 14: Insight count limit
*For any* set of generated insights, the displayed insights should never exceed 3 items
**Validates: Requirements 4.5**

Property 15: Insight message length constraint
*For any* generated insight message, the character count should not exceed 100 characters
**Validates: Requirements 5.1**

Property 16: Insight priority ordering
*For any* set of insights with different priority levels (critical, warning, info), the output list should be ordered with critical alerts first, followed by warnings, then informational insights
**Validates: Requirements 5.4**

Property 17: Dismissed insight cooldown
*For any* insight that has been dismissed, querying for insights within 24 hours should not return that insight, but querying after 24 hours should include it again
**Validates: Requirements 5.5**

Property 18: Analytics calculation performance
*For any* valid expense dataset, all analytics calculations (projection, comparison, insights) should complete within 500ms
**Validates: Requirements 6.3**

## Error Handling

### Insufficient Data Scenarios

1. **Projection with < 3 days of data**: Display message "Dados insuficientes para projeção. Continue registrando suas despesas."
2. **No previous month data**: Skip comparison insights, show only current month analytics
3. **Empty expense list**: Display zero values with encouraging message to start tracking

### Invalid Data Handling

1. **Negative amounts**: Validate at input level, reject negative values
2. **Future dates**: Accept but exclude from current month calculations
3. **Missing categories**: Default to "other" category
4. **Null/undefined values**: Use zero as fallback for calculations

### Database Errors

1. **Failed budget save**: Show error toast, retain form data for retry
2. **Failed expense fetch**: Display cached data with warning banner
3. **Connection timeout**: Retry with exponential backoff, max 3 attempts

### Calculation Edge Cases

1. **Division by zero**: When previous month total is zero, show "Primeiro mês com dados" instead of percentage
2. **Infinite/NaN results**: Log error, display fallback message
3. **Very large numbers**: Format with K/M suffixes (e.g., "R$ 1.5K")

## Testing Strategy

### Unit Testing Approach

The implementation will use Vitest for unit testing with the following focus areas:

1. **Calculation Functions**: Test individual calculation functions (projection, percentage change, averages) with specific examples
2. **Edge Cases**: Test boundary conditions (zero values, single day data, month transitions)
3. **Message Formatting**: Test that messages are correctly formatted with proper Portuguese text
4. **Date Utilities**: Test date manipulation functions (month boundaries, day counting)

### Property-Based Testing Approach

The implementation will use fast-check (a property-based testing library for TypeScript) to verify universal properties across randomly generated inputs. Each property-based test will:

- Run a minimum of 100 iterations with random data
- Be tagged with a comment referencing the specific correctness property from this design document
- Use the format: `**Feature: predictive-analytics, Property {number}: {property_text}**`

**Property-Based Testing Library**: fast-check (https://github.com/dubzzz/fast-check)

**Test Configuration**:
```typescript
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // Property assertion
  }),
  { numRuns: 100 }
);
```

**Generator Strategy**:

1. **Expense Generator**: Generate random expenses with valid amounts, categories, and dates
2. **Date Range Generator**: Generate valid date ranges within month boundaries
3. **Budget Generator**: Generate budget limits with reasonable values (100-10000)
4. **Income Generator**: Generate income values that are realistic (1000-50000)

**Property Test Organization**:

- Each correctness property will have exactly one corresponding property-based test
- Tests will be co-located with implementation in `.test.ts` files
- Each test will explicitly reference its property number in a comment

### Integration Testing

1. **Component Integration**: Test that analytics components correctly consume service layer functions
2. **Database Integration**: Test that budget limits persist and retrieve correctly from Supabase
3. **Real-time Updates**: Test that UI updates when underlying data changes

### Testing Priority

1. **Critical Path**: Projection calculation, budget alerts, comparison calculations
2. **High Priority**: Insight generation, message formatting, threshold detection
3. **Medium Priority**: Edge case handling, error states, performance validation

## Implementation Notes

### Performance Optimizations

1. **Memoization**: Cache calculation results using React.useMemo
2. **Debouncing**: Debounce recalculations on rapid expense additions
3. **Lazy Loading**: Load previous month data only when needed for comparisons
4. **Index Usage**: Leverage database indexes on date and category columns

### Localization Considerations

- All messages are in Brazilian Portuguese
- Currency formatting uses BRL (R$) with proper decimal separators
- Date formatting follows Brazilian conventions (DD/MM/YYYY)

### Accessibility

- All insights use semantic HTML with proper ARIA labels
- Color coding includes text indicators for colorblind users
- Keyboard navigation supported for all interactive elements
- Screen reader announcements for dynamic content updates

### Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- Minimum: ES2020 support required
- Fallbacks: Graceful degradation for older browsers

## Migration Strategy

### Database Migration

Create new migration file: `supabase/migrations/[timestamp]_add_analytics_tables.sql`

```sql
-- Category budgets table
CREATE TABLE category_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  monthly_limit numeric NOT NULL CHECK (monthly_limit >= 0),
  month_year text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month_year)
);

-- Dismissed insights table
CREATE TABLE dismissed_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_key text NOT NULL,
  dismissed_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(user_id, insight_key)
);

-- Enable RLS
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dismissed_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own budgets"
  ON category_budgets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own dismissed insights"
  ON dismissed_insights FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX category_budgets_user_month_idx ON category_budgets(user_id, month_year);
CREATE INDEX dismissed_insights_user_idx ON dismissed_insights(user_id);
CREATE INDEX dismissed_insights_expires_idx ON dismissed_insights(expires_at);
```

### Rollout Plan

1. **Phase 1**: Deploy database migration
2. **Phase 2**: Deploy analytics service layer
3. **Phase 3**: Deploy UI components (feature-flagged)
4. **Phase 4**: Enable for all users
5. **Phase 5**: Monitor performance and user feedback

### Backward Compatibility

- All new features are additive, no breaking changes
- Existing components continue to function without analytics
- Analytics gracefully handle missing data from older accounts
