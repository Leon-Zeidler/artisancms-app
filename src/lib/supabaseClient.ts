// src/lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const fallbackSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const fallbackSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key-for-builds";

// Export a factory so each consumer gets an isolated client instance.
export const createSupabaseClient = () =>
  createClientComponentClient({
    supabaseUrl: fallbackSupabaseUrl,
    supabaseKey: fallbackSupabaseAnonKey,
  });
