import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-base text-foreground shadow-xs transition-[color,box-shadow,border-color,background-color] duration-150 outline-none placeholder:text-muted-foreground/70 hover:border-border focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 md:text-sm dark:border-white/10 dark:bg-white/4 dark:hover:border-white/15 dark:focus-visible:bg-white/6 dark:disabled:bg-white/2 dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
