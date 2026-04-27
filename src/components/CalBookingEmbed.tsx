"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import type { SceneTheme } from "@/config/scene-theme";

const CAL_NAMESPACE = "meeting";
/** Misma ruta pública que https://www.cal.eu/marianorluna/meeting (región EU, no cal.com) */
const CAL_LINK = "marianorluna/meeting";
const CAL_ORIGIN = "https://app.cal.eu";
const CAL_EMBED_SCRIPT = "https://app.cal.eu/embed/embed.js";

type Props = {
  theme: SceneTheme;
};

export function CalBookingEmbed({ theme }: Props) {
  const calTheme = theme === "light" ? "light" : "dark";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({
        namespace: CAL_NAMESPACE,
        embedJsUrl: CAL_EMBED_SCRIPT,
      });
      if (cancelled) return;
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
        theme: calTheme,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [calTheme]);

  return (
    <div className="nav-cal-embed">
      <div className="nav-cal-embed__shell" data-theme={calTheme}>
        <Cal
          namespace={CAL_NAMESPACE}
          calLink={CAL_LINK}
          calOrigin={CAL_ORIGIN}
          embedJsUrl={CAL_EMBED_SCRIPT}
          className="nav-cal-embed__cal"
          config={{
            layout: "month_view",
            useSlotsViewOnSmallScreen: "true",
            theme: calTheme,
          }}
        />
      </div>
    </div>
  );
}
