"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";
import type { SceneTheme } from "@/config/scene-theme";
import { hasThirdPartyConsent, onConsentChanged, setThirdPartyConsent } from "@/lib/legal/consent";
import type { Locale } from "@/types/portfolio";

const CAL_NAMESPACE = "meeting";
/** Misma ruta pública que https://www.cal.eu/marianorluna/meeting (región EU, no cal.com) */
const CAL_LINK = "marianorluna/meeting";
const CAL_ORIGIN = "https://app.cal.eu";
const CAL_EMBED_SCRIPT = "https://app.cal.eu/embed/embed.js";

type Props = {
  theme: SceneTheme;
  locale: Locale;
};

const BOOKING_SUCCESS_STORAGE_KEY = "portfolio-cal-booking-success";

type BookingStatus = "idle" | "success";

const BOOKING_COPY: Record<
  Locale,
  {
    successTitle: string;
    successDescription: string;
    newBookingLabel: string;
  }
> = {
  es: {
    successTitle: "Reserva confirmada",
    successDescription: "Tu reunión quedó registrada. Revisa tu correo para ver el detalle y el enlace.",
    newBookingLabel: "Reservar otra reunión",
  },
  en: {
    successTitle: "Booking confirmed",
    successDescription: "Your meeting has been scheduled. Check your email for details and the meeting link.",
    newBookingLabel: "Book another meeting",
  },
};

function loadStoredBookingStatus(): BookingStatus {
  if (typeof window === "undefined") return "idle";
  return window.sessionStorage.getItem(BOOKING_SUCCESS_STORAGE_KEY) === "1" ? "success" : "idle";
}

export function CalBookingEmbed({ theme, locale }: Props) {
  const calTheme = theme === "light" ? "light" : "dark";
  const [remountTick, setRemountTick] = useState(0);
  const calKey = `${CAL_NAMESPACE}-${calTheme}-${remountTick}`;
  const [thirdPartyConsent, setThirdPartyConsentState] = useState<boolean>(() =>
    hasThirdPartyConsent()
  );
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(() => loadStoredBookingStatus());
  const copy = BOOKING_COPY[locale];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (bookingStatus === "success") {
      window.sessionStorage.setItem(BOOKING_SUCCESS_STORAGE_KEY, "1");
      return;
    }
    window.sessionStorage.removeItem(BOOKING_SUCCESS_STORAGE_KEY);
  }, [bookingStatus]);

  useEffect(() => {
    return onConsentChanged((state) => {
      setThirdPartyConsentState(state.thirdParty);
    });
  }, []);

  useEffect(() => {
    if (!thirdPartyConsent) return;
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({
        namespace: CAL_NAMESPACE,
        embedJsUrl: CAL_EMBED_SCRIPT,
      });
      if (cancelled) return;
      cal("ui", {
        hideEventTypeDetails: true, // Ocultar detalles del evento: nombre, foto, etc.
        layout: "month_view",
        theme: calTheme,
      });
      cal("on", {
        action: "bookingSuccessful",
        callback: () => {
          if (cancelled) return;
          setBookingStatus("success");
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [calTheme, thirdPartyConsent, remountTick]);

  if (!thirdPartyConsent) {
    return (
      <div className="embed-consent">
        <p className="embed-consent__text">
          Para cargar el calendario de reservas debes aceptar cookies de terceros.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setThirdPartyConsent(true);
            setThirdPartyConsentState(true);
          }}
        >
          Aceptar y mostrar calendario
        </button>
      </div>
    );
  }

  if (bookingStatus === "success") {
    return (
      <div className="embed-consent">
        <p className="embed-consent__text">
          <strong>{copy.successTitle}.</strong> {copy.successDescription}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setBookingStatus("idle");
            setRemountTick((current) => current + 1);
          }}
        >
          {copy.newBookingLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="nav-cal-embed">
      <div className="nav-cal-embed__shell" data-theme={calTheme}>
        <div className="nav-cal-embed__scale-wrap">
          <Cal
            key={calKey}
            namespace={CAL_NAMESPACE}
            calLink={CAL_LINK}
            calOrigin={CAL_ORIGIN}
            embedJsUrl={CAL_EMBED_SCRIPT}
            className="nav-cal-embed__cal"
            style={{ height: "100%", minHeight: 0 }}
            config={{
              layout: "month_view",
              useSlotsViewOnSmallScreen: "true",
              theme: calTheme,
            }}
          />
        </div>
      </div>
    </div>
  );
}
