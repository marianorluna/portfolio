"use client";

import { createContext, useContext, type ReactNode } from "react";

const LabDemoStageContext = createContext<ReactNode>(null);

type ProviderProps = {
  stage: ReactNode;
  children: ReactNode;
};

/**
 * Proveedor del escenario multimedia del shell demo.
 * El MDX lo inserta con `<DemoStage />` donde corresponda en el flujo.
 */
export function LabDemoStageProvider({ stage, children }: ProviderProps) {
  return (
    <LabDemoStageContext.Provider value={stage}>{children}</LabDemoStageContext.Provider>
  );
}

/** Ancla MDX: renderiza el media stage en este punto del artículo. */
export function DemoStage() {
  const stage = useContext(LabDemoStageContext);
  if (stage == null) return null;
  return <>{stage}</>;
}
