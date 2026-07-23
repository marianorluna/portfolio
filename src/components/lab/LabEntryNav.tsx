"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FlaskConical, Home, Menu, Settings, X } from "lucide-react";
import type { Locale } from "@/types/portfolio";
import { LabSettingsModal, type LabSettingsCopy } from "./LabSettingsModal";

type Props = {
  locale: Locale;
  backToHomeLabel: string;
  backToLabLabel: string;
  showBackToLab?: boolean;
  settingsLabel: string;
  menuOpenLabel: string;
  menuCloseLabel: string;
  menuKicker: string;
  menuTitle: string;
  settingsCopy: LabSettingsCopy;
};

const emptySubscribe = () => () => undefined;

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Chrome de navegación de una entrada Lab:
 * - Desktop: botones inicio/Lab a la izquierda + ajustes a la derecha.
 * - Móvil/tablet: hamburguesa que abre un panel a pantalla completa
 *   (mismo patrón que los flyouts del rail).
 */
export function LabEntryNav({
  locale,
  backToHomeLabel,
  backToLabLabel,
  showBackToLab = true,
  settingsLabel,
  menuOpenLabel,
  menuCloseLabel,
  menuKicker,
  menuTitle,
  settingsCopy,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mounted = useIsClient();
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openSettings = () => {
    setMenuOpen(false);
    setSettingsOpen(true);
  };

  const flyout =
    mounted &&
    createPortal(
      <div
        id={panelId}
        className={`lab-entry-flyout${menuOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal={menuOpen}
        aria-labelledby={titleId}
        aria-hidden={!menuOpen}
      >
        <div className="lab-entry-flyout__inner">
          <div className="lab-entry-flyout__top">
            <div>
              <p className="lab-entry-flyout__kicker">{menuKicker}</p>
              <h2 id={titleId} className="lab-entry-flyout__title">
                {menuTitle}
              </h2>
            </div>
            <button
              type="button"
              className="lab-bento__icon-btn"
              aria-label={menuCloseLabel}
              onClick={() => setMenuOpen(false)}
            >
              <X size={18} strokeWidth={1.8} aria-hidden />
            </button>
          </div>

          <nav className="lab-entry-flyout__nav" aria-label={menuTitle}>
            <Link
              href={`/${locale}`}
              className="lab-entry-flyout__item"
              onClick={() => setMenuOpen(false)}
            >
              <span className="lab-entry-flyout__item-icon" aria-hidden>
                <Home size={20} strokeWidth={1.8} />
              </span>
              <span className="lab-entry-flyout__item-label">{backToHomeLabel}</span>
            </Link>
            {showBackToLab && (
              <Link
                href={`/${locale}/lab`}
                className="lab-entry-flyout__item"
                onClick={() => setMenuOpen(false)}
              >
                <span className="lab-entry-flyout__item-icon" aria-hidden>
                  <FlaskConical size={20} strokeWidth={1.8} />
                </span>
                <span className="lab-entry-flyout__item-label">{backToLabLabel}</span>
              </Link>
            )}
            <button
              type="button"
              className="lab-entry-flyout__item"
              onClick={openSettings}
            >
              <span className="lab-entry-flyout__item-icon" aria-hidden>
                <Settings size={20} strokeWidth={1.8} />
              </span>
              <span className="lab-entry-flyout__item-label">{settingsLabel}</span>
            </button>
          </nav>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="lab-entry-nav">
      <nav className="lab-entry-nav__desktop" aria-label={menuTitle}>
        <div className="lab-entry-nav__desktop-left">
          <Link
            href={`/${locale}`}
            className="lab-entry-nav__btn"
            title={backToHomeLabel}
          >
            <Home size={16} strokeWidth={1.8} aria-hidden />
            <span>{backToHomeLabel}</span>
          </Link>
          {showBackToLab && (
            <Link
              href={`/${locale}/lab`}
              className="lab-entry-nav__btn"
              title={backToLabLabel}
            >
              <FlaskConical size={16} strokeWidth={1.8} aria-hidden />
              <span>{backToLabLabel}</span>
            </Link>
          )}
        </div>
        <button
          type="button"
          className="lab-bento__icon-btn"
          aria-label={settingsLabel}
          title={settingsLabel}
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={18} strokeWidth={1.8} aria-hidden />
        </button>
      </nav>

      <div className="lab-entry-nav__compact">
        <button
          type="button"
          className={`lab-bento__icon-btn lab-entry-nav__burger${menuOpen ? " is-active" : ""}`}
          aria-label={menuOpen ? menuCloseLabel : menuOpenLabel}
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X size={18} strokeWidth={1.8} aria-hidden />
          ) : (
            <Menu size={18} strokeWidth={1.8} aria-hidden />
          )}
        </button>
      </div>

      {flyout}

      <LabSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        locale={locale}
        copy={settingsCopy}
      />
    </div>
  );
}
