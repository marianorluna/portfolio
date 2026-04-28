import type { NavIconName } from "@/types/portfolio";
import { Calendar, Folder, Layers, Mail, type LucideIcon } from "lucide-react";

const SIZE = 22;

type Props = {
  name: NavIconName;
  className?: string;
  title?: string;
};

export function NavIcon({ name, className, title }: Props) {
  const iconMap: Record<NavIconName, LucideIcon> = {
    folder: Folder,
    layers: Layers,
    calendar: Calendar,
    mail: Mail,
  };
  const Icon = iconMap[name];

  return (
    <Icon
      size={SIZE}
      strokeWidth={1.6}
      className={className}
      aria-hidden={!title}
      aria-label={title}
    />
  );
}
