import { createClient } from '@supabase/supabase-js'

// Tyto údaje najdeš v Supabase: Settings -> API
const supabaseUrl = 'https://upjeviaermtrzijavjjr.supabase.co' 
const supabaseAnonKey = 'sb_publishable_fQHxAKw7s1L_98JNWc78gQ_L6gW8tPc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)