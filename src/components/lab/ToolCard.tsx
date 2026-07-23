import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  /** Nombres de tools MCP / APIs asociadas. */
  tools?: string[];
  children: ReactNode;
};

/** Card de caso de uso / tool (API tipo shadcn Card). */
export function ToolCardView({ icon: Icon, title, tools = [], children }: Props) {
  return (
    <article className="lab-tool-card">
      <header className="lab-tool-card__header">
        {Icon != null && (
          <span className="lab-tool-card__icon" aria-hidden>
            <Icon size={20} strokeWidth={1.8} />
          </span>
        )}
        <h3 className="lab-tool-card__title">{title}</h3>
      </header>
      <div className="lab-tool-card__body">{children}</div>
      {tools.length > 0 && (
        <ul className="lab-tool-card__tools">
          {tools.map((tool) => (
            <li key={tool}>
              <code>{tool}</code>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
