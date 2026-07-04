"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Check, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SessionStagiaireWithRelations, Stagiaire } from "@/lib/types";

import { enrollStagiaires, unenrollStagiaire } from "../actions";

export function SessionStagiairesManager({
  sessionId,
  enrolled,
  available,
}: {
  sessionId: string;
  enrolled: SessionStagiaireWithRelations[];
  available: Pick<Stagiaire, "id" | "nom" | "prenom" | "email">[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await enrollStagiaires(sessionId, ids);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("sessions.enroll_success"));
      }
      setSelected(new Set());
      setPopoverOpen(false);
    });
  }

  function handleRemove(stagiaireId: string) {
    setRemoving(stagiaireId);
    startTransition(async () => {
      const result = await unenrollStagiaire(sessionId, stagiaireId);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("sessions.unenroll_success"));
      }
      setRemoving(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("sessions.stagiaires_description")}</p>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4" />
              {t("sessions.enroll_button")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder={t("sessions.enroll_search_placeholder")} />
              <CommandList>
                <CommandEmpty>{t("table.empty")}</CommandEmpty>
                <CommandGroup>
                  {available.map((stagiaire) => {
                    const isSelected = selected.has(stagiaire.id);
                    return (
                      <CommandItem
                        key={stagiaire.id}
                        value={`${stagiaire.prenom} ${stagiaire.nom} ${stagiaire.email}`}
                        onSelect={() => toggle(stagiaire.id)}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                            isSelected ? "border-primary bg-primary" : "border-input"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </span>
                        <span className="truncate">
                          {stagiaire.prenom} {stagiaire.nom}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              {selected.size > 0 && (
                <div className="flex justify-end border-t p-2">
                  <Button size="sm" disabled={isPending} onClick={handleAdd}>
                    {t("sessions.enroll_confirm")} ({selected.size})
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {enrolled.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("sessions.stagiaires_empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {enrolled.map(({ stagiaire_id, stagiaire }) => (
            <li
              key={stagiaire_id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {stagiaire ? `${stagiaire.prenom} ${stagiaire.nom}` : "—"}
                </p>
                {stagiaire && (
                  <p className="truncate text-xs text-muted-foreground">{stagiaire.email}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending && removing === stagiaire_id}
                onClick={() => handleRemove(stagiaire_id)}
                aria-label={t("sessions.unenroll_button")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
