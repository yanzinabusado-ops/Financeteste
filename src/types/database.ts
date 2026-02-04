export interface Database {
  public: {
    Tables: {
      income: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          month_year: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          month_year: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          month_year?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Income = Database['public']['Tables']['income']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
