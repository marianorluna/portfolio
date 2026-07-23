"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LabTocItem = {
  id: string;
  label: string;
};

type LabSectionTabsContextValue = {
  activeId: string;
  setActiveId: (id: string) => void;
  items: LabTocItem[];
  tabIdPrefix: string;
};

const LabSectionTabsContext = createContext<LabSectionTabsContextValue | null>(null);

export function useLabSectionTabs(): LabSectionTabsContextValue | null {
  return useContext(LabSectionTabsContext);
}

type Props = {
  items: LabTocItem[];
  ariaLabel: string;
  children: ReactNode;
};

/**
 * Tabs a ancho completo del shell tutorial: cada tab muestra solo su `<Section>`.
 * La barra de tabs es sticky dentro del scroll de `.lab-page`.
 */
export function LabSectionTabs({ items, ariaLabel, children }: Props) {
  const tabIdPrefix = useId();
  const [activeId, setActiveIdState] = useState(items[0]?.id ?? "");
  const resolvedId = items.some((item) => item.id === activeId)
    ? activeId
    : (items[0]?.id ?? "");

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const value = useMemo(
    () => ({ activeId: resolvedId, setActiveId, items, tabIdPrefix }),
    [resolvedId, setActiveId, items, tabIdPrefix]
  );

  if (items.length === 0) return <>{children}</>;

  return (
    <LabSectionTabsContext.Provider value={value}>
      <div className="lab-section-tabs-root">
        <div className="lab-section-tabs-sticky">
          <div
            className="lab-section-tabs"
            role="tablist"
            aria-label={ariaLabel}
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((item) => {
              const selected = item.id === resolvedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${tabIdPrefix}-tab-${item.id}`}
                  className={`lab-section-tabs__tab${selected ? " is-active" : ""}`}
                  aria-selected={selected}
                  aria-controls={item.id}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(item.id)}
                >
                  <span className="lab-section-tabs__label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {children}
      </div>
    </LabSectionTabsContext.Provider>
  );
}
