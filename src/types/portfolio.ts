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
  /** Texto descriptivo del panel Acerca de mí */
  aboutText: string;
  /** Etiqueta superior del bloque Acerca de mí */
  aboutKicker: string;
  /** Subtítulo de posicionamiento profesional */
  aboutRole: string;
  /** Frase de cierre destacada */
  aboutStatement: string;
};

export type NavLink = {
  id: string;
  label: string;
  description: string;
  icon: NavIconName;
};

export type NavUiText = {
  railAriaLabel: string;
  sectionsAriaLabel: string;
  siteBrandLabel: string;
  settingsLabel: string;
  panelFallbackLabel: string;
  brandScreenReaderPrefix: string;
  sectionKicker: string;
  settingsKicker: string;
  settingsTitle: string;
  themeTitle: string;
  themeDescription: string;
  switchToLightLabel: string;
  switchToDarkLabel: string;
};

export type PortfolioData = {
  meta: {
    title: string;
    badge: string;
  };
  nav: {
    brand: NavBrand;
    links: NavLink[];
    uiText: NavUiText;
  };
  ui: {
    loading: {
      brandMain: string;
      brandAccent: string;
      initialText: string;
    };
    inspector: {
      title: string;
      status: string;
      codeHtml: {
        default: string;
        jsonResponseComment: string;
        status: string;
        sync: string;
      };
    };
    viewControls: {
      resetTitle: string;
      resetLabel: string;
      isoLabel: string;
      topLabel: string;
      frontLabel: string;
      orthoLabel: string;
      perspectiveLabel: string;
      autoRotateOnTitle: string;
      autoRotateOffTitle: string;
      rotateLabel: string;
    };
    levelControls: {
      floorsLabel: string;
      rotationLabel: string;
    };
    interactionHint: {
      clickLabel: string;
      panLabel: string;
      rightClickLabel: string;
      orbitLabel: string;
      scrollLabel: string;
      zoomLabel: string;
    };
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
  projects: {
    title: string;
    categories: {
      id: string;
      label: string;
      items: {
        id: string;
        name: string;
        summary: string;
        description: string;
        context: string;
        impact: string;
        role: string;
        stack: string[];
        link: string;
        github: string;
        demo: string;
      }[];
    }[];
  };
};
