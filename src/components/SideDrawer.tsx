import type { ReactNode } from "react";

type Side = "left" | "right";

type Props = {
  side: Side;
  open: boolean;
  onToggle: () => void;
  tabLabel: string;
  children: ReactNode;
  className?: string;
};

export function SideDrawer({ side, open, onToggle, tabLabel, children, className }: Props) {
  const sideClass = side === "left" ? "side-drawer--left" : "side-drawer--right";
  const openClass = open ? "is-open" : "is-closed";
  const arrowDir: "left" | "right" =
    side === "left" ? (open ? "left" : "right") : open ? "right" : "left";

  return (
    <div className={`side-drawer ${sideClass} ${openClass} ${className ?? ""}`.trim()}>
      <div className="side-drawer__panel">{children}</div>
      <button
        className="side-drawer__tab"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={tabLabel}
      >
        <svg
          className="side-drawer__tab-icon"
          viewBox="0 0 24 24"
          aria-hidden
          focusable="false"
          data-dir={arrowDir}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

