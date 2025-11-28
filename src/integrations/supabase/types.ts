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
      conquistas: {
        Row: {
          codigo_interno: string
          created_at: string | null
          descricao: string
          icone: string | null
          id: string
          nome: string
          raridade: Database["public"]["Enums"]["rarity_type"]
        }
        Insert: {
          codigo_interno: string
          created_at?: string | null
          descricao: string
          icone?: string | null
          id?: string
          nome: string
          raridade?: Database["public"]["Enums"]["rarity_type"]
        }
        Update: {
          codigo_interno?: string
          created_at?: string | null
          descricao?: string
          icone?: string | null
          id?: string
          nome?: string
          raridade?: Database["public"]["Enums"]["rarity_type"]
        }
        Relationships: []
      }
      conquistas_usuarios: {
        Row: {
          conquista_id: string
          data_desbloqueio: string | null
          id: string
          usuario_id: string
        }
        Insert: {
          conquista_id: string
          data_desbloqueio?: string | null
          id?: string
          usuario_id: string
        }
        Update: {
          conquista_id?: string
          data_desbloqueio?: string | null
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conquistas_usuarios_conquista_id_fkey"
            columns: ["conquista_id"]
            isOneToOne: false
            referencedRelation: "conquistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conquistas_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          nome: string
          nome_do_jogo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          nome_do_jogo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          nome_do_jogo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipes: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          id: string
          nome: string
          updated_at: string | null
          vendas_exigem_aprovacao: boolean | null
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          vendas_exigem_aprovacao?: boolean | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          vendas_exigem_aprovacao?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "equipes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_nivel: {
        Row: {
          data: string | null
          id: string
          nivel_alcancado: number
          usuario_id: string
        }
        Insert: {
          data?: string | null
          id?: string
          nivel_alcancado: number
          usuario_id: string
        }
        Update: {
          data?: string | null
          id?: string
          nivel_alcancado?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_nivel_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missoes: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          criterio_tipo:
            | Database["public"]["Enums"]["mission_criteria_type"]
            | null
          criterio_valor: number | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          equipe_id: string | null
          id: string
          nome: string
          recompensa_pontos: number | null
          tipo: Database["public"]["Enums"]["mission_type"]
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          criterio_tipo?:
            | Database["public"]["Enums"]["mission_criteria_type"]
            | null
          criterio_valor?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          equipe_id?: string | null
          id?: string
          nome: string
          recompensa_pontos?: number | null
          tipo: Database["public"]["Enums"]["mission_type"]
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          criterio_tipo?:
            | Database["public"]["Enums"]["mission_criteria_type"]
            | null
          criterio_valor?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          equipe_id?: string | null
          id?: string
          nome?: string
          recompensa_pontos?: number | null
          tipo?: Database["public"]["Enums"]["mission_type"]
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missoes_usuarios: {
        Row: {
          concluida: boolean | null
          data_conclusao: string | null
          id: string
          missao_id: string
          usuario_id: string
        }
        Insert: {
          concluida?: boolean | null
          data_conclusao?: string | null
          id?: string
          missao_id: string
          usuario_id: string
        }
        Update: {
          concluida?: boolean | null
          data_conclusao?: string | null
          id?: string
          missao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missoes_usuarios_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missoes_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string | null
          created_at: string | null
          estrategico: boolean | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          estrategico?: boolean | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          estrategico?: boolean | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aprovado: boolean | null
          avatar_url: string | null
          created_at: string | null
          criado_por: string | null
          equipe_id: string | null
          id: string
          nivel_atual: number | null
          nome: string
          onboarding_concluido: boolean | null
          papel: Database["public"]["Enums"]["user_role"]
          pontos_total: number | null
          updated_at: string | null
          xp_total: number | null
        }
        Insert: {
          aprovado?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          criado_por?: string | null
          equipe_id?: string | null
          id: string
          nivel_atual?: number | null
          nome: string
          onboarding_concluido?: boolean | null
          papel?: Database["public"]["Enums"]["user_role"]
          pontos_total?: number | null
          updated_at?: string | null
          xp_total?: number | null
        }
        Update: {
          aprovado?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          criado_por?: string | null
          equipe_id?: string | null
          id?: string
          nivel_atual?: number | null
          nome?: string
          onboarding_concluido?: boolean | null
          papel?: Database["public"]["Enums"]["user_role"]
          pontos_total?: number | null
          updated_at?: string | null
          xp_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recompensas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          custo_pontos: number
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          custo_pontos: number
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          custo_pontos?: number
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resgates_recompensas: {
        Row: {
          data_atualizacao: string | null
          data_solicitacao: string | null
          id: string
          recompensa_id: string
          status: Database["public"]["Enums"]["reward_redemption_status"] | null
          usuario_id: string
        }
        Insert: {
          data_atualizacao?: string | null
          data_solicitacao?: string | null
          id?: string
          recompensa_id: string
          status?:
            | Database["public"]["Enums"]["reward_redemption_status"]
            | null
          usuario_id: string
        }
        Update: {
          data_atualizacao?: string | null
          data_solicitacao?: string | null
          id?: string
          recompensa_id?: string
          status?:
            | Database["public"]["Enums"]["reward_redemption_status"]
            | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resgates_recompensas_recompensa_id_fkey"
            columns: ["recompensa_id"]
            isOneToOne: false
            referencedRelation: "recompensas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resgates_recompensas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_cadastro: {
        Row: {
          avaliado_por: string | null
          created_at: string | null
          id: string
          mensagem_recusa: string | null
          status: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          avaliado_por?: string | null
          created_at?: string | null
          id?: string
          mensagem_recusa?: string | null
          status?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          avaliado_por?: string | null
          created_at?: string | null
          id?: string
          mensagem_recusa?: string | null
          status?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_cadastro_avaliado_por_fkey"
            columns: ["avaliado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_cadastro_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          cliente: string
          created_at: string | null
          data_venda: string
          id: string
          observacoes: string | null
          pontos_base: number | null
          pontos_bonus: number | null
          pontos_totais: number | null
          produto_id: string | null
          status: Database["public"]["Enums"]["sale_status"] | null
          tipo_venda: Database["public"]["Enums"]["sale_type"]
          updated_at: string | null
          usuario_id: string
          valor: number
        }
        Insert: {
          cliente: string
          created_at?: string | null
          data_venda?: string
          id?: string
          observacoes?: string | null
          pontos_base?: number | null
          pontos_bonus?: number | null
          pontos_totais?: number | null
          produto_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"] | null
          tipo_venda: Database["public"]["Enums"]["sale_type"]
          updated_at?: string | null
          usuario_id: string
          valor: number
        }
        Update: {
          cliente?: string
          created_at?: string | null
          data_venda?: string
          id?: string
          observacoes?: string | null
          pontos_base?: number | null
          pontos_bonus?: number | null
          pontos_totais?: number | null
          produto_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"] | null
          tipo_venda?: Database["public"]["Enums"]["sale_type"]
          updated_at?: string | null
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mission_criteria_type: "QUANTIDADE_VENDAS" | "VALOR_REAIS"
      mission_type:
        | "DIARIA_PADRAO"
        | "SEMANAL_PADRAO"
        | "MENSAL_PADRAO"
        | "ESPECIAL"
      rarity_type: "COMUM" | "RARO" | "EPICO" | "LENDARIO"
      reward_redemption_status: "PENDENTE" | "ENTREGUE" | "CANCELADO"
      sale_status: "PENDENTE" | "APROVADA" | "REJEITADA"
      sale_type: "NOVA" | "UPSELL" | "CROSS_SELL" | "RENOVACAO"
      user_role: "MASTER" | "GESTOR" | "VENDEDOR"
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
      mission_criteria_type: ["QUANTIDADE_VENDAS", "VALOR_REAIS"],
      mission_type: [
        "DIARIA_PADRAO",
        "SEMANAL_PADRAO",
        "MENSAL_PADRAO",
        "ESPECIAL",
      ],
      rarity_type: ["COMUM", "RARO", "EPICO", "LENDARIO"],
      reward_redemption_status: ["PENDENTE", "ENTREGUE", "CANCELADO"],
      sale_status: ["PENDENTE", "APROVADA", "REJEITADA"],
      sale_type: ["NOVA", "UPSELL", "CROSS_SELL", "RENOVACAO"],
      user_role: ["MASTER", "GESTOR", "VENDEDOR"],
    },
  },
} as const
