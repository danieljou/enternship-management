"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

function isItemActive(pathname: string, href: string, exact?: boolean) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav({
  primaryItems,
  moreItems,
  homeHref,
}: {
  primaryItems: MobileNavItem[];
  moreItems: MobileNavItem[];
  homeHref: string;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const [leftItems, rightItems] = [
    primaryItems.slice(0, 2),
    primaryItems.slice(2, 4),
  ];
  const moreActive = moreItems.some((item) =>
    isItemActive(pathname, item.href),
  );

  function renderItem(item: MobileNavItem) {
    const active = isItemActive(pathname, item.href, item.href === homeHref);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1"
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200",
            active && "bg-primary/10",
          )}
        >
          <Icon
            className={cn(
              "h-[21px] w-[21px] transition-all duration-200 motion-safe:will-change-transform",
              active ? "scale-105 text-primary" : "text-muted-foreground",
            )}
            strokeWidth={active ? 2.4 : 2}
          />
        </span>
        <span
          className={cn(
            "text-[10.5px] leading-none font-medium transition-colors duration-200 text-center",
            active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {t(item.labelKey)}
        </span>
      </Link>
    );
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md supports-backdrop-filter:bg-background/80 md:hidden dark:shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)]"
        aria-label={t("mobileNav.navigation")}
      >
        <div className="relative mx-auto flex max-w-md items-stretch">
          {leftItems.map(renderItem)}

          <div className="flex w-16 shrink-0 flex-col items-center justify-end pb-1.5">
            {moreItems.length > 0 && (
              <span
                className={cn(
                  "text-[10.5px] leading-none font-medium transition-colors duration-200",
                  moreActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {t("mobileNav.more")}
              </span>
            )}
          </div>

          {rightItems.map(renderItem)}
        </div>

        {moreItems.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label={t("mobileNav.more")}
            className={cn(
              "absolute left-1/2 -top-5 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-primary-foreground shadow-lg ring-4 ring-background transition-transform duration-150 active:scale-90",
              moreActive ? "bg-primary" : "bg-primary/90",
            )}
          >
            <LayoutGrid className="h-6 w-6" strokeWidth={2.2} />
          </button>
        )}
      </nav>

      {moreItems.length > 0 && (
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
          >
            <SheetHeader>
              <SheetTitle>{t("mobileNav.more")}</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-2 px-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors active:bg-accent"
                  >
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        "text-[11px] leading-tight font-medium text-center",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {t(item.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
