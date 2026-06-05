"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  matchesPortfolioHome,
  usePortfolioSceneLoadGate,
} from "@/components/portfolio-scene-load/PortfolioSceneLoadGate";
import {
  acceptAllConsent,
  ensureConsentInitialized,
  getStoredConsent,
  onOpenCookiePreferences,
  rejectOptionalConsent,
  setCustomConsent,
} from "@/lib/legal/consent";
import type { Locale } from "@/types/portfolio";

type Props = {
  locale: Locale;
};

type Copy = {
  title: string;
  description: string;
  policyLabel: string;
  acceptAllLabel: string;
  rejectOptionalLabel: string;
  configureLabel: string;
  saveLabel: string;
  cancelLabel: string;
  analyticsLabel: string;
  analyticsDescription: string;
  thirdPartyLabel: string;
  thirdPartyDescription: string;
};

const copyByLocale: Record<Locale, Copy> = {
  es: {
    title: "Cookies y privacidad",
    description:
      "Usamos cookies técnicas necesarias para el funcionamiento del sitio. Con tu consentimiento podemos medir visitas y rendimiento (Vercel Analytics y Speed Insights) y cargar contenido de terceros (YouTube y Cal.com).",
    policyLabel: "Ver política de cookies",
    acceptAllLabel: "Aceptar todas",
    rejectOptionalLabel: "Rechazar no esenciales",
    configureLabel: "Configurar",
    saveLabel: "Guardar preferencias",
    cancelLabel: "Cancelar",
    analyticsLabel: "Medición de visitas y rendimiento",
    analyticsDescription:
      "Permite analizar el uso del sitio y su rendimiento mediante Vercel Analytics y Speed Insights.",
    thirdPartyLabel: "Cookies de terceros y contenido embebido",
    thirdPartyDescription:
      "Permite cargar contenido externo y servicios de terceros que pueden tratar datos de navegación.",
  },
  en: {
    title: "Cookies and privacy",
    description:
      "We use necessary technical cookies for site functionality. With your consent we can measure visits and performance (Vercel Analytics and Speed Insights) and load third-party embeds (YouTube and Cal.com).",
    policyLabel: "View cookie policy",
    acceptAllLabel: "Accept all",
    rejectOptionalLabel: "Reject non-essential",
    configureLabel: "Configure",
    saveLabel: "Save preferences",
    cancelLabel: "Cancel",
    analyticsLabel: "Visit and performance measurement",
    analyticsDescription:
      "Allows site usage and performance analysis through Vercel Analytics and Speed Insights.",
    thirdPartyLabel: "Third-party cookies and embedded content",
    thirdPartyDescription:
      "Allows external embedded content and third-party services that may process browsing data.",
  },
};

export function CookieBanner({ locale }: Props) {
  const copy = useMemo(() => copyByLocale[locale], [locale]);
  const pathname = usePathname();
  const loadGate = usePortfolioSceneLoadGate();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [thirdPartyEnabled, setThirdPartyEnabled] = useState(false);

  const isPortfolioHome = matchesPortfolioHome(pathname, locale);

  useEffect(() => {
    queueMicrotask(() => {
      const existing = getStoredConsent();
      setAnalyticsEnabled(existing?.analytics ?? false);
      setThirdPartyEnabled(existing?.thirdParty ?? false);
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (getStoredConsent() != null) return;
    if (isConfigOpen) return;

    const sceneOk = !isPortfolioHome || loadGate.initialSceneLoadDismissed;
    setIsVisible(sceneOk);
  }, [
    isHydrated,
    isConfigOpen,
    isPortfolioHome,
    loadGate.initialSceneLoadDismissed,
  ]);

  useEffect(() => {
    return onOpenCookiePreferences(() => {
      const state = ensureConsentInitialized();
      setAnalyticsEnabled(state.analytics);
      setThirdPartyEnabled(state.thirdParty);
      setIsConfigOpen(true);
      setIsVisible(true);
    });
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();
    setAnalyticsEnabled(true);
    setThirdPartyEnabled(true);
    setIsVisible(false);
    setIsConfigOpen(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalConsent();
    setAnalyticsEnabled(false);
    setThirdPartyEnabled(false);
    setIsVisible(false);
    setIsConfigOpen(false);
  };

  const handleSave = () => {
    setCustomConsent({
      analytics: analyticsEnabled,
      thirdParty: thirdPartyEnabled,
    });
    setIsVisible(false);
    setIsConfigOpen(false);
  };

  if (!isHydrated || !isVisible) return null;

  return (
    <aside className="cookie-banner" role="dialog" aria-live="polite" aria-label={copy.title}>
      <h2 className="cookie-banner__title">{copy.title}</h2>
      <p className="cookie-banner__desc">{copy.description}</p>
      <p className="cookie-banner__policy">
        <Link href={`/${locale}/legal/cookies`}>{copy.policyLabel}</Link>
      </p>
      {isConfigOpen && (
        <div className="cookie-banner__config">
          <label className="cookie-banner__check">
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
            <span>{copy.analyticsLabel}</span>
          </label>
          <p className="cookie-banner__config-help">{copy.analyticsDescription}</p>
          <label className="cookie-banner__check">
            <input
              type="checkbox"
              checked={thirdPartyEnabled}
              onChange={(event) => setThirdPartyEnabled(event.target.checked)}
            />
            <span>{copy.thirdPartyLabel}</span>
          </label>
          <p className="cookie-banner__config-help">{copy.thirdPartyDescription}</p>
        </div>
      )}
      <div className="cookie-banner__actions">
        {!isConfigOpen && (
          <>
            <button type="button" className="cookie-banner__btn cookie-banner__btn--primary" onClick={handleAcceptAll}>
              {copy.acceptAllLabel}
            </button>
            <button type="button" className="cookie-banner__btn" onClick={handleRejectOptional}>
              {copy.rejectOptionalLabel}
            </button>
            <button type="button" className="cookie-banner__btn" onClick={() => setIsConfigOpen(true)}>
              {copy.configureLabel}
            </button>
          </>
        )}
        {isConfigOpen && (
          <>
            <button type="button" className="cookie-banner__btn cookie-banner__btn--primary" onClick={handleSave}>
              {copy.saveLabel}
            </button>
            <button type="button" className="cookie-banner__btn" onClick={() => setIsConfigOpen(false)}>
              {copy.cancelLabel}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
