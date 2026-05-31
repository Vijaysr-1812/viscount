export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string | null
          logo_url: string | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string | null
          logo_url?: string | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      organization_members: {
        Row: {
          id: string
          org_id: string | null
          user_id: string | null
          role: string | null
          invited_at: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          role?: string | null
          invited_at?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          role?: string | null
          invited_at?: string | null
          joined_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          default_org_id: string | null
          preferences: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          default_org_id?: string | null
          preferences?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          default_org_id?: string | null
          preferences?: Json | null
          created_at?: string | null
        }
      }
      contracts: {
        Row: {
          id: string
          org_id: string | null
          title: string
          description: string | null
          contract_type: string | null
          parties: Json | null
          effective_date: string | null
          expiry_date: string | null
          contract_value: number | null
          currency: string | null
          file_url: string
          file_size: number | null
          file_hash: string | null
          page_count: number | null
          status: string | null
          processing_error: string | null
          parsed_text: string | null
          uploaded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          title: string
          description?: string | null
          contract_type?: string | null
          parties?: Json | null
          effective_date?: string | null
          expiry_date?: string | null
          contract_value?: number | null
          currency?: string | null
          file_url: string
          file_size?: number | null
          file_hash?: string | null
          page_count?: number | null
          status?: string | null
          processing_error?: string | null
          parsed_text?: string | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          title?: string
          description?: string | null
          contract_type?: string | null
          parties?: Json | null
          effective_date?: string | null
          expiry_date?: string | null
          contract_value?: number | null
          currency?: string | null
          file_url?: string
          file_size?: number | null
          file_hash?: string | null
          page_count?: number | null
          status?: string | null
          processing_error?: string | null
          parsed_text?: string | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      obligations: {
        Row: {
          id: string
          contract_id: string | null
          org_id: string | null
          clause_reference: string | null
          clause_text: string
          obligation_summary: string
          responsible_party: string | null
          obligation_type: string | null
          deliverable: string | null
          quantity_value: number | null
          quantity_unit: string | null
          conditions: Json | null
          due_date: string | null
          recurrence: string | null
          severity: string | null
          status: string | null
          confidence_score: number | null
          extracted_by_model: string | null
          human_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          contract_id?: string | null
          org_id?: string | null
          clause_reference?: string | null
          clause_text: string
          obligation_summary: string
          responsible_party?: string | null
          obligation_type?: string | null
          deliverable?: string | null
          quantity_value?: number | null
          quantity_unit?: string | null
          conditions?: Json | null
          due_date?: string | null
          recurrence?: string | null
          severity?: string | null
          status?: string | null
          confidence_score?: number | null
          extracted_by_model?: string | null
          human_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string | null
          org_id?: string | null
          clause_reference?: string | null
          clause_text?: string
          obligation_summary?: string
          responsible_party?: string | null
          obligation_type?: string | null
          deliverable?: string | null
          quantity_value?: number | null
          quantity_unit?: string | null
          conditions?: Json | null
          due_date?: string | null
          recurrence?: string | null
          severity?: string | null
          status?: string | null
          confidence_score?: number | null
          extracted_by_model?: string | null
          human_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      evidence: {
        Row: {
          id: string
          org_id: string | null
          contract_id: string | null
          evidence_type: string | null
          file_url: string
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          file_hash: string | null
          extracted_text: string | null
          ai_summary: string | null
          ai_analysis: Json | null
          captured_at: string | null
          source: string | null
          source_metadata: Json | null
          status: string | null
          processing_error: string | null
          uploaded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          contract_id?: string | null
          evidence_type?: string | null
          file_url: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          file_hash?: string | null
          extracted_text?: string | null
          ai_summary?: string | null
          ai_analysis?: Json | null
          captured_at?: string | null
          source?: string | null
          source_metadata?: Json | null
          status?: string | null
          processing_error?: string | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          contract_id?: string | null
          evidence_type?: string | null
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          file_hash?: string | null
          extracted_text?: string | null
          ai_summary?: string | null
          ai_analysis?: Json | null
          captured_at?: string | null
          source?: string | null
          source_metadata?: Json | null
          status?: string | null
          processing_error?: string | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      obligation_evidence_links: {
        Row: {
          id: string
          obligation_id: string | null
          evidence_id: string | null
          match_type: string | null
          confidence_score: number | null
          ai_reasoning: string | null
          gaps: Json | null
          human_verified: boolean | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          obligation_id?: string | null
          evidence_id?: string | null
          match_type?: string | null
          confidence_score?: number | null
          ai_reasoning?: string | null
          gaps?: Json | null
          human_verified?: boolean | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          obligation_id?: string | null
          evidence_id?: string | null
          match_type?: string | null
          confidence_score?: number | null
          ai_reasoning?: string | null
          gaps?: Json | null
          human_verified?: boolean | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string | null
        }
      }
      document_chunks: {
        Row: {
          id: string
          org_id: string | null
          source_type: string | null
          source_id: string
          chunk_index: number | null
          chunk_text: string
          embedding: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          source_type?: string | null
          source_id: string
          chunk_index?: number | null
          chunk_text: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          source_type?: string | null
          source_id?: string
          chunk_index?: number | null
          chunk_text?: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      timeline_events: {
        Row: {
          id: string
          org_id: string | null
          contract_id: string | null
          obligation_id: string | null
          evidence_id: string | null
          event_type: string
          title: string
          description: string | null
          severity: string | null
          actor_id: string | null
          actor_type: string | null
          payload: Json | null
          occurred_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          contract_id?: string | null
          obligation_id?: string | null
          evidence_id?: string | null
          event_type: string
          title: string
          description?: string | null
          severity?: string | null
          actor_id?: string | null
          actor_type?: string | null
          payload?: Json | null
          occurred_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          contract_id?: string | null
          obligation_id?: string | null
          evidence_id?: string | null
          event_type?: string
          title?: string
          description?: string | null
          severity?: string | null
          actor_id?: string | null
          actor_type?: string | null
          payload?: Json | null
          occurred_at?: string | null
        }
      }
      risk_scores: {
        Row: {
          id: string
          contract_id: string | null
          org_id: string | null
          overall_score: number | null
          risk_level: string | null
          missing_evidence_score: number | null
          overdue_score: number | null
          low_confidence_score: number | null
          dispute_score: number | null
          factors: Json | null
          recommendations: Json | null
          calculated_at: string | null
        }
        Insert: {
          id?: string
          contract_id?: string | null
          org_id?: string | null
          overall_score?: number | null
          risk_level?: string | null
          missing_evidence_score?: number | null
          overdue_score?: number | null
          low_confidence_score?: number | null
          dispute_score?: number | null
          factors?: Json | null
          recommendations?: Json | null
          calculated_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string | null
          org_id?: string | null
          overall_score?: number | null
          risk_level?: string | null
          missing_evidence_score?: number | null
          overdue_score?: number | null
          low_confidence_score?: number | null
          dispute_score?: number | null
          factors?: Json | null
          recommendations?: Json | null
          calculated_at?: string | null
        }
      }
      audit_reports: {
        Row: {
          id: string
          org_id: string | null
          contract_id: string | null
          report_type: string | null
          title: string | null
          config: Json | null
          content: Json | null
          pdf_url: string | null
          shareable_token: string | null
          expires_at: string | null
          generated_by: string | null
          generated_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          contract_id?: string | null
          report_type?: string | null
          title?: string | null
          config?: Json | null
          content?: Json | null
          pdf_url?: string | null
          shareable_token?: string | null
          expires_at?: string | null
          generated_by?: string | null
          generated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          contract_id?: string | null
          report_type?: string | null
          title?: string | null
          config?: Json | null
          content?: Json | null
          pdf_url?: string | null
          shareable_token?: string | null
          expires_at?: string | null
          generated_by?: string | null
          generated_at?: string | null
        }
      }
      processing_jobs: {
        Row: {
          id: string
          org_id: string | null
          job_type: string
          resource_id: string
          resource_type: string
          status: string | null
          progress: number | null
          current_stage: string | null
          inngest_run_id: string | null
          error_message: string | null
          retry_count: number | null
          started_at: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id?: string | null
          job_type: string
          resource_id: string
          resource_type: string
          status?: string | null
          progress?: number | null
          current_stage?: string | null
          inngest_run_id?: string | null
          error_message?: string | null
          retry_count?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string | null
          job_type?: string
          resource_id?: string
          resource_type?: string
          status?: string | null
          progress?: number | null
          current_stage?: string | null
          inngest_run_id?: string | null
          error_message?: string | null
          retry_count?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_org_id?: string
          filter_source_type?: string
        }
        Returns: {
          id: string
          source_id: string
          source_type: string
          chunk_text: string
          similarity: number
        }[]
      }
      compute_contract_risk: {
        Args: {
          p_contract_id: string
        }
        Returns: number
      }
      is_org_member: {
        Args: {
          org_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
