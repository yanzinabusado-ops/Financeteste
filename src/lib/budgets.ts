import { supabase } from './supabase';
import type { CategoryBudget, DismissedInsight } from '../types/database';
import type { Database } from '../types/database';

/**
 * Budget CRUD Operations
 * Requirements: 3.1, 3.2
 */

/**
 * Save a category budget limit for a user and month
 * If a budget already exists for the category/month, it will be updated
 */
export async function saveCategoryBudget(
  userId: string,
  category: string,
  monthYear: string,
  limitAmount: number
): Promise<CategoryBudget | null> {
  try {
    // Use upsert to handle both insert and update cases
    const insertData: Database['public']['Tables']['category_budgets']['Insert'] = {
      user_id: userId,
      category,
      month_year: monthYear,
      limit_amount: limitAmount,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase
      .from('category_budgets') as any)
      .upsert(insertData, {
        onConflict: 'user_id,month_year,category',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving category budget:', error);
      return null;
    }

    return data as CategoryBudget;
  } catch (err) {
    console.error('Unexpected error saving category budget:', err);
    return null;
  }
}

/**
 * Delete a category budget limit
 * Used when user wants to remove a budget limit
 */
export async function deleteCategoryBudget(
  userId: string,
  category: string,
  monthYear: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('category_budgets')
      .delete()
      .eq('user_id', userId)
      .eq('category', category)
      .eq('month_year', monthYear);

    if (error) {
      console.error('Error deleting category budget:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting category budget:', err);
    return false;
  }
}

/**
 * Fetch all budget limits for a user and specific month
 */
export async function fetchBudgetLimits(
  userId: string,
  monthYear: string
): Promise<CategoryBudget[]> {
  try {
    const { data, error } = await (supabase
      .from('category_budgets') as any)
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching budget limits:', error);
      return [];
    }

    return (data || []) as CategoryBudget[];
  } catch (err) {
    console.error('Unexpected error fetching budget limits:', err);
    return [];
  }
}

/**
 * Update an existing budget limit
 */
export async function updateCategoryBudget(
  budgetId: string,
  limitAmount: number
): Promise<CategoryBudget | null> {
  try {
    const updateData: Database['public']['Tables']['category_budgets']['Update'] = {
      limit_amount: limitAmount,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase
      .from('category_budgets') as any)
      .update(updateData)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating category budget:', error);
      return null;
    }

    return data as CategoryBudget;
  } catch (err) {
    console.error('Unexpected error updating category budget:', err);
    return null;
  }
}

/**
 * Dismissed Insights Operations
 * Requirements: 5.5
 */

/**
 * Save a dismissed insight with 24-hour expiry
 * If the insight was already dismissed, it updates the expiry time
 */
export async function dismissInsight(
  userId: string,
  insightKey: string
): Promise<DismissedInsight | null> {
  try {
    const dismissedAt = new Date();
    const expiresAt = new Date(dismissedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const insertData: Database['public']['Tables']['dismissed_insights']['Insert'] = {
      user_id: userId,
      insight_key: insightKey,
      dismissed_at: dismissedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    const { data, error } = await (supabase
      .from('dismissed_insights') as any)
      .upsert(insertData, {
        onConflict: 'user_id,insight_key',
      })
      .select()
      .single();

    if (error) {
      console.error('Error dismissing insight:', error);
      return null;
    }

    return data as DismissedInsight;
  } catch (err) {
    console.error('Unexpected error dismissing insight:', err);
    return null;
  }
}

/**
 * Fetch active (non-expired) dismissed insights for a user
 * Only returns insights that haven't expired yet
 */
export async function fetchActiveDismissedInsights(
  userId: string
): Promise<DismissedInsight[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await (supabase
      .from('dismissed_insights') as any)
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', now); // Only get insights that haven't expired

    if (error) {
      console.error('Error fetching dismissed insights:', error);
      return [];
    }

    return (data || []) as DismissedInsight[];
  } catch (err) {
    console.error('Unexpected error fetching dismissed insights:', err);
    return [];
  }
}

/**
 * Check if a specific insight is currently dismissed for a user
 */
export async function isInsightDismissed(
  userId: string,
  insightKey: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await (supabase
      .from('dismissed_insights') as any)
      .select('id')
      .eq('user_id', userId)
      .eq('insight_key', insightKey)
      .gt('expires_at', now)
      .maybeSingle();

    if (error) {
      console.error('Error checking dismissed insight:', error);
      return false;
    }

    return data !== null;
  } catch (err) {
    console.error('Unexpected error checking dismissed insight:', err);
    return false;
  }
}

/**
 * Cleanup expired dismissed insights
 * This should be called periodically to remove old records
 */
export async function cleanupExpiredDismissals(): Promise<number> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await (supabase
      .from('dismissed_insights') as any)
      .delete()
      .lt('expires_at', now)
      .select('id');

    if (error) {
      console.error('Error cleaning up expired dismissals:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    console.error('Unexpected error cleaning up expired dismissals:', err);
    return 0;
  }
}
