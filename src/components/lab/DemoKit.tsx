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
  const preview = icon ?? "default";

  return (
    <article className="lab-feature" data-preview={preview}>
      <div className="lab-feature__preview" aria-hidden>
        <FeaturePreview kind={preview} />
      </div>
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

type FeaturePreviewKind = LabIconName | "default";

/** Mini UI placeholder CSS por tipo de feature (decorativo). */
function FeaturePreview({ kind }: { kind: FeaturePreviewKind }) {
  switch (kind) {
    case "radio":
      return (
        <div className="lab-feature-preview lab-feature-preview--radio">
          <span className="lab-feature-preview__pulse" />
          <span className="lab-feature-preview__pulse" />
          <span className="lab-feature-preview__pulse" />
          <span className="lab-feature-preview__bar" />
          <span className="lab-feature-preview__bar" />
          <span className="lab-feature-preview__bar" />
        </div>
      );
    case "eye":
      return (
        <div className="lab-feature-preview lab-feature-preview--eye">
          <span className="lab-feature-preview__viewport">
            <span className="lab-feature-preview__orbit" />
            <span className="lab-feature-preview__mesh" />
          </span>
        </div>
      );
    case "gauge":
      return (
        <div className="lab-feature-preview lab-feature-preview--gauge">
          <span className="lab-feature-preview__kpi" />
          <span className="lab-feature-preview__kpi" />
          <span className="lab-feature-preview__chart">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      );
    case "shield":
      return (
        <div className="lab-feature-preview lab-feature-preview--shield">
          <span className="lab-feature-preview__row is-ok" />
          <span className="lab-feature-preview__row is-warn" />
          <span className="lab-feature-preview__row is-ok" />
        </div>
      );
    case "sparkles":
      return (
        <div className="lab-feature-preview lab-feature-preview--sparkles">
          <span className="lab-feature-preview__bubble" />
          <span className="lab-feature-preview__bubble is-reply" />
          <span className="lab-feature-preview__cursor" />
        </div>
      );
    case "users":
      return (
        <div className="lab-feature-preview lab-feature-preview--users">
          <span className="lab-feature-preview__chip is-admin" />
          <span className="lab-feature-preview__chip is-guest" />
        </div>
      );
    default:
      return (
        <div className="lab-feature-preview lab-feature-preview--default">
          <span className="lab-feature-preview__block" />
          <span className="lab-feature-preview__block" />
          <span className="lab-feature-preview__block is-wide" />
        </div>
      );
  }
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

type DemoTryProps = {
  children: ReactNode;
};

/**
 * Sección “probar la demo”. El ancla del CTA del header vive en el `<h2 id="lab-try-demo">`.
 */
export function DemoTry({ children }: DemoTryProps) {
  return <section className="lab-try-demo">{children}</section>;
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

type DemoAccessProps = {
  email: string;
  password: string;
  emailLabel?: string;
  passwordLabel?: string;
  children?: ReactNode;
};

/** Credenciales públicas de acceso a la demo (rol invitado). */
export function DemoAccess({
  email,
  password,
  emailLabel = "Email",
  passwordLabel = "Password",
  children,
}: DemoAccessProps) {
  return (
    <aside className="lab-demo-access">
      <dl className="lab-demo-access__creds">
        <div className="lab-demo-access__row">
          <dt>{emailLabel}</dt>
          <dd>
            <code>{email}</code>
          </dd>
        </div>
        <div className="lab-demo-access__row">
          <dt>{passwordLabel}</dt>
          <dd>
            <code>{password}</code>
          </dd>
        </div>
      </dl>
      {children != null && <div className="lab-demo-access__note">{children}</div>}
    </aside>
  );
}

type StackItemProps = {
  layer: string;
  tool: string;
};

/** Parte el tool en chips legibles (`+` o `→`). */
function splitStackToolParts(tool: string): string[] {
  if (/\s*→\s*/.test(tool)) {
    return tool
      .split(/\s*→\s*/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  if (/\s\+\s/.test(tool)) {
    return tool
      .split(/\s*\+\s*/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  return [tool];
}

/** Fila de capa tecnológica para el kit demo. */
export function StackItem({ layer, tool }: StackItemProps) {
  const parts = splitStackToolParts(tool);
  const isFlow = /\s*→\s*/.test(tool);
  const joiner = isFlow ? "→" : "+";

  return (
    <li className="lab-stack-item">
      <span className="lab-stack-item__rail" aria-hidden />
      <span className="lab-stack-item__layer">{layer}</span>
      <span
        className={[
          "lab-stack-item__tool",
          parts.length > 1 ? "lab-stack-item__tool--parts" : "",
          isFlow ? "lab-stack-item__tool--flow" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {parts.length > 1 ? (
          parts.map((part, index) => (
            <span key={`${part}-${index}`} className="lab-stack-item__part">
              {index > 0 && (
                <span className="lab-stack-item__joiner" aria-hidden>
                  {joiner}
                </span>
              )}
              <span className="lab-stack-item__chip">{part}</span>
            </span>
          ))
        ) : (
          <span className="lab-stack-item__chip lab-stack-item__chip--solo">{tool}</span>
        )}
      </span>
    </li>
  );
}

type StackGridProps = {
  children: ReactNode;
};

/** Lista de stack (capa → herramienta) para demos. */
export function StackGrid({ children }: StackGridProps) {
  return <ul className="lab-stack-grid">{children}</ul>;
}
