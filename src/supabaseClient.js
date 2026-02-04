import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Pokud klíče chybí, vytvoříme "mrtvého" klienta, který neshodí aplikaci
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Missing Keys' }) }) }) }) };