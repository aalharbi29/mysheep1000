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
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          participant1: string
          participant2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          participant1: string
          participant2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          participant1?: string
          participant2?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
        ]
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
      listing_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          listing_id: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_comments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      market_listings: {
        Row: {
          animal_type: string | null
          breed: string | null
          category: string
          condition: string | null
          contact_number: string | null
          created_at: string
          description: string | null
          details: Json | null
          gender: string | null
          id: string
          kids_age: string | null
          kids_count: number | null
          listing_type: string
          location: string | null
          media_urls: Json | null
          price: number | null
          quantity: number | null
          rams_count: number | null
          status: string
          teeth: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_type?: string | null
          breed?: string | null
          category?: string
          condition?: string | null
          contact_number?: string | null
          created_at?: string
          description?: string | null
          details?: Json | null
          gender?: string | null
          id?: string
          kids_age?: string | null
          kids_count?: number | null
          listing_type?: string
          location?: string | null
          media_urls?: Json | null
          price?: number | null
          quantity?: number | null
          rams_count?: number | null
          status?: string
          teeth?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_type?: string | null
          breed?: string | null
          category?: string
          condition?: string | null
          contact_number?: string | null
          created_at?: string
          description?: string | null
          details?: Json | null
          gender?: string | null
          id?: string
          kids_age?: string | null
          kids_count?: number | null
          listing_type?: string
          location?: string | null
          media_urls?: Json | null
          price?: number | null
          quantity?: number | null
          rams_count?: number | null
          status?: string
          teeth?: string | null
          title?: string | null
          updated_at?: string
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
      vaccinations: {
        Row: {
          animal_id: string
          animal_number: number
          created_at: string
          first_dose_date: string
          id: string
          is_deworming: boolean
          notes: string | null
          repeat_confirmed: boolean
          repeat_date: string | null
          second_dose_confirmed: boolean
          second_dose_date: string | null
          user_id: string
          vaccination_type: string
        }
        Insert: {
          animal_id: string
          animal_number: number
          created_at?: string
          first_dose_date: string
          id?: string
          is_deworming?: boolean
          notes?: string | null
          repeat_confirmed?: boolean
          repeat_date?: string | null
          second_dose_confirmed?: boolean
          second_dose_date?: string | null
          user_id: string
          vaccination_type: string
        }
        Update: {
          animal_id?: string
          animal_number?: number
          created_at?: string
          first_dose_date?: string
          id?: string
          is_deworming?: boolean
          notes?: string | null
          repeat_confirmed?: boolean
          repeat_date?: string | null
          second_dose_confirmed?: boolean
          second_dose_date?: string | null
          user_id?: string
          vaccination_type?: string
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
