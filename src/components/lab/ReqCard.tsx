import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  /** Nombre de icono Lucide pasado desde MDX vía mapa en el componente. */
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
};

/**
 * Card de requisito previo (API tipo shadcn Card).
 * En MDX se usa con `icon` resuelto por nombre vía wrapper `ReqCard`.
 */
export function ReqCardView({ icon: Icon, title, children }: Props) {
  return (
    <article className="lab-req-card">
      <header className="lab-req-card__header">
        {Icon != null && (
          <span className="lab-req-card__icon" aria-hidden>
            <Icon size={20} strokeWidth={1.8} />
          </span>
        )}
        <h3 className="lab-req-card__title">{title}</h3>
      </header>
      <div className="lab-req-card__body">{children}</div>
    </article>
  );
}
