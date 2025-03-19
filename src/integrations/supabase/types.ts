export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calculation_results: {
        Row: {
          ac_bill: Json
          ac_data: Json
          ac_total: number
          created_at: string | null
          date: string | null
          groups: Json | null
          id: string
          month: string | null
          office_bill: Json
          office_data: Json
          office_total: number
          user_id: string | null
        }
        Insert: {
          ac_bill: Json
          ac_data: Json
          ac_total: number
          created_at?: string | null
          date?: string | null
          groups?: Json | null
          id?: string
          month?: string | null
          office_bill: Json
          office_data: Json
          office_total: number
          user_id?: string | null
        }
        Update: {
          ac_bill?: Json
          ac_data?: Json
          ac_total?: number
          created_at?: string | null
          date?: string | null
          groups?: Json | null
          id?: string
          month?: string | null
          office_bill?: Json
          office_data?: Json
          office_total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string | null
          administrator: Json | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          administrator?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          administrator?: Json | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      consumption_groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      office_registry: {
        Row: {
          company_name: string
          consumption_id: string
          consumption_type: string
          contact_person: string | null
          created_at: string | null
          email: string | null
          group_id: string
          id: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_name: string
          consumption_id: string
          consumption_type: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          group_id: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string
          consumption_id?: string
          consumption_type?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          group_id?: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      thresholds: {
        Row: {
          active: boolean | null
          consumption_id: string
          consumption_type: string
          created_at: string | null
          id: string
          threshold_value: number
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          consumption_id: string
          consumption_type: string
          created_at?: string | null
          id?: string
          threshold_value: number
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          consumption_id?: string
          consumption_type?: string
          created_at?: string | null
          id?: string
          threshold_value?: number
          user_id?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
