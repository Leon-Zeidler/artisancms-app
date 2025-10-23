import { createClient } from '@supabase/supabase-js'

// Get the Supabase URL and anon key from your environment variables
// These MUST be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create and export the Supabase client instance
// This 'supabase' object is what you'll use to interact with Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

