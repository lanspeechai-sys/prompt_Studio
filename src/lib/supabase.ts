import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  has_paid: boolean;
  is_admin: boolean;
  subscription_plan: 'monthly' | 'yearly' | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string | null;
  prompt_text: string;
  image_url: string;
  category: string;
  category_id: string | null;
  created_at: string;
}
