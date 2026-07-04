import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const sessionId = formData.get("sessionId");
  const titre = formData.get("titre");
  const description = formData.get("description");

  if (!(file instanceof File) || typeof sessionId !== "string" || typeof titre !== "string") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storagePath = `sessions/${sessionId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("session_documents").insert({
    session_id: sessionId,
    titre,
    description: typeof description === "string" && description ? description : null,
    storage_path: storagePath,
    taille: file.size,
    type_mime: file.type || null,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/espace-stagiaire/documents");

  return NextResponse.json({ success: true });
}
