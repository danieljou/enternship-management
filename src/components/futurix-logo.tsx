import { cn } from "@/lib/utils";

export function FuturixLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        F
      </span>
      <span className="flex items-baseline gap-1.5 text-lg font-semibold tracking-tight text-foreground">
        FUTURIX
        <span className="text-primary">iTech</span>
      </span>
    </div>
  );
}
