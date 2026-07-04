"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DocumentDownloadButton } from "@/components/documents/document-download-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatFileSize } from "@/lib/utils";
import type { SessionDocument } from "@/lib/types";

import { deleteSessionDocument } from "../actions";

export function SessionDocumentsTab({
  sessionId,
  documents,
}: {
  sessionId: string;
  documents: SessionDocument[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<SessionDocument | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("sessionId", sessionId);

    if (!(formData.get("file") as File)?.size) {
      toast.error(t("sessions.document_file_required"));
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error(t("sessions.document_create_error"));
        return;
      }

      toast.success(t("sessions.document_create_success"));
      formRef.current?.reset();
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteSessionDocument(target.id, sessionId, target.storage_path);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("sessions.document_delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border bg-card p-4"
      >
        <p className="text-sm text-muted-foreground">{t("sessions.documents_description")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="document-titre">{t("sessions.document_titre_label")}</Label>
            <Input
              id="document-titre"
              name="titre"
              required
              placeholder={t("sessions.document_titre_placeholder")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="document-file">{t("sessions.document_file_label")}</Label>
            <Input id="document-file" name="file" type="file" required />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="document-description">{t("sessions.document_description_label")}</Label>
          <Textarea id="document-description" name="description" />
        </div>
        <div>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? t("sessions.document_uploading") : t("sessions.document_upload_button")}
          </Button>
        </div>
      </form>

      {documents.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("sessions.documents_empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.titre}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatFileSize(doc.taille)} · {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <DocumentDownloadButton storagePath={doc.storage_path} filename={doc.titre} />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleting(doc)}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sessions.document_delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
