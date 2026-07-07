"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/**
 * Safety net for Supabase's implicit-flow auth links: invites always use
 * this format (PKCE isn't supported for `inviteUserByEmail`), and a recovery
 * link whose redirect_to isn't allow-listed also falls back to it. Either
 * way the tokens arrive as `#access_token=...&refresh_token=...&type=...`
 * on this bare domain instead of a server-visible `?code=`.
 *
 * The browser client is configured for PKCE (forced by @supabase/ssr), so
 * its automatic hash detection throws them out as a flow-type mismatch
 * instead of establishing a session. We parse the hash ourselves and call
 * `setSession` directly, which doesn't care about flowType.
 */
export function AuthHashFallback() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!accessToken || !refreshToken) return;

    const next = type === "invite" ? "/set-password" : "/reset-password";

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        router.replace(error ? `${next}?error=invalid_link` : next);
      });
  }, [router]);

  return null;
}
