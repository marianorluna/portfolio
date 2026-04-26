import type { PortfolioData } from "@/types/portfolio";

type ProjectItem = PortfolioData["projects"]["categories"][number]["items"][number];

type HeroSelection = {
  categoryLabel: string;
  project: ProjectItem;
};

type Props = {
  data: PortfolioData;
  /** Si hay proyecto elegido en el menú, el hero refleja categoría, resumen y enlaces. */
  selection: HeroSelection | null;
};

function isHttpUrlString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return value.startsWith("http://") || value.startsWith("https://");
}

export function HeroText({ data, selection }: Props) {
  const { meta, hero } = data;
  const badge = selection ? selection.categoryLabel : meta.badge;
  const useProjectLinks = selection != null;
  const demoUrl = useProjectLinks ? selection.project.demo : null;
  const githubUrl = useProjectLinks ? selection.project.github : null;
  const defaultPrimaryUrl = hero.cta.primaryUrl;
  const projectPrimaryLabel = hero.cta.primaryProject;

  return (
    <div className="hero-content">
      <div className="badge">
        <span className="dot" />
        {badge}
      </div>
      <h1>
        {selection ? (
          selection.project.summary
        ) : (
          hero.titleLines.map((line, i) => {
            const isLastLine = i === hero.titleLines.length - 1;
            return (
              <span key={i}>
                {line}
                {isLastLine && (
                  <span className="hero-title-cursor" aria-hidden="true">
                    _
                  </span>
                )}
                {!isLastLine && <br />}
              </span>
            );
          })
        )}
      </h1>
      <p className="subtitle">{selection ? selection.project.description : hero.subtitle}</p>
      <div className="cta-group">
        {useProjectLinks && isHttpUrlString(demoUrl) ? (
          <a
            href={demoUrl}
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            {projectPrimaryLabel}
          </a>
        ) : useProjectLinks ? (
          <span
            className="btn btn-primary btn-hero--static"
            title={demoUrl ?? "Sin enlace de demo"}
            aria-disabled
          >
            {projectPrimaryLabel}
          </span>
        ) : isHttpUrlString(defaultPrimaryUrl) ? (
          <a
            href={defaultPrimaryUrl}
            className="btn btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            {hero.cta.primary}
          </a>
        ) : (
          <span
            className="btn btn-primary btn-hero--static"
            title="Sin enlace de perfil"
            aria-disabled
          >
            {hero.cta.primary}
          </span>
        )}
        {useProjectLinks && isHttpUrlString(githubUrl) ? (
          <a
            href={githubUrl}
            className="btn btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            {hero.cta.secondary}
          </a>
        ) : useProjectLinks ? (
          <span
            className="btn btn-secondary btn-hero--static"
            title={githubUrl ?? "Sin enlace de GitHub"}
            aria-disabled
          >
            {hero.cta.secondary}
          </span>
        ) : (
          <a
            href={hero.cta.secondaryUrl}
            className="btn btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            {hero.cta.secondary}
          </a>
        )}
      </div>
    </div>
  );
}
