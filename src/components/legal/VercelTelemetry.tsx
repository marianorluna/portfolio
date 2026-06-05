"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";
import { hasAnalyticsConsent, onConsentChanged } from "@/lib/legal/consent";

function blockWithoutConsent<T extends { url: string }>(event: T): T | null {
  if (!hasAnalyticsConsent()) return null;
  return event;
}

export function VercelTelemetry() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setAnalyticsEnabled(hasAnalyticsConsent());
    });
    return onConsentChanged((state) => {
      setAnalyticsEnabled(state.analytics);
    });
  }, []);

  if (!analyticsEnabled) return null;

  return (
    <>
      <Analytics beforeSend={blockWithoutConsent} />
      <SpeedInsights beforeSend={blockWithoutConsent} />
    </>
  );
}
