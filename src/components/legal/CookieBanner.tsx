"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  acceptAllConsent,
  ensureConsentInitialized,
  getStoredConsent,
  onOpenCookiePreferences,
  rejectOptionalConsent,
  setThirdPartyConsent,
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
  thirdPartyLabel: string;
  thirdPartyDescription: string;
};

const copyByLocale: Record<Locale, Copy> = {
  es: {
    title: "Cookies y privacidad",
    description:
      "Usamos cookies técnicas necesarias para el funcionamiento del sitio. También podemos cargar contenido de terceros (YouTube y Cal.com), que puede instalar cookies adicionales si lo aceptas.",
    policyLabel: "Ver política de cookies",
    acceptAllLabel: "Aceptar todas",
    rejectOptionalLabel: "Rechazar no esenciales",
    configureLabel: "Configurar",
    saveLabel: "Guardar preferencias",
    cancelLabel: "Cancelar",
    thirdPartyLabel: "Cookies de terceros y contenido embebido",
    thirdPartyDescription:
      "Permite cargar contenido externo y servicios de terceros que pueden tratar datos de navegación.",
  },
  en: {
    title: "Cookies and privacy",
    description:
      "We use necessary technical cookies for site functionality. We can also load third-party embeds (YouTube and Cal.com), which may set additional cookies if you accept.",
    policyLabel: "View cookie policy",
    acceptAllLabel: "Accept all",
    rejectOptionalLabel: "Reject non-essential",
    configureLabel: "Configure",
    saveLabel: "Save preferences",
    cancelLabel: "Cancel",
    thirdPartyLabel: "Third-party cookies and embedded content",
    thirdPartyDescription:
      "Allows external embedded content and third-party services that may process browsing data.",
  },
};

export function CookieBanner({ locale }: Props) {
  const copy = useMemo(() => copyByLocale[locale], [locale]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [thirdPartyEnabled, setThirdPartyEnabled] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const existing = getStoredConsent();
      setThirdPartyEnabled(existing?.thirdParty ?? false);
      setIsVisible(existing == null);
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    return onOpenCookiePreferences(() => {
      const state = ensureConsentInitialized();
      setThirdPartyEnabled(state.thirdParty);
      setIsConfigOpen(true);
      setIsVisible(true);
    });
  }, []);

  const handleAcceptAll = () => {
    acceptAllConsent();
    setThirdPartyEnabled(true);
    setIsVisible(false);
    setIsConfigOpen(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalConsent();
    setThirdPartyEnabled(false);
    setIsVisible(false);
    setIsConfigOpen(false);
  };

  const handleSave = () => {
    setThirdPartyConsent(thirdPartyEnabled);
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
