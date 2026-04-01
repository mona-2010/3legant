import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client — bypasses Row Level Security.
 * Use ONLY in trusted server-side contexts (e.g. Stripe webhooks).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Admin Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  return supabaseCreateClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
