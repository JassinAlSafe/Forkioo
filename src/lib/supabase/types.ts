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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'provider' | 'customer'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'provider' | 'customer'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'provider' | 'customer'
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          provider_id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          currency: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          provider_id: string
          name: string
          description?: string | null
          duration_minutes: number
          price: number
          currency?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          provider_id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price?: number
          currency?: string
          is_active?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          service_id: string
          customer_id: string
          provider_id: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          total_price: number
          currency: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          service_id: string
          customer_id: string
          provider_id: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          total_price: number
          currency?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          service_id?: string
          customer_id?: string
          provider_id?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          total_price?: number
          currency?: string
        }
      }
      availability: {
        Row: {
          id: string
          created_at: string
          provider_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          provider_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          provider_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'provider' | 'customer'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
}
