"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

import { DocumentDownloadButton } from "@/components/documents/document-download-button";
import { formatFileSize } from "@/lib/utils";
import type { SessionDocumentWithSession } from "@/lib/types";

export function DocumentsList({ documents }: { documents: SessionDocumentWithSession[] }) {
  const { t } = useTranslation();

  const groups = useMemo(() => {
    const map = new Map<string, { nom: string; documents: SessionDocumentWithSession[] }>();
    for (const doc of documents) {
      const key = doc.session_id;
      const nom = doc.session?.nom ?? t("stagiaireEvaluations.unknown_session");
      if (!map.has(key)) map.set(key, { nom, documents: [] });
      map.get(key)!.documents.push(doc);
    }
    return Array.from(map.values());
  }, [documents, t]);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.nom} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground">{group.nom}</h2>
          <ul className="flex flex-col gap-2">
            {group.documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{doc.titre}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatFileSize(doc.taille)} · {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                  {doc.description && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{doc.description}</p>
                  )}
                </div>
                <DocumentDownloadButton storagePath={doc.storage_path} filename={doc.titre} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
