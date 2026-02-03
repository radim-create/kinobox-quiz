import { createClient } from '@supabase/supabase-js'

// Správná verze pro Vercel:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;