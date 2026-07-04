import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationType } from "@/lib/types";

interface CreateNotificationsInput {
  userIds: (string | null | undefined)[];
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}

export async function createNotifications({
  userIds,
  type,
  title,
  body,
  link,
}: CreateNotificationsInput) {
  const uniqueIds = Array.from(new Set(userIds.filter((id): id is string => !!id)));
  if (uniqueIds.length === 0) return;

  const admin = createAdminClient();
  await admin.from("notifications").insert(
    uniqueIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    }))
  );
}

export async function getAdminUserIds(excludeUserId?: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((row) => row.id).filter((id) => id !== excludeUserId);
}

export async function getAllUserIds(excludeUserId?: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id");
  return (data ?? []).map((row) => row.id).filter((id) => id !== excludeUserId);
}
