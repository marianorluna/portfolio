import type { ReactNode } from "react";

type Props = {
  number: number;
  title: string;
  children: ReactNode;
};

/** Paso numerado de un tutorial/guía. Siempre visible (sin acordeón) para no exigir descubrir interacción. */
export function Step({ number, title, children }: Props) {
  return (
    <section className="lab-step" aria-labelledby={`lab-step-${number}-title`}>
      <header className="lab-step__header">
        <span className="lab-step__number" aria-hidden>
          {number}
        </span>
        <h3 className="lab-step__title" id={`lab-step-${number}-title`}>
          {title}
        </h3>
      </header>
      <div className="lab-step__body">{children}</div>
    </section>
  );
}
