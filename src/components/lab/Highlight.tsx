import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Párrafo importante con recuadro suave (sin icono; tono literario, no Callout). */
export function Highlight({ children }: Props) {
  return <aside className="lab-highlight">{children}</aside>;
}
