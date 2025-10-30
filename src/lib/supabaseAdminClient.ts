// src/lib/supabaseAdminClient.ts
import { createClient as createBrowserClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

/**
 * This is a special client-side Supabase client for the Admin page.
 * It sets a custom variable 'app.admin_user_id' in the database session.
 * This allows our RLS policies (in Supabase) to check if the person
 * making the request is the admin, and if so, grant them permission
 * to read all users' data.
 */
export const createAdminClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || !adminUserId) {
    console.error("Missing Supabase or Admin env variables for Admin Client");
    // Return a basic client to avoid crashing, but it will fail RLS checks
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        // This 'app.admin_user_id' variable is read by the RLS policies
        // in `current_setting('app.admin_user_id', true)`
        'x-app-admin-user-id': adminUserId,
      },
    },
  });
};