"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Safety net for the implicit auth flow: if a Supabase recovery link's
 * redirect_to isn't in the project's allow-list, it falls back to the bare
 * site URL with the session tokens in the hash fragment (`#access_token=...
 * &type=recovery`), which the server never sees. Forward it to
 * /reset-password so the tokens still reach the page that can use them.
 */
export function RecoveryLinkFallback() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      router.replace(`/reset-password${window.location.hash}`);
    }
  }, [router]);

  return null;
}
