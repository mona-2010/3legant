import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore;
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options);
            }
          } catch {
            // Silently ignore failures in read-only contexts
          }
        },
      },
    },
  );
};