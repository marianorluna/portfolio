import type { PortfolioData } from "@/types/portfolio";

type Props = {
  data: PortfolioData;
};

export function HeroText({ data }: Props) {
  const { meta, hero } = data;

  return (
    <div className="hero-text" id="heroText">
      <div className="hero-badge">
        <div className="badge-pulse" />
        {meta.badge} · {meta.location}
      </div>
      <h1 className="hero-title">
        {hero.titleLines.map((line, i) => {
          if (line === hero.accentWord) {
            return (
              <span key={i} className="t-blue">
                {line}
              </span>
            );
          }
          if (line === "Dev") {
            return (
              <span key={i}>
                <span className="t-dim">{"{ "}</span>
                {line}
                <span className="t-dim">{" }"}</span>
              </span>
            );
          }
          return <span key={i}>{line}</span>;
        })}
      </h1>
      <p className="hero-desc">
        {hero.descriptionLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < hero.descriptionLines.length - 1 && <br />}
          </span>
        ))}
      </p>
      <div className="hint-row">
        <span className="hint-icon">⬡</span>
        <span>{meta.hint}</span>
      </div>
    </div>
  );
}
