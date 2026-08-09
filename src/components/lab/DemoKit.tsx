import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Boxes,
  Code2,
  Cuboid,
  Eye,
  Gauge,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

/** Iconos permitidos en MDX por nombre (string), sin pasar componentes. */
export const LAB_ICONS = {
  python: Terminal,
  cuboid: Cuboid,
  search: Search,
  boxes: Boxes,
  palette: Palette,
  code: Code2,
  sparkles: Sparkles,
  book: BookOpen,
  radio: Radio,
  eye: Eye,
  gauge: Gauge,
  activity: Activity,
  shield: ShieldCheck,
  message: MessageSquare,
  users: Users,
  dashboard: LayoutDashboard,
} as const;

export type LabIconName = keyof typeof LAB_ICONS;

type FeatureProps = {
  icon?: LabIconName;
  title: string;
  children: ReactNode;
};

/** Feature individual del kit demo (cuerpo libre en MDX). */
export function Feature({ icon, title, children }: FeatureProps) {
  const Icon: LucideIcon | undefined = icon != null ? LAB_ICONS[icon] : undefined;
  return (
    <article className="lab-feature">
      <div className="lab-feature__header">
        {Icon != null && (
          <span className="lab-feature__icon" aria-hidden>
            <Icon size={20} strokeWidth={1.75} />
          </span>
        )}
        <h3 className="lab-feature__title">{title}</h3>
      </div>
      <div className="lab-feature__body">{children}</div>
    </article>
  );
}

type FeatureGridProps = {
  children: ReactNode;
};

/** Grid responsive de features para demos. */
export function FeatureGrid({ children }: FeatureGridProps) {
  return <div className="lab-feature-grid">{children}</div>;
}

type TryItProps = {
  href: string;
  label: string;
};

/** CTA inline hacia la demo live o recurso externo. */
export function TryIt({ href, label }: TryItProps) {
  return (
    <p className="lab-try-it">
      <a href={href} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </p>
  );
}

type RoleCardProps = {
  role: "admin" | "guest";
  title: string;
  children: ReactNode;
};

/** Card de rol (admin / invitado) para demos con cuotas o permisos. */
export function RoleCard({ role, title, children }: RoleCardProps) {
  return (
    <aside className={`lab-role-card lab-role-card--${role}`}>
      <h3 className="lab-role-card__title">{title}</h3>
      <div className="lab-role-card__body">{children}</div>
    </aside>
  );
}
