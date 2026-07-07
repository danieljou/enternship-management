import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Supabase's PKCE email links (recovery, invite) land here with a `code`
 * query param that must be exchanged for a session before the destination
 * page can call `auth.updateUser()`. Without this step the session is never
 * established and the reset/invite form always reports an invalid link.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/confirm] exchangeCodeForSession failed:", error.message);
  } else {
    console.error("[auth/confirm] no code in URL:", request.url);
  }

  const errorRedirect = new URL(next, origin);
  errorRedirect.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(errorRedirect);
}
