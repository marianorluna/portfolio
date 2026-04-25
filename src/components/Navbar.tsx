"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavBrand, NavLink, NavUiText, PortfolioData } from "@/types/portfolio";
import { NavIcon } from "./NavIcon";
import type { SceneTheme } from "@/config/scene-theme";

type Props = {
  brand:          NavBrand;
  links:          NavLink[];
  projects:       PortfolioData["projects"];
  uiText:         NavUiText;
  theme:          SceneTheme;
  onThemeToggle:  () => void;
  onProjectSelect: (project: PortfolioData["projects"]["categories"][number]["items"][number]) => void;
};

export function Navbar({ brand, links, projects, uiText, theme, onThemeToggle, onProjectSelect }: Props) {
  const railRef = useRef<HTMLElement | null>(null);
  const [activePanel, setActivePanel] = useState<"brand" | string | null>(null);
  const aboutParagraphs = brand.aboutText
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean);
  const leadParagraph = aboutParagraphs[0] ?? "";
  const bodyParagraph = aboutParagraphs[1] ?? "";

  const isBrandOpen   = activePanel === "brand";
  const isSettingsOpen = activePanel === "settings";
  const openLink = activePanel && activePanel !== "brand" && activePanel !== "settings"
    ? links.find(l => l.id === activePanel)
    : undefined;

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
      ? uiText.siteBrandLabel
      : isSettingsOpen
        ? uiText.settingsLabel
        : openLink
          ? openLink.label
          : uiText.panelFallbackLabel;

  return (
    <aside className="nav-rail" ref={railRef} aria-label={uiText.railAriaLabel}>
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
        <span className="visually-hidden">{uiText.brandScreenReaderPrefix} {fullNameA11y}</span>
      </button>

      <nav className="nav-rail__tabs" aria-label={uiText.sectionsAriaLabel}>
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

      {/* Botón de configuración — ancla al fondo del rail */}
      <button
        type="button"
        className={`nav-rail__icon-btn nav-rail__settings-btn${isSettingsOpen ? " is-active" : ""}`}
        onClick={() => setActivePanel(p => (p === "settings" ? null : "settings"))}
        aria-expanded={isSettingsOpen}
        aria-controls="nav-flyout"
        title={uiText.settingsLabel}
      >
        <span className="nav-rail__icon-pill" aria-hidden />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="3.1" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.5 1.5 0 1 1-2.1 2.1l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V19a1.5 1.5 0 1 1-3 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.5 1.5 0 1 1-2.1-2.1l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H5a1.5 1.5 0 1 1 0-3h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.5 1.5 0 1 1 2.1-2.1l.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V5a1.5 1.5 0 1 1 3 0v.1a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a1.5 1.5 0 1 1 2.1 2.1l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6H19a1.5 1.5 0 1 1 0 3h-.1a1 1 0 0 0-.9.6Z" />
        </svg>
      </button>

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
                <span className="nav-flyout-brand__title-card">
                  <Link
                    href="/"
                    className="nav-flyout-brand__title-link"
                    onClick={() => setActivePanel(null)}
                  >
                    <span className="nav-flyout-brand__name-main">{brand.nameMain}</span>
                    <span className="nav-flyout-brand__name-join">{brand.nameJoin}</span>
                    <span className="nav-flyout-brand__name-rest">{brand.nameRest}</span>
                  </Link>
                </span>
              </p>
              <section className="nav-flyout-about" aria-label={brand.aboutKicker}>
                <p className="nav-flyout-about__kicker">{brand.aboutKicker}</p>
                <p className="nav-flyout-about__role">{brand.aboutRole}</p>
                <p className="nav-flyout-about__lead">{leadParagraph}</p>
                {bodyParagraph && <p className="nav-flyout-about__text">{bodyParagraph}</p>}
                {brand.aboutStatement && (
                  <p className="nav-flyout-about__statement">{brand.aboutStatement}</p>
                )}
              </section>
            </div>
          </div>
        )}
        {openLink && (
          <div className={`nav-rail__flyout-inner${openLink.id === "proyectos" ? " nav-rail__flyout-inner--projects" : ""}`}>
            <p className="nav-rail__flyout-kicker">{uiText.sectionKicker}</p>
            <h2 className="nav-rail__flyout-title">{openLink.label}</h2>
            <p className="nav-rail__flyout-desc">{openLink.description}</p>
            {openLink.id === "proyectos" && (
              <div className="nav-projects">
                {projects.categories.map(category => (
                  <section key={category.id} className="nav-projects__category" aria-label={category.label}>
                    <h3 className="nav-projects__category-title">{category.label}</h3>
                    <ul className="nav-projects__list">
                      {category.items.map(item => (
                        <li key={item.id} className="nav-projects__item">
                          <button
                            type="button"
                            className="nav-projects__item-btn"
                            onClick={() => { onProjectSelect(item); setActivePanel(null); }}
                          >
                            <p className="nav-projects__item-name">{item.name}</p>
                            <p className="nav-projects__item-summary">{item.summary}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
        {isSettingsOpen && (
          <div className="nav-rail__flyout-inner nav-rail__flyout-inner--settings">
            <p className="nav-rail__flyout-kicker">{uiText.settingsKicker}</p>
            <h2 className="nav-rail__flyout-title">{uiText.settingsTitle}</h2>
            <div className="nav-settings-option">
              <div className="nav-settings-option__copy">
                <p className="nav-settings-option__title">{uiText.themeTitle}</p>
                <p className="nav-settings-option__desc">
                  {uiText.themeDescription}
                </p>
              </div>
              <button
                type="button"
                className={`theme-toggle${theme === "light" ? " is-light" : ""}`}
                onClick={onThemeToggle}
                aria-label={theme === "dark" ? uiText.switchToLightLabel : uiText.switchToDarkLabel}
              >
                <span className="theme-toggle__thumb" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
