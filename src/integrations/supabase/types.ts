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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bond_market_metrics: {
        Row: {
          average_convexity: number | null
          average_duration_years: number | null
          average_spread_bps: number | null
          beta_vs_usd: number | null
          created_at: string
          id: string
          last_updated: string
        }
        Insert: {
          average_convexity?: number | null
          average_duration_years?: number | null
          average_spread_bps?: number | null
          beta_vs_usd?: number | null
          created_at?: string
          id?: string
          last_updated?: string
        }
        Update: {
          average_convexity?: number | null
          average_duration_years?: number | null
          average_spread_bps?: number | null
          beta_vs_usd?: number | null
          created_at?: string
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      cash_flows: {
        Row: {
          amortization: number | null
          coupon_rate: number | null
          created_at: string
          flow_date: string
          id: string
          instrument_id: string
          updated_at: string
        }
        Insert: {
          amortization?: number | null
          coupon_rate?: number | null
          created_at?: string
          flow_date: string
          id?: string
          instrument_id: string
          updated_at?: string
        }
        Update: {
          amortization?: number | null
          coupon_rate?: number | null
          created_at?: string
          flow_date?: string
          id?: string
          instrument_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flows_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      cedear_prices: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          pct_change: number | null
          px_ask: number | null
          px_bid: number | null
          px_close: number | null
          px_mid: number | null
          symbol: string
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pct_change?: number | null
          px_ask?: number | null
          px_bid?: number | null
          px_close?: number | null
          px_mid?: number | null
          symbol: string
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pct_change?: number | null
          px_ask?: number | null
          px_bid?: number | null
          px_close?: number | null
          px_mid?: number | null
          symbol?: string
          volume?: number | null
        }
        Relationships: []
      }
      current_prices: {
        Row: {
          precio_ars: number
          ticker: string
          updated_at: string
          usd_rate: number
        }
        Insert: {
          precio_ars: number
          ticker: string
          updated_at?: string
          usd_rate: number
        }
        Update: {
          precio_ars?: number
          ticker?: string
          updated_at?: string
          usd_rate?: number
        }
        Relationships: []
      }
      game_results: {
        Row: {
          alias: string | null
          correct_answers: number | null
          created_at: string
          email: string
          final_capital: number
          id: string
          time_used: number
          total_questions: number | null
        }
        Insert: {
          alias?: string | null
          correct_answers?: number | null
          created_at?: string
          email: string
          final_capital: number
          id?: string
          time_used: number
          total_questions?: number | null
        }
        Update: {
          alias?: string | null
          correct_answers?: number | null
          created_at?: string
          email?: string
          final_capital?: number
          id?: string
          time_used?: number
          total_questions?: number | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          adjustment: Database["public"]["Enums"]["adjustment_type"] | null
          amortization: Database["public"]["Enums"]["amortization_type"] | null
          coupon_frequency:
            | Database["public"]["Enums"]["coupon_frequency"]
            | null
          created_at: string
          currency: string | null
          day_count_basis: Database["public"]["Enums"]["day_count_basis"] | null
          face_value: number | null
          id: string
          instrument_type: Database["public"]["Enums"]["instrument_type"]
          issuer: Database["public"]["Enums"]["issuer_type"]
          law: Database["public"]["Enums"]["law_type"] | null
          maturity_date: string | null
          rating: Database["public"]["Enums"]["rating_type"] | null
          ticker: string
          ticker_mep: string | null
          updated_at: string
        }
        Insert: {
          adjustment?: Database["public"]["Enums"]["adjustment_type"] | null
          amortization?: Database["public"]["Enums"]["amortization_type"] | null
          coupon_frequency?:
            | Database["public"]["Enums"]["coupon_frequency"]
            | null
          created_at?: string
          currency?: string | null
          day_count_basis?:
            | Database["public"]["Enums"]["day_count_basis"]
            | null
          face_value?: number | null
          id?: string
          instrument_type: Database["public"]["Enums"]["instrument_type"]
          issuer: Database["public"]["Enums"]["issuer_type"]
          law?: Database["public"]["Enums"]["law_type"] | null
          maturity_date?: string | null
          rating?: Database["public"]["Enums"]["rating_type"] | null
          ticker: string
          ticker_mep?: string | null
          updated_at?: string
        }
        Update: {
          adjustment?: Database["public"]["Enums"]["adjustment_type"] | null
          amortization?: Database["public"]["Enums"]["amortization_type"] | null
          coupon_frequency?:
            | Database["public"]["Enums"]["coupon_frequency"]
            | null
          created_at?: string
          currency?: string | null
          day_count_basis?:
            | Database["public"]["Enums"]["day_count_basis"]
            | null
          face_value?: number | null
          id?: string
          instrument_type?: Database["public"]["Enums"]["instrument_type"]
          issuer?: Database["public"]["Enums"]["issuer_type"]
          law?: Database["public"]["Enums"]["law_type"] | null
          maturity_date?: string | null
          rating?: Database["public"]["Enums"]["rating_type"] | null
          ticker?: string
          ticker_mep?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          email_error: string | null
          email_sent: boolean
          id: string
          inversion_estimada: string | null
          mensaje: string | null
          nombre: string
          proyecto: string | null
          telefono: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_error?: string | null
          email_sent?: boolean
          id?: string
          inversion_estimada?: string | null
          mensaje?: string | null
          nombre: string
          proyecto?: string | null
          telefono: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_error?: string | null
          email_sent?: boolean
          id?: string
          inversion_estimada?: string | null
          mensaje?: string | null
          nombre?: string
          proyecto?: string | null
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          close_price: number | null
          convexity: number | null
          created_at: string
          duration: number | null
          id: string
          is_stale: boolean | null
          pct_change: number | null
          px_ask: number | null
          px_bid: number | null
          q_ask: number | null
          q_bid: number | null
          q_op: number | null
          spread_bps: number | null
          symbol: string
          timestamp: string
          volume: number | null
          yield: number | null
        }
        Insert: {
          close_price?: number | null
          convexity?: number | null
          created_at?: string
          duration?: number | null
          id?: string
          is_stale?: boolean | null
          pct_change?: number | null
          px_ask?: number | null
          px_bid?: number | null
          q_ask?: number | null
          q_bid?: number | null
          q_op?: number | null
          spread_bps?: number | null
          symbol: string
          timestamp?: string
          volume?: number | null
          yield?: number | null
        }
        Update: {
          close_price?: number | null
          convexity?: number | null
          created_at?: string
          duration?: number | null
          id?: string
          is_stale?: boolean | null
          pct_change?: number | null
          px_ask?: number | null
          px_bid?: number | null
          q_ask?: number | null
          q_bid?: number | null
          q_op?: number | null
          spread_bps?: number | null
          symbol?: string
          timestamp?: string
          volume?: number | null
          yield?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          cantidad: number
          cantidad_acciones_reales: number
          created_at: string
          dias_tenencia: number | null
          fecha: string
          id: string
          precio_accion_usd: number
          precio_ars: number
          ticker: string
          tipo: string
          total_ars: number
          total_usd: number
          updated_at: string
          usd_por_cedear: number
          usd_rate_historico: number
          user_id: string
        }
        Insert: {
          cantidad: number
          cantidad_acciones_reales: number
          created_at?: string
          dias_tenencia?: number | null
          fecha: string
          id?: string
          precio_accion_usd: number
          precio_ars: number
          ticker: string
          tipo: string
          total_ars: number
          total_usd: number
          updated_at?: string
          usd_por_cedear: number
          usd_rate_historico: number
          user_id: string
        }
        Update: {
          cantidad?: number
          cantidad_acciones_reales?: number
          created_at?: string
          dias_tenencia?: number | null
          fecha?: string
          id?: string
          precio_accion_usd?: number
          precio_ars?: number
          ticker?: string
          tipo?: string
          total_ars?: number
          total_usd?: number
          updated_at?: string
          usd_por_cedear?: number
          usd_rate_historico?: number
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          preferences: Json | null
          settlement_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Json | null
          settlement_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json | null
          settlement_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      latest_bond_prices: {
        Row: {
          convexity: number | null
          created_at: string | null
          duration: number | null
          id: string | null
          is_stale: boolean | null
          last_updated: string | null
          pct_change: number | null
          px_ask: number | null
          px_bid: number | null
          px_close: number | null
          px_mid: number | null
          spread_bps: number | null
          symbol: string | null
          volume: number | null
          yield: number | null
        }
        Relationships: []
      }
      latest_cedear_prices: {
        Row: {
          created_at: string | null
          id: string | null
          last_updated: string | null
          pct_change: number | null
          px_ask: number | null
          px_bid: number | null
          px_close: number | null
          px_mid: number | null
          symbol: string | null
          volume: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      adjustment_type:
        | "Hard dollar"
        | "Dólar Linked"
        | "CER"
        | "Badlar"
        | "Tasa fija"
      amortization_type: "Bullet" | "Cuotas semestrales" | "Cuotas anuales"
      coupon_frequency: "Mensual" | "Trimestral" | "Semestral" | "Anual"
      day_count_basis: "30/360" | "Real/365" | "Real/360" | "Europa 30/360"
      instrument_type: "Bono" | "Letre" | "Nota" | "ON"
      issuer_type:
        | "Republica Argentina"
        | "Provincia Buenos Aires"
        | "CABA"
        | "Corporativo"
      law_type: "Argentina" | "New York" | "Inglaterra"
      rating_type:
        | "AAA"
        | "AA+"
        | "AA"
        | "AA-"
        | "A+"
        | "A"
        | "A-"
        | "BBB+"
        | "BBB"
        | "BBB-"
        | "BB+"
        | "BB"
        | "BB-"
        | "B+"
        | "B"
        | "B-"
        | "CCC"
        | "CC"
        | "C"
        | "D"
        | "NR"
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
    Enums: {
      adjustment_type: [
        "Hard dollar",
        "Dólar Linked",
        "CER",
        "Badlar",
        "Tasa fija",
      ],
      amortization_type: ["Bullet", "Cuotas semestrales", "Cuotas anuales"],
      coupon_frequency: ["Mensual", "Trimestral", "Semestral", "Anual"],
      day_count_basis: ["30/360", "Real/365", "Real/360", "Europa 30/360"],
      instrument_type: ["Bono", "Letre", "Nota", "ON"],
      issuer_type: [
        "Republica Argentina",
        "Provincia Buenos Aires",
        "CABA",
        "Corporativo",
      ],
      law_type: ["Argentina", "New York", "Inglaterra"],
      rating_type: [
        "AAA",
        "AA+",
        "AA",
        "AA-",
        "A+",
        "A",
        "A-",
        "BBB+",
        "BBB",
        "BBB-",
        "BB+",
        "BB",
        "BB-",
        "B+",
        "B",
        "B-",
        "CCC",
        "CC",
        "C",
        "D",
        "NR",
      ],
    },
  },
} as const
