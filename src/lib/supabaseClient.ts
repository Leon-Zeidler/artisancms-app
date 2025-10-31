// src/lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// IMPORTANT: We are no longer creating a "singleton" client here.
// Instead, we are exporting a function that creates a new client
// every time it's needed in a component. This is the modern
// Next.js App Router pattern for Supabase.

// We can also just export the function directly
export const supabase = createClientComponentClient();

// If you want to be more explicit, you can do this:
// const createClient = () => createClientComponentClient();
// export const supabase = createClient();
