export type TagItem = {
  t: string;
  c?: string;
};

export type MetricItem = {
  v: string;
  l: string;
};

export type LinkItem = {
  icon: string;
  text: string;
  url: string;
};

export type PanelSection = {
  label: string;
  desc?: string;
  metrics?: MetricItem[];
  tags?: Array<string | TagItem>;
  codeHtml?: string;
  links?: LinkItem[];
};

export type Hotspot = {
  id: string;
  label: string;
  cat: string;
  color: string;
  worldPos: {
    x: number;
    y: number;
    z: number;
  };
  panel: {
    type: string;
    title: string;
    sections: PanelSection[];
  };
};

export type NavLink = {
  id: string;
  label: string;
};

export type PortfolioData = {
  meta: {
    title: string;
    badge: string;
    location: string;
    hint: string;
    modelFile: string;
  };
  nav: {
    logo: string;
    links: NavLink[];
    cta: string;
  };
  hero: {
    titleLines: string[];
    accentWord: string;
    descriptionLines: string[];
  };
  status: {
    engine: string;
    model: string;
    elements: string;
    lod: string;
  };
  hotspots: Hotspot[];
};
