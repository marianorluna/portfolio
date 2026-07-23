"use client";

import type { ReactNode } from "react";
import { useLabSectionTabs } from "./LabSectionTabs";

type Props = {
  id: string;
  children: ReactNode;
};

/**
 * Sección del MDX. Con tabs del shell tutorial, solo el panel activo es visible.
 * Sin provider de tabs, se comporta como bloque normal.
 */
export function Section({ id, children }: Props) {
  const tabs = useLabSectionTabs();
  const isActive = tabs == null || tabs.activeId === id;
  const labelledBy =
    tabs != null ? `${tabs.tabIdPrefix}-tab-${id}` : undefined;

  return (
    <section
      id={id}
      className="lab-section"
      role={tabs != null ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      hidden={tabs != null ? !isActive : undefined}
    >
      {children}
    </section>
  );
}
