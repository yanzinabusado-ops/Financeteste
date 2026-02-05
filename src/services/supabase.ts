import { supabase } from '../lib/supabase';
import type { Expense, Income } from '../types/database';

export interface SupabaseError {
  message: string;
  code?: string;
}

export const expenseService = {
  async getByMonth(userId: string, date: string) {
    const startDate = `${date}-01`;
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1))
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};

export const incomeService = {
  async getByMonth(userId: string, monthYear: string) {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data || null;
  },

  async create(income: Omit<Income, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('income')
      .insert([income])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: Partial<Omit<Income, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('income')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const categoryBudgetService = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('category_budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getByMonthAndUser(userId: string, monthYear: string) {
    const { data, error } = await supabase
      .from('category_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async upsert(
    userId: string,
    monthYear: string,
    category: string,
    limit: number
  ) {
    const { data, error } = await supabase
      .from('category_budgets')
      .upsert(
        {
          user_id: userId,
          month_year: monthYear,
          category,
          limit_amount: limit,
        },
        {
          onConflict: 'user_id,month_year,category',
        }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('category_budgets')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};

export const formatError = (error: unknown): SupabaseError => {
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  return {
    message: 'Erro ao processar requisição',
  };
};
