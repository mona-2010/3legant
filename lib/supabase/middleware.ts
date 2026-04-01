import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Call getUser() to refresh expired sessions (not getClaims, which doesn't refresh)
  const { data: { user } } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/sign-in') &&
    !request.nextUrl.pathname.startsWith('/sign-up') &&
    !request.nextUrl.pathname.startsWith('/reset') &&
    !request.nextUrl.pathname.startsWith('/forget-password') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/shop') &&
    !request.nextUrl.pathname.startsWith('/blog') &&
    !request.nextUrl.pathname.startsWith('/shop') &&
    !request.nextUrl.pathname.startsWith('/contact-us') &&
    !request.nextUrl.pathname.startsWith('/product') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  return supabaseResponse

};