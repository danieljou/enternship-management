"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarRange,
  ListChecks,
  Pencil,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  RoadmapInstanceWithRelations,
  RoadmapSemaineWithEtapes,
  RoadmapStatut,
  RoadmapTemplate,
  Stagiaire,
} from "@/lib/types";

import { setRoadmapStatus } from "../actions";
import { RoadmapFormDialog } from "../roadmap-form-dialog";
import { RoadmapContentTab } from "./roadmap-content-tab";
import { RoadmapInstancesTab } from "./roadmap-instances-tab";

const STATUT_CLASSES: Record<RoadmapStatut, string> = {
  brouillon: "bg-muted text-muted-foreground",
  publie: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archive: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const NEXT_STATUTS: Record<RoadmapStatut, RoadmapStatut[]> = {
  brouillon: ["publie", "archive"],
  publie: ["archive"],
  archive: ["publie", "brouillon"],
};

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/50 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-lg leading-tight font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function RoadmapDetail({
  template,
  semaines,
  instances,
  stagiaires,
}: {
  template: RoadmapTemplate;
  semaines: RoadmapSemaineWithEtapes[];
  instances: RoadmapInstanceWithRelations[];
  stagiaires: Pick<Stagiaire, "id" | "nom" | "prenom" | "email">[];
}) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const totalEtapes = useMemo(
    () => semaines.reduce((sum, semaine) => sum + semaine.etapes.length, 0),
    [semaines],
  );

  async function handleStatusChange(statut: RoadmapStatut) {
    setIsChangingStatus(true);
    const result = await setRoadmapStatus(template.id, statut);
    setIsChangingStatus(false);
    if ("error" in result) {
      toast.error(t(result.error));
      return;
    }
    toast.success(t("roadmaps.status_updated"));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/roadmaps"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("roadmaps.back_to_list")}
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {template.titre}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    STATUT_CLASSES[template.statut],
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {t(`roadmaps.statut_${template.statut}`)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>{template.branche}</span>
                {template.niveau && (
                  <>
                    <span className="text-border">·</span>
                    <span>{template.niveau}</span>
                  </>
                )}
                <span className="text-border">·</span>
                <span>
                  {t("roadmaps.duree_value", {
                    count: template.duree_semaines,
                  })}
                </span>
                <span className="text-border">·</span>
                <span>v{template.version}</span>
              </div>
              {template.note && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {template.note}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {NEXT_STATUTS[template.statut].map((statut) => (
                <Button
                  key={statut}
                  variant="outline"
                  size="sm"
                  disabled={isChangingStatus}
                  onClick={() => handleStatusChange(statut)}
                >
                  {t(`roadmaps.action_set_${statut}`)}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-3 sm:max-w-lg">
            <StatTile
              icon={CalendarRange}
              label={t("roadmaps.kpi_semaines")}
              value={semaines.length}
            />
            <StatTile
              icon={ListChecks}
              label={t("roadmaps.kpi_etapes")}
              value={totalEtapes}
            />
            <StatTile
              icon={Users}
              label={t("roadmaps.kpi_stagiaires")}
              value={instances.length}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="contenu">
        <TabsList>
          <TabsTrigger value="contenu">{t("roadmaps.tab_contenu")}</TabsTrigger>
          <TabsTrigger value="stagiaires">
            {t("roadmaps.tab_stagiaires")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contenu" className="mt-4">
          <RoadmapContentTab roadmapId={template.id} semaines={semaines} />
        </TabsContent>

        <TabsContent value="stagiaires" className="mt-4">
          <RoadmapInstancesTab
            templateId={template.id}
            templateStatut={template.statut}
            instances={instances}
            stagiaires={stagiaires}
          />
        </TabsContent>
      </Tabs>

      <RoadmapFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        roadmap={template}
      />
    </div>
  );
}
