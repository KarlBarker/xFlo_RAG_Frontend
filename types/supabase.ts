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
      [key: string]: {
        Row: {}
        Insert: {}
        Update: {}
      }
    }
    Views: {
      [key: string]: {
        Row: {}
      }
    }
    Functions: {
      [key: string]: {
        Args: {}
        Returns: {}
      }
    }
    Enums: {
      [key: string]: string[]
    }
  }
}
