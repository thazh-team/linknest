
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing - using placeholder. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)

export type Profile = {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
  cover_url: string | null
  location: string | null
  contact_email: string | null
  contact_email_public: boolean
  visibility: 'public' | 'unlisted' | 'disabled'
  theme_config: ThemeConfig
  meta_title: string | null
  meta_description: string | null
  status_text: string | null
  created_at: string
  updated_at: string
}

export type Link = {
  id: string
  profile_id: string
  title: string
  url: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  is_public: boolean
  group_id: string | null
  created_at: string
  updated_at: string
}

export type LinkGroup = {
  id: string
  profile_id: string
  title: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type ThemeConfig = {
  background?: string
  backgroundImage?: string
  textColor?: string
  buttonStyle?: 'rounded' | 'pill' | 'sharp' | 'soft'
  buttonColor?: string
  buttonTextColor?: string
  buttonBorder?: string
  fontFamily?: string
  theme?: 'light' | 'dark' | 'auto'
  accent?: string
}
