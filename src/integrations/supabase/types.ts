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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ads_management: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          position: string
          target_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          position?: string
          target_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          position?: string
          target_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      cleanup_jobs: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          last_error: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          last_error?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversion_logs: {
        Row: {
          created_at: string
          file_size_kb: number
          from_format: string
          id: string
          to_format: string
          user_email: string | null
        }
        Insert: {
          created_at?: string
          file_size_kb: number
          from_format: string
          id?: string
          to_format: string
          user_email?: string | null
        }
        Update: {
          created_at?: string
          file_size_kb?: number
          from_format?: string
          id?: string
          to_format?: string
          user_email?: string | null
        }
        Relationships: []
      }
      conversions: {
        Row: {
          converted_url: string | null
          created_at: string
          file_size_bytes: number | null
          id: string
          original_filename: string
          original_format: string
          status: string
          target_format: string
          transaction_id: string | null
          user_email: string | null
        }
        Insert: {
          converted_url?: string | null
          created_at?: string
          file_size_bytes?: number | null
          id?: string
          original_filename: string
          original_format: string
          status?: string
          target_format: string
          transaction_id?: string | null
          user_email?: string | null
        }
        Update: {
          converted_url?: string | null
          created_at?: string
          file_size_bytes?: number | null
          id?: string
          original_filename?: string
          original_format?: string
          status?: string
          target_format?: string
          transaction_id?: string | null
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_size_bytes: number | null
          file_type: string
          filename: string
          id: string
          storage_path: string | null
          thumbnail_url: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          created_at?: string
          file_size_bytes?: number | null
          file_type: string
          filename: string
          id?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string
          filename?: string
          id?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          original_filename: string
          progress: number
          result_url: string | null
          status: string
          target_format: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          original_filename: string
          progress?: number
          result_url?: string | null
          status?: string
          target_format: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          original_filename?: string
          progress?: number
          result_url?: string | null
          status?: string
          target_format?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          paypal_order_id: string | null
          paypal_payer_id: string | null
          plan_id: string
          status: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_audit_log: {
        Row: {
          client_ip: string | null
          event_type: string | null
          id: string
          notes: string | null
          received_at: string
          request_payload: Json | null
          status: string
          transmission_id: string | null
        }
        Insert: {
          client_ip?: string | null
          event_type?: string | null
          id?: string
          notes?: string | null
          received_at?: string
          request_payload?: Json | null
          status: string
          transmission_id?: string | null
        }
        Update: {
          client_ip?: string | null
          event_type?: string | null
          id?: string
          notes?: string | null
          received_at?: string
          request_payload?: Json | null
          status?: string
          transmission_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      transactions_secure_view: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string | null
          paypal_order_id: string | null
          paypal_payer_id: string | null
          plan_id: string | null
          status: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string | null
          paypal_order_id?: never
          paypal_payer_id?: never
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: never
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string | null
          paypal_order_id?: never
          paypal_payer_id?: never
          plan_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      manual_purge_all_logs: { Args: never; Returns: undefined }
      mask_email: { Args: { email: string }; Returns: string }
      mask_paypal_id: { Args: { paypal_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
