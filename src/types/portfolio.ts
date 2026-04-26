export type NavIconName = "folder" | "layers" | "calendar" | "mail";

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

export type ContactFormCopy = {
  formAriaLabel: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  sendLabel: string;
  sendingLabel: string;
  newMessageLabel: string;
  successMessage: string;
  errorGeneric: string;
  errorConfig: string;
  nameRequired: string;
  nameMax: string;
  emailInvalid: string;
  messageMin: string;
  messageMax: string;
  /** Etiqueta del campo trampa; oculta a usuarios, visible para scrapers. */
  honeypotLabel: string;
  /** Si el usuario envía sin completar el widget. */
  errorTurnstileRequired: string;
  /** Token inválido o expirado (403). */
  errorTurnstile: string;
  /** Error de cliente p. ej. 110200 — dominio no listado en el widget Turnstile. */
  errorTurnstileDomain: string;
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
      messages: string[];
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
    /** Visor interno al elegir un proyecto (entre rail e inspector; iframe = demo) */
    projectViewer: {
      closeLabel: string;
      openDemoLabel: string;
      demoUnavailableTitle: string;
      /** Mensaje en el área del iframe si no hay URL de demo */
      iframeUnavailableHint: string;
    };
    contactForm: ContactFormCopy;
  };
  hero: {
    titleLines: string[];
    subtitle: string;
    cta: {
      primary: string;
      /** Enlace del CTA primario (p. ej. LinkedIn) cuando no hay proyecto seleccionado. */
      primaryUrl: string;
      /** Texto del CTA primario con proyecto (p. ej. Demo). */
      primaryProject: string;
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
        /**
         * Ruta pública (p. ej. /images/...) para mostrar captura en el visor
         * cuando el `demo` no puede embeberse (X-Frame-Options, etc.).
         */
        demoEmbedFallback?: string;
      }[];
    }[];
  };
  /** Categorías con ítems en orden cronológico dentro de cada bloque; mismo esquema que `projects` */
  formacion: {
    categories: {
      id: string;
      label: string;
      items: {
        id: string;
        name: string;
        /** Institución, periodo, lugar: una línea tipo “Org · 20xx – 20xx · Ciudad” */
        meta: string;
        description: string;
      }[];
    }[];
  };
};
