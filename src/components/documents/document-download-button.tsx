"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DocumentDownloadButton({
  storagePath,
  filename,
}: {
  storagePath: string;
  filename: string;
}) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("documents").download(storagePath);

    if (error || !data) {
      toast.error(t("documents.download_error"));
      setIsDownloading(false);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
