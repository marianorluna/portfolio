"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavBrand, NavLink } from "@/types/portfolio";
import { NavIcon } from "./NavIcon";

type Props = {
  brand: NavBrand;
  links: NavLink[];
};

export function Navbar({ brand, links }: Props) {
  const railRef = useRef<HTMLElement | null>(null);
  const [activePanel, setActivePanel] = useState<"brand" | string | null>(null);

  const isBrandOpen = activePanel === "brand";
  const openLink = activePanel && activePanel !== "brand" ? links.find(l => l.id === activePanel) : undefined;

  useEffect(() => {
    if (activePanel == null) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target;
      if (t instanceof Node && railRef.current?.contains(t)) return;
      setActivePanel(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [activePanel]);

  const fullNameA11y = `${brand.nameMain} ${brand.nameRest}`;
  const flyoutLabel =
    isBrandOpen
      ? "Marca del sitio"
      : openLink
        ? openLink.label
        : "Panel";

  return (
    <aside className="nav-rail" ref={railRef} aria-label="Navegación">
      <button
        type="button"
        className={`nav-rail__brand nav-rail__brand--action${isBrandOpen ? " is-active" : ""}`}
        onClick={() => setActivePanel(p => (p === "brand" ? null : "brand"))}
        title={`${brand.nameMain}${brand.nameJoin}${brand.nameRest} | ${brand.tagline}`}
        aria-expanded={isBrandOpen}
        aria-controls="nav-flyout"
      >
        <span className="nav-rail__brand-mark" aria-hidden>
          {brand.initials}
        </span>
        <span className="visually-hidden">Marca: {fullNameA11y}</span>
      </button>
      <nav className="nav-rail__tabs" aria-label="Secciones">
        {links.map(link => {
          const isOpen = activePanel === link.id;
          return (
            <button
              key={link.id}
              type="button"
              className={`nav-rail__icon-btn${isOpen ? " is-active" : ""}`}
              onClick={() => setActivePanel(p => (p === link.id ? null : link.id))}
              aria-expanded={isOpen}
              aria-controls="nav-flyout"
              title={link.label}
            >
              <span className="nav-rail__icon-pill" aria-hidden />
              <NavIcon name={link.icon} title={link.label} />
            </button>
          );
        })}
      </nav>

      <div
        id="nav-flyout"
        className={`nav-rail__flyout${activePanel != null ? " is-open" : ""}`}
        aria-hidden={activePanel == null}
        role="region"
        aria-label={flyoutLabel}
      >
        {isBrandOpen && (
          <div className="nav-rail__flyout-inner nav-rail__flyout-inner--brand">
            <div className="nav-flyout-brand" aria-label={fullNameA11y}>
              <p className="nav-flyout-brand__line1">
                <Link
                  href="/"
                  className="nav-flyout-brand__title-link"
                  onClick={() => setActivePanel(null)}
                >
                  <span className="nav-flyout-brand__name-main">{brand.nameMain}</span>
                  <span className="nav-flyout-brand__name-join">{brand.nameJoin}</span>
                  <span className="nav-flyout-brand__name-rest">{brand.nameRest}</span>
                </Link>
              </p>
              <p className="nav-flyout-brand__line2">{brand.tagline}</p>
            </div>
          </div>
        )}
        {openLink && (
          <div className="nav-rail__flyout-inner">
            <p className="nav-rail__flyout-kicker">Sección</p>
            <h2 className="nav-rail__flyout-title">{openLink.label}</h2>
            <p className="nav-rail__flyout-desc">{openLink.description}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
