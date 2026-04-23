"use client";

import { useMemo, useState } from "react";
import type { Hotspot, PortfolioData, TagItem } from "@/types/portfolio";

type Props = {
  data: PortfolioData;
};

const normalizeTag = (tag: string | TagItem): TagItem =>
  typeof tag === "string" ? { t: tag, c: "" } : { t: tag.t, c: tag.c ?? "" };

export function PortfolioHero({ data }: Props) {
  const [selectedId, setSelectedId] = useState<string>(data.hotspots[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const selected: Hotspot | undefined = useMemo(
    () => data.hotspots.find((item) => item.id === selectedId),
    [data.hotspots, selectedId]
  );

  return (
    <main className="page">
      <header className="nav">
        <div className="logo">{data.nav.logo}</div>
        <button className="menu-btn" onClick={() => setMenuOpen((prev) => !prev)} type="button">
          Menu
        </button>
        <nav className={`menu ${menuOpen ? "open" : ""}`}>
          {data.nav.links.map((item) => (
            <button key={item.id} className="menu-link" type="button">
              {item.label}
            </button>
          ))}
        </nav>
        <button className="cta" type="button" onClick={() => setSelectedId("about")}>
          {data.nav.cta}
        </button>
      </header>

      <section className="hero">
        <div className="hero-left">
          <p className="badge">
            {data.meta.badge} · {data.meta.location}
          </p>
          <h1>
            {data.hero.titleLines.map((line) => (
              <span key={line} className={line === data.hero.accentWord ? "accent" : ""}>
                {line}
              </span>
            ))}
          </h1>
          <p className="description">{data.hero.descriptionLines.join("\n")}</p>
          <p className="hint">{data.meta.hint}</p>
        </div>

        <div className="hero-right">
          <p className="status-title">Hotspots</p>
          <div className="hotspots">
            {data.hotspots.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`hotspot ${selectedId === item.id ? "active" : ""}`}
                onClick={() => setSelectedId(item.id)}
                style={{ borderColor: item.color }}
              >
                <span className="hotspot-cat">{item.cat}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <p>{selected?.panel.type}</p>
          <h2>{selected?.panel.title}</h2>
        </div>
        <div className="panel-body">
          {selected?.panel.sections.map((section) => (
            <article className="panel-section" key={section.label}>
              <h3>{section.label}</h3>
              {section.desc ? <p>{section.desc}</p> : null}
              {section.metrics ? (
                <div className="metrics">
                  {section.metrics.map((metric) => (
                    <div key={`${metric.l}-${metric.v}`} className="metric">
                      <strong>{metric.v}</strong>
                      <span>{metric.l}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {section.tags ? (
                <div className="tags">
                  {section.tags.map((tag, index) => {
                    const parsed = normalizeTag(tag);
                    return (
                      <span key={`${parsed.t}-${index}`} className={`tag ${parsed.c ?? ""}`}>
                        {parsed.t}
                      </span>
                    );
                  })}
                </div>
              ) : null}
              {section.links ? (
                <div className="links">
                  {section.links.map((link) => (
                    <a key={link.text} href={link.url} target="_blank" rel="noreferrer">
                      {link.text}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
