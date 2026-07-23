"use client";

import { useEffect, useState } from "react";
import type { InspectorContent, InspectorSection } from "@/types/inspector";
import { formatInlineText } from "@/utils/format-inline-text";

const DEFAULT_OPEN_SECTION_ID = "stack";

function getDefaultOpenSectionId(sections: InspectorSection[]): string | undefined {
  const preferred = sections.find(s => s.id === DEFAULT_OPEN_SECTION_ID);
  return preferred?.id ?? sections[0]?.id;
}

type Props = {
  content: InspectorContent;
  collapseAllLabel: string;
};

function CollapseAllIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 14h16" />
      <path d="M4 10h16" />
      <path d="m7 7 5-4 5 4" />
    </svg>
  );
}

function SectionBody({ section }: { section: InspectorSection }) {
  if (section.kind === "text" && section.text != null) {
    return (
      <p className="inspector-section__text">{formatInlineText(section.text)}</p>
    );
  }

  if (section.kind === "chips" && section.chips != null) {
    return (
      <ul className="inspector-section__chips" role="list">
        {section.chips.map(chip => (
          <li key={chip} className="inspector-section__chip">
            {chip}
          </li>
        ))}
      </ul>
    );
  }

  if (section.kind === "pairs" && section.pairs != null) {
    return (
      <dl className="inspector-section__pairs">
        {section.pairs.map(pair => (
          <div key={pair.label} className="inspector-section__pair">
            <dt>{pair.label}</dt>
            <dd>{pair.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (section.kind === "json" && section.json != null) {
    return (
      <pre className="inspector-section__json">
        <code>{section.json}</code>
      </pre>
    );
  }

  return null;
}

export function InspectorAccordionBody({ content, collapseAllLabel }: Props) {
  const defaultOpenSectionId =
    content.variant === "sections"
      ? getDefaultOpenSectionId(content.sections)
      : undefined;

  const [openIds, setOpenIds] = useState<Set<string>>(() =>
    defaultOpenSectionId != null ? new Set([defaultOpenSectionId]) : new Set(),
  );

  const sections = content.variant === "sections" ? content.sections : undefined;

  useEffect(() => {
    queueMicrotask(() => {
      if (content.variant === "sections" && sections != null) {
        const sectionId = getDefaultOpenSectionId(sections);
        setOpenIds(sectionId != null ? new Set([sectionId]) : new Set());
      } else {
        setOpenIds(new Set());
      }
    });
  }, [content.key, content.variant, sections]);

  if (content.variant === "idle") {
    return <p className="inspector-idle">{content.message}</p>;
  }

  const toggleSection = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  const hasOpenSections = openIds.size > 0;

  return (
    <div className="inspector-accordion">
      <div className="inspector-accordion__header">
        {content.headline != null ? (
          <p className="inspector-accordion__headline">{content.headline}</p>
        ) : (
          <span className="inspector-accordion__headline-spacer" aria-hidden />
        )}
        <button
          type="button"
          className="inspector-accordion__collapse-all"
          onClick={collapseAll}
          disabled={!hasOpenSections}
          aria-label={collapseAllLabel}
          title={collapseAllLabel}
        >
          <CollapseAllIcon />
        </button>
      </div>
      {content.sections.map(section => {
        const isOpen = openIds.has(section.id);
        const panelId = `inspector-panel-${section.id}`;
        const triggerId = `inspector-trigger-${section.id}`;

        return (
          <div
            key={section.id}
            className={`inspector-section${isOpen ? " inspector-section--open" : ""}`}
          >
            <button
              type="button"
              className="inspector-section__trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              id={triggerId}
              onClick={() => toggleSection(section.id)}
            >
              <span
                className="inspector-section__icon"
                aria-hidden
              />
              <span className="inspector-section__label">{section.label}</span>
              <span className="inspector-section__chevron" aria-hidden>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
            {isOpen ? (
              <div
                className="inspector-section__panel"
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
              >
                <SectionBody section={section} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
