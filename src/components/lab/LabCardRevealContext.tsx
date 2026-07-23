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

type LabCardRevealContextValue = {
  activeId: string | null;
  reveal: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
};

const LabCardRevealContext = createContext<LabCardRevealContextValue | null>(null);

const noop = () => undefined;

/** Provider: solo una card del bento puede estar revelada a la vez (touch). */
export function LabCardRevealProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const reveal = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const toggle = useCallback((id: string) => {
    setActiveId((current) => (current === id ? null : id));
  }, []);

  const clear = useCallback(() => {
    setActiveId(null);
  }, []);

  const value = useMemo(
    () => ({ activeId, reveal, toggle, clear }),
    [activeId, reveal, toggle, clear]
  );

  return (
    <LabCardRevealContext.Provider value={value}>{children}</LabCardRevealContext.Provider>
  );
}

/** Estado de revelado exclusivo compartido entre cards del Lab. */
export function useLabCardReveal(): {
  revealed: boolean;
  reveal: () => void;
  toggle: () => void;
} {
  const ctx = useContext(LabCardRevealContext);
  const id = useId();
  const [localRevealed, setLocalRevealed] = useState(false);

  if (ctx == null) {
    return {
      revealed: localRevealed,
      reveal: () => setLocalRevealed(true),
      toggle: () => setLocalRevealed((current) => !current),
    };
  }

  return {
    revealed: ctx.activeId === id,
    reveal: () => ctx.reveal(id),
    toggle: () => ctx.toggle(id),
  };
}

export function useLabCardRevealClear(): () => void {
  const ctx = useContext(LabCardRevealContext);
  return ctx?.clear ?? noop;
}
