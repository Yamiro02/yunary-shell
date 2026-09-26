/* Types générés par le MCP Supabase (generate_typescript_types) — projet drcxtkwmtceauwiiargz.
   JAMAIS édité à la main : régénéré après chaque migration du back.
   État : lot 9 du 26/09/2026, paiement intégré (exports/database.types-2026-09-26-lot9.ts). */

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_audits: {
        Row: {
          actions: Json | null
          created_at: string
          error_detail: string | null
          handle: string
          id: string
          platform: string
          points: Json | null
          profil: Json | null
          prose: string | null
          social_account_id: string | null
          stats: Json | null
          status: string
          synthese: string | null
          user_id: string
          verdicts: Json | null
        }
        Insert: {
          actions?: Json | null
          created_at?: string
          error_detail?: string | null
          handle: string
          id?: string
          platform: string
          points?: Json | null
          profil?: Json | null
          prose?: string | null
          social_account_id?: string | null
          stats?: Json | null
          status: string
          synthese?: string | null
          user_id: string
          verdicts?: Json | null
        }
        Update: {
          actions?: Json | null
          created_at?: string
          error_detail?: string | null
          handle?: string
          id?: string
          platform?: string
          points?: Json | null
          profil?: Json | null
          prose?: string | null
          social_account_id?: string | null
          stats?: Json | null
          status?: string
          synthese?: string | null
          user_id?: string
          verdicts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "account_audits_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_audits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "account_audits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          created_at: string
          id: string
          mecanismes: Json | null
          titre_genere: string | null
          transcript_segments: Json | null
          transposition: Json | null
          unique_angle: string | null
          verdict: string | null
          video_id: string
          viewer_reaction: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mecanismes?: Json | null
          titre_genere?: string | null
          transcript_segments?: Json | null
          transposition?: Json | null
          unique_angle?: string | null
          verdict?: string | null
          video_id: string
          viewer_reaction?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mecanismes?: Json | null
          titre_genere?: string | null
          transcript_segments?: Json | null
          transposition?: Json | null
          unique_angle?: string | null
          verdict?: string | null
          video_id?: string
          viewer_reaction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_cache: {
        Row: {
          analysis_payload: Json
          created_at: string
          url_canonical: string
        }
        Insert: {
          analysis_payload: Json
          created_at?: string
          url_canonical: string
        }
        Update: {
          analysis_payload?: Json
          created_at?: string
          url_canonical?: string
        }
        Relationships: []
      }
      creator_baselines: {
        Row: {
          computed_at: string | null
          created_at: string
          follower_count: number | null
          handle: string
          id: string
          platform: Database["public"]["Enums"]["platform"]
          profile_url: string | null
          sample: Json | null
          sample_size: number | null
          source: string | null
          stats: Json | null
          updated_at: string
          views_mad: number | null
          views_median: number | null
          window_days: number
        }
        Insert: {
          computed_at?: string | null
          created_at?: string
          follower_count?: number | null
          handle: string
          id?: string
          platform: Database["public"]["Enums"]["platform"]
          profile_url?: string | null
          sample?: Json | null
          sample_size?: number | null
          source?: string | null
          stats?: Json | null
          updated_at?: string
          views_mad?: number | null
          views_median?: number | null
          window_days?: number
        }
        Update: {
          computed_at?: string | null
          created_at?: string
          follower_count?: number | null
          handle?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform"]
          profile_url?: string | null
          sample?: Json | null
          sample_size?: number | null
          source?: string | null
          stats?: Json | null
          updated_at?: string
          views_mad?: number | null
          views_median?: number | null
          window_days?: number
        }
        Relationships: []
      }
      creators: {
        Row: {
          created_at: string
          follower_count: number | null
          handle: string | null
          id: string
          name: string
          platform: Database["public"]["Enums"]["platform"] | null
          profile_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          follower_count?: number | null
          handle?: string | null
          id?: string
          name: string
          platform?: Database["public"]["Enums"]["platform"] | null
          profile_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          follower_count?: number | null
          handle?: string | null
          id?: string
          name?: string
          platform?: Database["public"]["Enums"]["platform"] | null
          profile_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hooks: {
        Row: {
          boucle_ouverte: string | null
          created_at: string
          format: string | null
          formula: string | null
          id: string
          is_template: boolean
          platform: string | null
          spoken_hook: string | null
          texte_ecran: string | null
          title: string | null
          video_id: string | null
          visual_hook: string | null
          why_it_works: string | null
        }
        Insert: {
          boucle_ouverte?: string | null
          created_at?: string
          format?: string | null
          formula?: string | null
          id?: string
          is_template?: boolean
          platform?: string | null
          spoken_hook?: string | null
          texte_ecran?: string | null
          title?: string | null
          video_id?: string | null
          visual_hook?: string | null
          why_it_works?: string | null
        }
        Update: {
          boucle_ouverte?: string | null
          created_at?: string
          format?: string | null
          formula?: string | null
          id?: string
          is_template?: boolean
          platform?: string | null
          spoken_hook?: string | null
          texte_ecran?: string | null
          title?: string | null
          video_id?: string | null
          visual_hook?: string | null
          why_it_works?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hooks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_client_state: {
        Row: {
          created_at: string
          shell_read_at: string | null
          shell_version: number | null
          tools_listed_at: string | null
          tools_version: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          shell_read_at?: string | null
          shell_version?: number | null
          tools_listed_at?: string | null
          tools_version?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          shell_read_at?: string | null
          shell_version?: number | null
          tools_listed_at?: string | null
          tools_version?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_client_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mcp_client_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_deletion_requests: {
        Row: {
          confirmation_code: string
          created_at: string
          detail: string | null
          external_account_id: string
          status: string
        }
        Insert: {
          confirmation_code: string
          created_at?: string
          detail?: string | null
          external_account_id: string
          status?: string
        }
        Update: {
          confirmation_code?: string
          created_at?: string
          detail?: string | null
          external_account_id?: string
          status?: string
        }
        Relationships: []
      }
      method_steps: {
        Row: {
          active: boolean
          created_at: string
          id: string
          instruction: string
          is_strict: boolean
          next_step_key: string | null
          pass_criteria: string | null
          position: number
          required_fields: Json
          step_key: string
          title: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          instruction: string
          is_strict?: boolean
          next_step_key?: string | null
          pass_criteria?: string | null
          position: number
          required_fields?: Json
          step_key: string
          title: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          instruction?: string
          is_strict?: boolean
          next_step_key?: string | null
          pass_criteria?: string | null
          position?: number
          required_fields?: Json
          step_key?: string
          title?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "method_steps_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      method_texts: {
        Row: {
          active: boolean
          body: string
          created_at: string
          key: string
          title: string
          tool_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          key: string
          title: string
          tool_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          key?: string
          title?: string
          tool_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "method_texts_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          expires_at: string
          platform: Database["public"]["Enums"]["social_platform"]
          redirect_to: string | null
          state: string
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string
          expires_at: string
          platform: Database["public"]["Enums"]["social_platform"]
          redirect_to?: string | null
          state: string
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          expires_at?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          redirect_to?: string | null
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "oauth_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          avatar_galere: string | null
          avatar_qui: string | null
          conviction_defend: string | null
          conviction_faux: string | null
          conviction_refus: string | null
          description: string | null
          field_sources: Json | null
          histoire: string | null
          id: string
          niche: string | null
          notes: string | null
          onboarding_step: number
          passions: string[]
          social_links: Json | null
          style_signature: Json | null
          transformation_a: string | null
          transformation_b: string | null
          updated_at: string
          user_id: string
          vecus_marquants: string[]
          vies_autre: string | null
          voix: Json | null
        }
        Insert: {
          avatar_galere?: string | null
          avatar_qui?: string | null
          conviction_defend?: string | null
          conviction_faux?: string | null
          conviction_refus?: string | null
          description?: string | null
          field_sources?: Json | null
          histoire?: string | null
          id?: string
          niche?: string | null
          notes?: string | null
          onboarding_step?: number
          passions?: string[]
          social_links?: Json | null
          style_signature?: Json | null
          transformation_a?: string | null
          transformation_b?: string | null
          updated_at?: string
          user_id: string
          vecus_marquants?: string[]
          vies_autre?: string | null
          voix?: Json | null
        }
        Update: {
          avatar_galere?: string | null
          avatar_qui?: string | null
          conviction_defend?: string | null
          conviction_faux?: string | null
          conviction_refus?: string | null
          description?: string | null
          field_sources?: Json | null
          histoire?: string | null
          id?: string
          niche?: string | null
          notes?: string | null
          onboarding_step?: number
          passions?: string[]
          social_links?: Json | null
          style_signature?: Json | null
          transformation_a?: string | null
          transformation_b?: string | null
          updated_at?: string
          user_id?: string
          vecus_marquants?: string[]
          vies_autre?: string | null
          voix?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "personas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_analyses: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          payload: Json | null
          status: Database["public"]["Enums"]["profile_analysis_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: Database["public"]["Enums"]["profile_analysis_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: Database["public"]["Enums"]["profile_analysis_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profile_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reference_values: {
        Row: {
          code: string
          emoji: string | null
          is_exclusive: boolean
          is_sentinel: boolean
          kind: string
          label: string
          position: number
        }
        Insert: {
          code: string
          emoji?: string | null
          is_exclusive?: boolean
          is_sentinel?: boolean
          kind: string
          label: string
          position: number
        }
        Update: {
          code?: string
          emoji?: string | null
          is_exclusive?: boolean
          is_sentinel?: boolean
          kind?: string
          label?: string
          position?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          handle: string | null
          id: string
          locale: string | null
          nom: string | null
          notification_prefs: Json
          onboarding_completed: boolean
          platform: string | null
          prenom: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          handle?: string | null
          id: string
          locale?: string | null
          nom?: string | null
          notification_prefs?: Json
          onboarding_completed?: boolean
          platform?: string | null
          prenom?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          handle?: string | null
          id?: string
          locale?: string | null
          nom?: string | null
          notification_prefs?: Json
          onboarding_completed?: boolean
          platform?: string | null
          prenom?: string | null
          role?: string
        }
        Relationships: []
      }
      social_account_tokens: {
        Row: {
          access_expires_at: string | null
          access_token_enc: string
          account_id: string
          refresh_expires_at: string | null
          refresh_token_enc: string | null
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          access_token_enc: string
          account_id: string
          refresh_expires_at?: string | null
          refresh_token_enc?: string | null
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          access_token_enc?: string
          account_id?: string
          refresh_expires_at?: string | null
          refresh_token_enc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_account_tokens_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          connected_at: string
          created_at: string
          display_name: string | null
          external_account_id: string
          follower_count: number | null
          id: string
          last_synced_at: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url: string | null
          scopes: string[]
          status: Database["public"]["Enums"]["social_account_status"]
          updated_at: string
          user_id: string
          username: string | null
          video_count: number | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          connected_at?: string
          created_at?: string
          display_name?: string | null
          external_account_id: string
          follower_count?: number | null
          id?: string
          last_synced_at?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          scopes?: string[]
          status?: Database["public"]["Enums"]["social_account_status"]
          updated_at?: string
          user_id: string
          username?: string | null
          video_count?: number | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          connected_at?: string
          created_at?: string
          display_name?: string | null
          external_account_id?: string
          follower_count?: number | null
          id?: string
          last_synced_at?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          scopes?: string[]
          status?: Database["public"]["Enums"]["social_account_status"]
          updated_at?: string
          user_id?: string
          username?: string | null
          video_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          event_id: string
          received_at: string
          type: string
        }
        Insert: {
          event_id: string
          received_at?: string
          type: string
        }
        Update: {
          event_id?: string
          received_at?: string
          type?: string
        }
        Relationships: []
      }
      structures: {
        Row: {
          beats: Json | null
          created_at: string
          format: string | null
          id: string
          is_template: boolean
          platform: string | null
          template: string | null
          title: string | null
          video_id: string | null
          when_to_avoid: string | null
          when_to_use: string | null
          why_it_works: Json | null
        }
        Insert: {
          beats?: Json | null
          created_at?: string
          format?: string | null
          id?: string
          is_template?: boolean
          platform?: string | null
          template?: string | null
          title?: string | null
          video_id?: string | null
          when_to_avoid?: string | null
          when_to_use?: string | null
          why_it_works?: Json | null
        }
        Update: {
          beats?: Json | null
          created_at?: string
          format?: string | null
          id?: string
          is_template?: boolean
          platform?: string | null
          template?: string | null
          title?: string | null
          video_id?: string | null
          when_to_avoid?: string | null
          when_to_use?: string | null
          why_it_works?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "structures_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_items: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          status: string
          stripe_item_id: string
          stripe_price_id: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          status?: string
          stripe_item_id: string
          stripe_price_id: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          status?: string
          stripe_item_id?: string
          stripe_price_id?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscription_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          cgu_acceptees_le: string | null
          cgu_consentement: string | null
          created_at: string
          current_period_end: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          cgu_acceptees_le?: string | null
          cgu_consentement?: string | null
          created_at?: string
          current_period_end?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          cgu_acceptees_le?: string | null
          cgu_consentement?: string | null
          created_at?: string
          current_period_end?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_entitlements: {
        Row: {
          created_at: string
          ends_at_period_end: boolean
          id: string
          period_end: string | null
          period_start: string
          quota_total: number | null
          quota_used: number
          source: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_subscription_item_id: string | null
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at_period_end?: boolean
          id?: string
          period_end?: string | null
          period_start?: string
          quota_total?: number | null
          quota_used?: number
          source: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_item_id?: string | null
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at_period_end?: boolean
          id?: string
          period_end?: string | null
          period_start?: string
          quota_total?: number | null
          quota_used?: number
          source?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_item_id?: string | null
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_entitlements_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tool_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_packs: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          name: string
          price_cents: number | null
          stripe_price_id: string | null
          tool_id: string
          units: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_published?: boolean
          name: string
          price_cents?: number | null
          stripe_price_id?: string | null
          tool_id: string
          units: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          price_cents?: number | null
          stripe_price_id?: string | null
          tool_id?: string
          units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_packs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_runs: {
        Row: {
          current_step_key: string | null
          data: Json
          finished_at: string | null
          id: string
          ref_id: string | null
          started_at: string
          status: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_step_key?: string | null
          data?: Json
          finished_at?: string | null
          id?: string
          ref_id?: string | null
          started_at?: string
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_step_key?: string | null
          data?: Json
          finished_at?: string | null
          id?: string
          ref_id?: string | null
          started_at?: string
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_runs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tool_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          description: string
          id: string
          is_published: boolean
          monthly_quota: number | null
          name: string
          position: number
          price_cents: number | null
          status: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          unit_label: string
          unit_label_plural: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id: string
          is_published?: boolean
          monthly_quota?: number | null
          name: string
          position: number
          price_cents?: number | null
          status: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          unit_label?: string
          unit_label_plural?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          monthly_quota?: number | null
          name?: string
          position?: number
          price_cents?: number | null
          status?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          unit_label?: string
          unit_label_plural?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          cost_estimate: number | null
          created_at: string
          credits_charged: number | null
          id: string
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          cost_estimate?: number | null
          created_at?: string
          credits_charged?: number | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          cost_estimate?: number | null
          created_at?: string
          credits_charged?: number | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tool_rules: {
        Row: {
          created_at: string
          id: string
          step_key: string | null
          text: string
          tool_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          step_key?: string | null
          text: string
          tool_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          step_key?: string | null
          text?: string
          tool_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tool_rules_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tool_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_tool_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          caption: string | null
          comments: number | null
          created_at: string
          creator_id: string | null
          date_analyse: string | null
          date_publication: string | null
          engagement_rate: number | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          lien: string
          likes: number | null
          objectif: string | null
          objectif_source: string | null
          performance: Json | null
          performance_measured_at: string | null
          performance_status: string | null
          platform: Database["public"]["Enums"]["platform"]
          platform_insights: Json | null
          resume: string | null
          saves: number | null
          source_account_id: string | null
          status: Database["public"]["Enums"]["video_status"]
          thumbnail_url: string | null
          titre: string | null
          transcript: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          caption?: string | null
          comments?: number | null
          created_at?: string
          creator_id?: string | null
          date_analyse?: string | null
          date_publication?: string | null
          engagement_rate?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          lien: string
          likes?: number | null
          objectif?: string | null
          objectif_source?: string | null
          performance?: Json | null
          performance_measured_at?: string | null
          performance_status?: string | null
          platform: Database["public"]["Enums"]["platform"]
          platform_insights?: Json | null
          resume?: string | null
          saves?: number | null
          source_account_id?: string | null
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          titre?: string | null
          transcript?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          caption?: string | null
          comments?: number | null
          created_at?: string
          creator_id?: string | null
          date_analyse?: string | null
          date_publication?: string | null
          engagement_rate?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          lien?: string
          likes?: number | null
          objectif?: string | null
          objectif_source?: string | null
          performance?: Json | null
          performance_measured_at?: string | null
          performance_status?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          platform_insights?: Json | null
          resume?: string | null
          saves?: number | null
          source_account_id?: string | null
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          titre?: string | null
          transcript?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_source_account_id_fkey"
            columns: ["source_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_prospects: {
        Row: {
          audit_created_at: string | null
          audit_status: string | null
          created_at: string | null
          email: string | null
          followers: number | null
          handle: string | null
          niche: string | null
          nom: string | null
          onboarding_completed: boolean | null
          platform: string | null
          prenom: string | null
          subscribed_tools: string[] | null
          subscription_cancel_at_period_end: boolean | null
          subscription_period_end: string | null
          subscription_status: string | null
          user_id: string | null
        }
        Relationships: []
      }
      method_steps_public: {
        Row: {
          position: number | null
          step_key: string | null
          title: string | null
          tool_id: string | null
        }
        Insert: {
          position?: number | null
          step_key?: string | null
          title?: string | null
          tool_id?: string | null
        }
        Update: {
          position?: number | null
          step_key?: string | null
          title?: string | null
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "method_steps_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_use: { Args: { p_tool: string }; Returns: Json }
      can_use_for: {
        Args: { p_debit?: boolean; p_tool: string; p_user_id: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      mcp_fiche_analyse: { Args: { p_video_id: string }; Returns: Json }
      persist_video_analysis: {
        Args: {
          p_analysis: Json
          p_creator_id: string
          p_hook: Json
          p_structure: Json
          p_user_id: string
          p_video: Json
          p_video_id: string
        }
        Returns: undefined
      }
      stripe_handle_checkout_completed: {
        Args: {
          p_cancel_at_period_end: boolean
          p_customer_id: string
          p_event_id: string
          p_items: Json
          p_mode: string
          p_pack_lines: Json
          p_period_end: string
          p_status: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: Json
      }
      stripe_handle_invoice_paid: {
        Args: {
          p_amount_paid: number
          p_billing_reason: string
          p_cancel_at_period_end: boolean
          p_customer_id: string
          p_event_id: string
          p_items: Json
          p_period_end: string
          p_status: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: Json
      }
      stripe_handle_payment_failed: {
        Args: {
          p_customer_id: string
          p_event_id: string
          p_status: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: Json
      }
      stripe_handle_payment_intent_succeeded: {
        Args: {
          p_customer_id: string
          p_event_id: string
          p_pack_lines: Json
          p_payment_intent_id: string
          p_user_id: string
        }
        Returns: Json
      }
      stripe_handle_subscription_deleted: {
        Args: {
          p_customer_id: string
          p_event_id: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: Json
      }
      stripe_handle_subscription_updated: {
        Args: {
          p_cancel_at_period_end: boolean
          p_customer_id: string
          p_event_id: string
          p_items: Json
          p_period_end: string
          p_status: string
          p_subscription_id: string
          p_user_id: string
        }
        Returns: Json
      }
      stripe_mark_event: {
        Args: { p_event_id: string; p_type: string }
        Returns: boolean
      }
      stripe_resolve_user: {
        Args: { p_customer_id: string; p_user_id: string }
        Returns: string
      }
      stripe_sync_subscription: {
        Args: {
          p_cancel_at_period_end: boolean
          p_customer_id: string
          p_items: Json
          p_period_end: string
          p_reset: boolean
          p_status: string
          p_subscription_id: string
          p_user: string
        }
        Returns: Json
      }
    }
    Enums: {
      action_type:
        | "analyse"
        | "generation"
        | "chat_edit"
        | "retouche"
        | "hook"
        | "restructure"
        | "suggest"
      platform: "instagram" | "tiktok"
      profile_analysis_status: "pending" | "analyzing" | "done" | "error"
      social_account_status: "active" | "expired" | "revoked" | "error"
      social_platform: "instagram" | "tiktok"
      video_status: "pending" | "analyzing" | "done" | "error"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      action_type: [
        "analyse",
        "generation",
        "chat_edit",
        "retouche",
        "hook",
        "restructure",
        "suggest",
      ],
      platform: ["instagram", "tiktok"],
      profile_analysis_status: ["pending", "analyzing", "done", "error"],
      social_account_status: ["active", "expired", "revoked", "error"],
      social_platform: ["instagram", "tiktok"],
      video_status: ["pending", "analyzing", "done", "error"],
    },
  },
} as const
