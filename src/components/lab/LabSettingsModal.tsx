"use client";

import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { SceneTheme } from "@/config/scene-theme";
import { applyDocumentTheme } from "@/config/scene-theme";
import type { Locale } from "@/types/portfolio";

export type LabSettingsCopy = {
  settingsKicker: string;
  settingsTitle: string;
  themeTitle: string;
  themeDescription: string;
  languageTitle: string;
  languageDescription: string;
  languageSpanishLabel: string;
  languageEnglishLabel: string;
  switchToSpanishLabel: string;
  switchToEnglishLabel: string;
  switchToLightLabel: string;
  switchToDarkLabel: string;
  closeLabel: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  copy: LabSettingsCopy;
};

function readStoredTheme(): SceneTheme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("portfolio-theme");
  return saved === "light" ? "light" : "dark";
}

const emptySubscribe = () => () => undefined;

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/** Modal centrado con tema e idioma (mismas preferencias que el rail). */
export function LabSettingsModal({ open, onClose, locale, copy }: Props) {
  const mounted = useIsClient();
  if (!open || !mounted) return null;
  return (
    <LabSettingsModalDialog
      key="lab-settings-open"
      onClose={onClose}
      locale={locale}
      copy={copy}
    />
  );
}

function LabSettingsModalDialog({
  onClose,
  locale,
  copy,
}: Omit<Props, "open">) {
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const [theme, setTheme] = useState<SceneTheme>(() => readStoredTheme());

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: SceneTheme = current === "dark" ? "light" : "dark";
      applyDocumentTheme(next);
      return next;
    });
  }, []);

  const changeLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      const segments = pathname.split("/");
      if (segments.length > 1) segments[1] = nextLocale;
      const nextPath = segments.join("/") || `/${nextLocale}/lab`;
      const query = window.location.search;
      router.push(query ? `${nextPath}${query}` : nextPath);
      onClose();
    },
    [locale, onClose, pathname, router]
  );

  return createPortal(
    <div className="lab-settings" role="presentation">
      <button
        type="button"
        className="lab-settings__backdrop"
        aria-label={copy.closeLabel}
        onClick={onClose}
      />
      <div
        className="lab-settings__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="lab-settings__header">
          <div>
            <p className="lab-settings__kicker">{copy.settingsKicker}</p>
            <h2 id={titleId} className="lab-settings__title">
              {copy.settingsTitle}
            </h2>
          </div>
          <button
            type="button"
            className="lab-bento__icon-btn"
            onClick={onClose}
            aria-label={copy.closeLabel}
          >
            <X size={18} strokeWidth={1.8} aria-hidden />
          </button>
        </div>

        <div className="nav-settings-option">
          <div className="nav-settings-option__copy">
            <p className="nav-settings-option__title">{copy.themeTitle}</p>
            <p className="nav-settings-option__desc">{copy.themeDescription}</p>
          </div>
          <button
            type="button"
            className={`theme-toggle${theme === "light" ? " is-light" : ""}`}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? copy.switchToLightLabel : copy.switchToDarkLabel}
          >
            <span className="theme-toggle__thumb" />
          </button>
        </div>

        <div className="nav-settings-option nav-settings-option--text-size">
          <div className="nav-settings-option__copy">
            <p className="nav-settings-option__title">{copy.languageTitle}</p>
            <p className="nav-settings-option__desc">{copy.languageDescription}</p>
          </div>
          <div
            className="text-size-levels text-size-levels--locale"
            role="group"
            aria-label={copy.languageTitle}
          >
            <button
              type="button"
              className={`text-size-level-btn${locale === "es" ? " is-active" : ""}`}
              onClick={() => changeLocale("es")}
              aria-pressed={locale === "es"}
              aria-label={copy.switchToSpanishLabel}
            >
              {copy.languageSpanishLabel}
            </button>
            <button
              type="button"
              className={`text-size-level-btn${locale === "en" ? " is-active" : ""}`}
              onClick={() => changeLocale("en")}
              aria-pressed={locale === "en"}
              aria-label={copy.switchToEnglishLabel}
            >
              {copy.languageEnglishLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
