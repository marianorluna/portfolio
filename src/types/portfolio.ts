export type NavIconName = "folder" | "layers" | "mail";

export type NavBrand = {
  initials: string;
  /** “MARIANO” en el estilo ARQ de ARQ_DEV */
  nameMain: string;
  /** “_” */
  nameJoin: string;
  /** “LUNA” (apellido en el bloque claro) */
  nameRest: string;
  /** Línea secundaria estilo “.studio” (gris) */
  tagline: string;
};

export type NavLink = {
  id: string;
  label: string;
  description: string;
  icon: NavIconName;
};

export type PortfolioData = {
  meta: {
    title: string;
    badge: string;
  };
  nav: {
    brand: NavBrand;
    links: NavLink[];
  };
  hero: {
    titleLines: string[];
    subtitle: string;
    cta: {
      primary: string;
      secondary: string;
      secondaryUrl: string;
    };
  };
};
