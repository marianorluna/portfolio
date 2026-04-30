"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/types/portfolio";

export function matchesPortfolioHome(pathname: string | null, locale: Locale): boolean {
  if (pathname == null || pathname === "") return false;
  const base = pathname.split("?", 1)[0] ?? pathname;
  return base === `/${locale}` || base === `/${locale}/`;
}

type PortfolioSceneLoadGateContextValue = {
  /** En la Home 3D, false hasta que la escena desactive la pantalla de carga inicial. */
  initialSceneLoadDismissed: boolean;
  notifyInitialSceneLoadDismissed: () => void;
};

const PortfolioSceneLoadGateContext = createContext<PortfolioSceneLoadGateContextValue | null>(
  null
);

type ProviderProps = { locale: Locale; children: ReactNode };

export function PortfolioSceneLoadGateProvider({ locale, children }: ProviderProps) {
  const pathname = usePathname();
  const isHomeRoute = matchesPortfolioHome(pathname, locale);
  const prevIsHomeRef = useRef<boolean | undefined>(undefined);
  const [sceneDismissNotified, setSceneDismissNotified] = useState(false);

  useEffect(() => {
    const prev = prevIsHomeRef.current;
    const enteredHome = prev !== undefined && !prev && isHomeRoute;
    const bootstrapHome = prev === undefined && isHomeRoute;
    if (bootstrapHome || enteredHome) {
      setSceneDismissNotified(false);
    }
    prevIsHomeRef.current = isHomeRoute;
  }, [isHomeRoute]);

  const notifyInitialSceneLoadDismissed = useCallback(() => {
    setSceneDismissNotified(true);
  }, []);

  const initialSceneLoadDismissed = !isHomeRoute || sceneDismissNotified;

  const value = useMemo(
    (): PortfolioSceneLoadGateContextValue => ({
      initialSceneLoadDismissed,
      notifyInitialSceneLoadDismissed,
    }),
    [initialSceneLoadDismissed, notifyInitialSceneLoadDismissed]
  );

  return (
    <PortfolioSceneLoadGateContext.Provider value={value}>
      {children}
    </PortfolioSceneLoadGateContext.Provider>
  );
}

export function usePortfolioSceneLoadGate(): PortfolioSceneLoadGateContextValue {
  const ctx = useContext(PortfolioSceneLoadGateContext);
  if (ctx == null) {
    throw new Error(
      "usePortfolioSceneLoadGate must be used within PortfolioSceneLoadGateProvider"
    );
  }
  return ctx;
}

export function useNotifyPortfolioSceneLoadDismissed(): () => void {
  const ctx = useContext(PortfolioSceneLoadGateContext);
  return ctx?.notifyInitialSceneLoadDismissed ?? (() => {});
}
