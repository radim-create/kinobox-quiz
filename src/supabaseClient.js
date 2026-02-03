import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tohle slovo 'export' je klíčové!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)