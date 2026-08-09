"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { hasThirdPartyConsent, onConsentChanged, setThirdPartyConsent } from "@/lib/legal/consent";
import { youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/lab/youtube";

export type LabDemoMediaStageCopy = {
  demoLoadVideoLabel: string;
  demoConsentHint: string;
  demoOpenLiveLabel: string;
  demoOpenYoutubeLabel: string;
  demoTabVideoLabel: string;
  demoTabLiveLabel: string;
  demoStageAriaLabel: string;
  comingSoonLabel: string;
  demoVideoPendingHint: string;
};

type TabId = "live" | "video";

type Props = {
  title: string;
  demoVideoId?: string;
  /** Muestra el panel Video como placeholder hasta publicar el id. */
  demoVideoPending?: boolean;
  demoUrl?: string;
  posterSrc?: string;
  posterAlt?: string;
  copy: LabDemoMediaStageCopy;
};

/**
 * Escenario multimedia del shell demo: video YouTube (consent thirdParty),
 * placeholder de video pendiente, iframe de demo live, o tabs si hay ambos.
 */
export function LabDemoMediaStage({
  title,
  demoVideoId,
  demoVideoPending = false,
  demoUrl,
  posterSrc,
  posterAlt,
  copy,
}: Props) {
  const hasRealVideo = demoVideoId != null && demoVideoId.length > 0;
  const hasPendingVideo = !hasRealVideo && demoVideoPending;
  const hasVideo = hasRealVideo || hasPendingVideo;
  const hasLive = demoUrl != null && demoUrl.length > 0;
  const tabsId = useId();
  const [thirdPartyConsent, setThirdPartyConsentState] = useState(() => hasThirdPartyConsent());
  const [activeTab, setActiveTab] = useState<TabId>(() => (hasLive ? "live" : "video"));

  useEffect(() => {
    return onConsentChanged((state) => {
      setThirdPartyConsentState(state.thirdParty);
    });
  }, []);

  if (!hasVideo && !hasLive) return null;

  const showTabs = hasVideo && hasLive;
  const showVideoPanel = hasVideo && (!showTabs || activeTab === "video");
  const showLivePanel = hasLive && (!showTabs || activeTab === "live");
  const embedSrc = hasRealVideo ? youtubeEmbedUrl(demoVideoId) : null;
  const watchHref = hasRealVideo ? youtubeWatchUrl(demoVideoId) : null;

  const loadVideo = () => {
    setThirdPartyConsent(true);
    setThirdPartyConsentState(true);
  };

  return (
    <section
      id="lab-demo-stage"
      className="lab-demo-stage"
      aria-label={copy.demoStageAriaLabel}
    >
      {showTabs && (
        <div className="lab-demo-stage__tabs" role="tablist" aria-label={copy.demoStageAriaLabel}>
          <button
            type="button"
            role="tab"
            id={`${tabsId}-live`}
            aria-selected={activeTab === "live"}
            aria-controls={`${tabsId}-panel-live`}
            tabIndex={activeTab === "live" ? 0 : -1}
            className={[
              "lab-demo-stage__tab",
              activeTab === "live" ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveTab("live")}
          >
            {copy.demoTabLiveLabel}
          </button>
          <button
            type="button"
            role="tab"
            id={`${tabsId}-video`}
            aria-selected={activeTab === "video"}
            aria-controls={`${tabsId}-panel-video`}
            tabIndex={activeTab === "video" ? 0 : -1}
            className={[
              "lab-demo-stage__tab",
              activeTab === "video" ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveTab("video")}
          >
            {copy.demoTabVideoLabel}
          </button>
        </div>
      )}

      {showLivePanel && demoUrl != null && (
        <div
          className="lab-demo-stage__panel lab-demo-live"
          role={showTabs ? "tabpanel" : undefined}
          id={showTabs ? `${tabsId}-panel-live` : undefined}
          aria-labelledby={showTabs ? `${tabsId}-live` : undefined}
        >
          <div className="lab-demo-stage__frame">
            <iframe
              src={demoUrl}
              title={title}
              className="lab-demo-stage__iframe"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="fullscreen; clipboard-read; clipboard-write"
            />
          </div>
          <div className="lab-demo-stage__actions">
            <a
              href={demoUrl}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.demoOpenLiveLabel}
            </a>
          </div>
        </div>
      )}

      {showVideoPanel && hasPendingVideo && (
        <div
          className="lab-demo-stage__panel lab-demo-video lab-demo-video--pending"
          role={showTabs ? "tabpanel" : undefined}
          id={showTabs ? `${tabsId}-panel-video` : undefined}
          aria-labelledby={showTabs ? `${tabsId}-video` : undefined}
        >
          <div className="lab-demo-stage__frame">
            <div className="lab-demo-video__facade">
              {posterSrc != null && posterSrc.length > 0 ? (
                <Image
                  src={posterSrc}
                  alt={posterAlt ?? title}
                  fill
                  sizes="(max-width: 900px) 100vw, 880px"
                  className="lab-demo-video__poster"
                />
              ) : (
                <div className="lab-demo-video__poster-fallback" aria-hidden />
              )}
              <div className="lab-demo-video__consent lab-demo-video__pending">
                <p className="lab-demo-video__pending-label">{copy.comingSoonLabel}</p>
                <p className="lab-demo-video__consent-text">{copy.demoVideoPendingHint}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoPanel && hasRealVideo && embedSrc != null && watchHref != null && (
        <div
          className="lab-demo-stage__panel lab-demo-video"
          role={showTabs ? "tabpanel" : undefined}
          id={showTabs ? `${tabsId}-panel-video` : undefined}
          aria-labelledby={showTabs ? `${tabsId}-video` : undefined}
        >
          <div className="lab-demo-stage__frame">
            {thirdPartyConsent ? (
              <iframe
                src={embedSrc}
                title={title}
                className="lab-demo-stage__iframe"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="lab-demo-video__facade">
                {posterSrc != null && posterSrc.length > 0 ? (
                  <Image
                    src={posterSrc}
                    alt={posterAlt ?? title}
                    fill
                    sizes="(max-width: 900px) 100vw, 880px"
                    className="lab-demo-video__poster"
                  />
                ) : (
                  <div className="lab-demo-video__poster-fallback" aria-hidden />
                )}
                <div className="lab-demo-video__consent">
                  <p className="lab-demo-video__consent-text">{copy.demoConsentHint}</p>
                  <button type="button" className="btn btn-primary" onClick={loadVideo}>
                    {copy.demoLoadVideoLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="lab-demo-stage__actions">
            <a
              href={watchHref}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.demoOpenYoutubeLabel}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
