export type PaiementStatus = "impaye" | "partiel" | "paye";

export function computePaiementStatus(due: number | null, paid: number): PaiementStatus {
  if (!due || due <= 0) return paid > 0 ? "paye" : "impaye";
  if (paid <= 0) return "impaye";
  if (paid >= due) return "paye";
  return "partiel";
}

export function getPaiementStatusClasses(status: PaiementStatus): string {
  switch (status) {
    case "paye":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "partiel":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "impaye":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
  }
}

export function formatMontant(value: number): string {
  return `${value.toLocaleString()} FCFA`;
}
