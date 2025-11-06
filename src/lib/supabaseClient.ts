// src/lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Export a factory so each consumer gets an isolated client instance.
export const createSupabaseClient = () => createClientComponentClient();
