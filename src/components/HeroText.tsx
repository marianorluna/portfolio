import type { PortfolioData } from "@/types/portfolio";

type Props = {
  data: PortfolioData;
};

export function HeroText({ data }: Props) {
  const { meta, hero } = data;
  return (
    <div className="hero-content">
      <div className="badge">
        <span className="dot" />
        {meta.badge}
      </div>
      <h1>
        {hero.titleLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < hero.titleLines.length - 1 && <br />}
          </span>
        ))}
      </h1>
      <p className="subtitle">{hero.subtitle}</p>
      <div className="cta-group">
        <a href="#" className="btn btn-primary">{hero.cta.primary}</a>
        <a
          href={hero.cta.secondaryUrl}
          className="btn btn-secondary"
          target="_blank"
          rel="noreferrer"
        >
          {hero.cta.secondary}
        </a>
      </div>
    </div>
  );
}
