"use client";

import { type Table } from "@tanstack/react-table";
import { Columns3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
  const { t } = useTranslation();
  const toggleable = table.getAllColumns().filter((c) => c.getCanHide());
  if (toggleable.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto gap-1.5 rounded-sm">
          <Columns3 className="h-3.5 w-3.5" />
          {t("table.columns")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {t("table.columnsVisible")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {toggleable.map((col) => {
          const meta = col.columnDef.meta as { title?: string } | undefined;
          const label = meta?.title ?? col.id;

          return (
            <DropdownMenuCheckboxItem
              key={col.id}
              className="text-xs"
              checked={col.getIsVisible()}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(value) => col.toggleVisibility(!!value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
