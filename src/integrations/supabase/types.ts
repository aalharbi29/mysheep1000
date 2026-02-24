export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          age_category: string | null
          birth_date: string | null
          birth_records: Json
          breed: string
          category: string
          color: string
          confirmed: boolean | null
          created_at: string
          death_date: string | null
          father_number: number | null
          gender: string
          id: string
          image: string | null
          mother_breed: string | null
          mother_number: number | null
          notes: string | null
          number: number
          status: string | null
          sub_category: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_category?: string | null
          birth_date?: string | null
          birth_records?: Json
          breed: string
          category: string
          color?: string
          confirmed?: boolean | null
          created_at?: string
          death_date?: string | null
          father_number?: number | null
          gender: string
          id: string
          image?: string | null
          mother_breed?: string | null
          mother_number?: number | null
          notes?: string | null
          number: number
          status?: string | null
          sub_category: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age_category?: string | null
          birth_date?: string | null
          birth_records?: Json
          breed?: string
          category?: string
          color?: string
          confirmed?: boolean | null
          created_at?: string
          death_date?: string | null
          father_number?: number | null
          gender?: string
          id?: string
          image?: string | null
          mother_breed?: string | null
          mother_number?: number | null
          notes?: string | null
          number?: number
          status?: string | null
          sub_category?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          items: Json | null
          sub_category: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          date: string
          description: string
          id: string
          items?: Json | null
          sub_category?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          items?: Json | null
          sub_category?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          quantity: number
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date: string
          description: string
          id: string
          quantity?: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          amount_paid: number
          animal_breed: string | null
          animal_gender: string | null
          animal_id: string | null
          animal_number: number | null
          animal_sub_category: string | null
          buyer: string | null
          created_at: string
          date: string
          description: string
          id: string
          last_reminder_date: string | null
          payment_type: string
          quantity: number
          remaining: number
          user_id: string
        }
        Insert: {
          amount?: number
          amount_paid?: number
          animal_breed?: string | null
          animal_gender?: string | null
          animal_id?: string | null
          animal_number?: number | null
          animal_sub_category?: string | null
          buyer?: string | null
          created_at?: string
          date: string
          description: string
          id: string
          last_reminder_date?: string | null
          payment_type?: string
          quantity?: number
          remaining?: number
          user_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          animal_breed?: string | null
          animal_gender?: string | null
          animal_id?: string | null
          animal_number?: number | null
          animal_sub_category?: string | null
          buyer?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          last_reminder_date?: string | null
          payment_type?: string
          quantity?: number
          remaining?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
