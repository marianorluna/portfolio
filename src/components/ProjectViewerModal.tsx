"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PortfolioData } from "@/types/portfolio";

type ProjectItem = PortfolioData["projects"]["categories"][number]["items"][number];

type Selection = {
  categoryLabel: string;
  project: ProjectItem;
};

type Props = {
  selection: Selection;
  onClose: () => void;
  openDemoLabel: string;
  projectViewer: PortfolioData["ui"]["projectViewer"];
};

function isHttpUrlString(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function ProjectViewerModal({
  selection,
  onClose,
  openDemoLabel,
  projectViewer,
}: Props) {
  const { project } = selection;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);
  const demoUrl = isHttpUrlString(project.demo) ? project.demo : null;
  const embedFallback =
    typeof project.demoEmbedFallback === "string" && project.demoEmbedFallback.trim() !== ""
      ? project.demoEmbedFallback.trim()
      : null;
  const [isPreviewLoading, setIsPreviewLoading] = useState(
    demoUrl != null || embedFallback != null
  );

  useEffect(() => {
    const el = closeRef.current;
    el?.focus();
  }, [project.id]);

  useEffect(() => {
    setIsPreviewLoading(demoUrl != null || embedFallback != null);
  }, [project.id, demoUrl, embedFallback]);

  useEffect(() => {
    if (!isPreviewLoading) return;
    if (loadTimeoutRef.current != null) {
      window.clearTimeout(loadTimeoutRef.current);
    }
    // Evita loader infinito si el proveedor externo no completa la carga del iframe.
    loadTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewLoading(false);
    }, 9000);
    return () => {
      if (loadTimeoutRef.current != null) {
        window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [isPreviewLoading, project.id]);

  return (
    <div
      className="project-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="project-viewer__panel">
        <header className="project-viewer__header">
          <h2 className="project-viewer__title" id={titleId}>
            {project.name}
          </h2>
        </header>

        <div className="project-viewer__frame">
          {isPreviewLoading && (
            <div className="project-viewer__loading" role="status" aria-live="polite">
              <span className="project-viewer__spinner" aria-hidden />
              <p className="project-viewer__loading-text">Cargando vista previa...</p>
            </div>
          )}
          {embedFallback != null ? (
            <div className="project-viewer__embed-fallback" role="img" aria-label={project.name}>
              {/* Captura: Autodesk (y similares) suelen bloquear iframe; la demo sigue abriéndose en pestaña */}
              <img
                className="project-viewer__fallback-img"
                src={embedFallback}
                alt={`Vista de ${project.name}`}
                loading="eager"
                decoding="async"
                draggable={false}
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => setIsPreviewLoading(false)}
              />
            </div>
          ) : demoUrl != null ? (
            <iframe
              key={project.id + demoUrl}
              title={`${project.name} — ${openDemoLabel}`}
              className="project-viewer__iframe"
              src={demoUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIsPreviewLoading(false)}
              onError={() => setIsPreviewLoading(false)}
            />
          ) : (
            <div className="project-viewer__iframe-fallback" role="status">
              <p className="project-viewer__iframe-fallback-text">
                {projectViewer.iframeUnavailableHint}
              </p>
            </div>
          )}
        </div>

        <footer className="project-viewer__footer">
          <button
            ref={closeRef}
            type="button"
            className="btn btn-secondary project-viewer__btn-close"
            onClick={onClose}
          >
            {projectViewer.closeLabel}
          </button>
          {demoUrl != null ? (
            <a
              href={demoUrl}
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              {openDemoLabel}
            </a>
          ) : (
            <span
              className="btn btn-primary btn-hero--static"
              title={projectViewer.demoUnavailableTitle}
              aria-disabled
            >
              {openDemoLabel}
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
