export interface SessionColorClasses {
  soft: string;
  accent: string;
  border: string;
}

export const SESSION_ETAPE_COLORS: { value: string; classes: SessionColorClasses }[] = [
  {
    value: "cyan",
    classes: {
      soft: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      accent: "bg-cyan-500",
      border: "border-cyan-500/30",
    },
  },
  {
    value: "violet",
    classes: {
      soft: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      accent: "bg-violet-500",
      border: "border-violet-500/30",
    },
  },
  {
    value: "amber",
    classes: {
      soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      accent: "bg-amber-500",
      border: "border-amber-500/30",
    },
  },
  {
    value: "rose",
    classes: {
      soft: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      accent: "bg-rose-500",
      border: "border-rose-500/30",
    },
  },
  {
    value: "emerald",
    classes: {
      soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      accent: "bg-emerald-500",
      border: "border-emerald-500/30",
    },
  },
  {
    value: "blue",
    classes: {
      soft: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      accent: "bg-blue-500",
      border: "border-blue-500/30",
    },
  },
];

const COLOR_MAP = new Map(SESSION_ETAPE_COLORS.map((item) => [item.value, item.classes]));

export function getSessionEtapeColorClasses(value: string): SessionColorClasses {
  return COLOR_MAP.get(value) ?? SESSION_ETAPE_COLORS[0].classes;
}
