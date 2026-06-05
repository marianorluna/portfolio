"use client";

export type ConsentChoice = "accepted_all" | "rejected_optional" | "custom";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  thirdParty: boolean;
  choice: ConsentChoice;
  updatedAt: string;
};

const STORAGE_KEY = "portfolio-cookie-consent-v1";
const CHANGE_EVENT = "portfolio-consent-changed";
const OPEN_PREFERENCES_EVENT = "portfolio-consent-open-preferences";

function getNowIso(): string {
  return new Date().toISOString();
}

function getDefaultState(): ConsentState {
  return {
    necessary: true,
    analytics: false,
    thirdParty: false,
    choice: "rejected_optional",
    updatedAt: getNowIso(),
  };
}

function resolveAnalyticsFromLegacy(choice: ConsentChoice): boolean {
  return choice === "accepted_all";
}

function normalizeConsent(candidate: Partial<ConsentState>): ConsentState | null {
  if (candidate.necessary !== true) return null;
  if (typeof candidate.thirdParty !== "boolean") return null;
  if (
    candidate.choice !== "accepted_all" &&
    candidate.choice !== "rejected_optional" &&
    candidate.choice !== "custom"
  ) {
    return null;
  }
  if (typeof candidate.updatedAt !== "string" || candidate.updatedAt.length < 1) {
    return null;
  }

  const analytics =
    typeof candidate.analytics === "boolean"
      ? candidate.analytics
      : resolveAnalyticsFromLegacy(candidate.choice);

  return {
    necessary: true,
    analytics,
    thirdParty: candidate.thirdParty,
    choice: candidate.choice,
    updatedAt: candidate.updatedAt,
  };
}

export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return null;
    return normalizeConsent(parsed as Partial<ConsentState>);
  } catch {
    return null;
  }
}

function dispatchConsentChanged(state: ConsentState): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ConsentState>(CHANGE_EVENT, { detail: state }));
}

export function saveConsent(
  input: Omit<ConsentState, "necessary" | "updatedAt">
): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics: input.analytics,
    thirdParty: input.thirdParty,
    choice: input.choice,
    updatedAt: getNowIso(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Puede fallar en navegadores con storage bloqueado; mantenemos estado en memoria por evento.
    }
    dispatchConsentChanged(state);
  }
  return state;
}

export function acceptAllConsent(): ConsentState {
  return saveConsent({ analytics: true, thirdParty: true, choice: "accepted_all" });
}

export function rejectOptionalConsent(): ConsentState {
  return saveConsent({ analytics: false, thirdParty: false, choice: "rejected_optional" });
}

export function setCustomConsent(input: {
  analytics: boolean;
  thirdParty: boolean;
}): ConsentState {
  return saveConsent({
    analytics: input.analytics,
    thirdParty: input.thirdParty,
    choice: "custom",
  });
}

export function setThirdPartyConsent(enabled: boolean): ConsentState {
  const existing = getStoredConsent() ?? getDefaultState();
  return setCustomConsent({
    analytics: existing.analytics,
    thirdParty: enabled,
  });
}

export function hasAnalyticsConsent(): boolean {
  const state = getStoredConsent();
  return state?.analytics === true;
}

export function hasThirdPartyConsent(): boolean {
  const state = getStoredConsent();
  return state?.thirdParty === true;
}

export function onConsentChanged(callback: (state: ConsentState) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const custom = event as CustomEvent<ConsentState>;
    if (custom.detail) callback(custom.detail);
  };
  window.addEventListener(CHANGE_EVENT, handler as EventListener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler as EventListener);
  };
}

export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

export function onOpenCookiePreferences(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_PREFERENCES_EVENT, callback);
  return () => {
    window.removeEventListener(OPEN_PREFERENCES_EVENT, callback);
  };
}

export function ensureConsentInitialized(): ConsentState {
  const existing = getStoredConsent();
  if (existing) return existing;
  return getDefaultState();
}
