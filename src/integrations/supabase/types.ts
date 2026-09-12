/* Types générés par le MCP Supabase (generate_typescript_types) — projet drcxtkwmtceauwiiargz.
   JAMAIS édité à la main : régénéré après chaque migration du back. */

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
      actions: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          credits_cost: number
          label: string
          updated_at: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          credits_cost: number
          label: string
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          credits_cost?: number
          label?: string
          updated_at?: string
        }
        Relationships: []
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
      creator_scripts: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_scripts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "creator_scripts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      generations: {
        Row: {
          batch_id: string
          created_at: string
          credits_charged: number
          error_message: string | null
          id: string
          kind: string
          models: Json
          outputs: Json
          regenerated_from: string | null
          script_id: string
          selected: Json
          status: string
          updated_at: string
          user_id: string
          validated_at: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          credits_charged?: number
          error_message?: string | null
          id?: string
          kind: string
          models: Json
          outputs?: Json
          regenerated_from?: string | null
          script_id: string
          selected?: Json
          status?: string
          updated_at?: string
          user_id: string
          validated_at?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          credits_charged?: number
          error_message?: string | null
          id?: string
          kind?: string
          models?: Json
          outputs?: Json
          regenerated_from?: string | null
          script_id?: string
          selected?: Json
          status?: string
          updated_at?: string
          user_id?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generations_regenerated_from_fkey"
            columns: ["regenerated_from"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "creator_scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generations_user_id_fkey"
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
      plan_allocations: {
        Row: {
          credits_per_month: number
          label: string
          plan: string
          updated_at: string
        }
        Insert: {
          credits_per_month: number
          label: string
          plan: string
          updated_at?: string
        }
        Update: {
          credits_per_month?: number
          label?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
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
      share_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          label: string
          last_used_at: string | null
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "share_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      subscriptions: {
        Row: {
          current_period_end: string | null
          plan: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
            foreignKeyName: "usage_events_action_type_fkey"
            columns: ["action_type"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["action_type"]
          },
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
      user_credits: {
        Row: {
          credits_remaining: number
          period_end: string | null
          period_start: string | null
          user_id: string
        }
        Insert: {
          credits_remaining?: number
          period_end?: string | null
          period_start?: string | null
          user_id: string
        }
        Update: {
          credits_remaining?: number
          period_end?: string | null
          period_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_prospects"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
          plan: string | null
          platform: string | null
          prenom: string | null
          subscription_status: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      charge_action: {
        Args: {
          p_action_type: Database["public"]["Enums"]["action_type"]
          p_cost_estimate: number
          p_input_tokens: number
          p_model: string
          p_output_tokens: number
          p_user_id: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      persist_generation: {
        Args: {
          p_batch_id: string
          p_cost_estimate?: number
          p_input_tokens?: number
          p_kind: string
          p_model?: string
          p_models: Json
          p_output_tokens?: number
          p_outputs: Json
          p_regenerated_from?: string
          p_script_id: string
          p_user_id: string
        }
        Returns: Json
      }
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
      reset_free_credits: {
        Args: { p_now?: string }
        Returns: {
          credits_remaining: number
          user_id: string
        }[]
      }
      validate_batch: {
        Args: { p_batch_id: string; p_selections: Json }
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
