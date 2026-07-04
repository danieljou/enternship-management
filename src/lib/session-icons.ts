import {
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Presentation,
  Rocket,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

export const SESSION_ETAPE_ICONS = [
  { value: "rocket", icon: Rocket },
  { value: "graduation-cap", icon: GraduationCap },
  { value: "clipboard-list", icon: ClipboardList },
  { value: "presentation", icon: Presentation },
  { value: "check-circle", icon: CheckCircle2 },
  { value: "file-text", icon: FileText },
  { value: "users", icon: Users },
  { value: "target", icon: Target },
] as const satisfies { value: string; icon: LucideIcon }[];

const ICON_MAP = new Map<string, LucideIcon>(
  SESSION_ETAPE_ICONS.map((item) => [item.value, item.icon])
);

export function getSessionEtapeIcon(value: string): LucideIcon {
  return ICON_MAP.get(value) ?? Target;
}
