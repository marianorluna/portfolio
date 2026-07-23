import type { Locale } from "@/types/portfolio";
import type { LabUiCopy } from "@/types/lab";

/**
 * Copy del "chrome" del Lab (rail, índice, entrada): vive en código, no en
 * `data-*.json`, porque no describe datos del portfolio sino texto de la UI
 * de una sección de contenido independiente.
 */
const LAB_COPY: Record<Locale, LabUiCopy> = {
  es: {
    navKicker: "Sección",
    flyoutCtaLabel: "Abrir el Lab",
    flyoutEmptyMessage: "Aún no hay entradas publicadas. Vuelve pronto.",
    indexKicker: "Lab",
    indexTitle: "Lab",
    indexDescription:
      "Tutoriales, guías, checklists e infografías prácticas sobre BIM, IA y desarrollo, pensadas para explicarse con claridad a quien no está habituado a ellas.",
    indexEmptyMessage: "Aún no hay entradas publicadas en este idioma. Vuelve pronto.",
    filterAllLabel: "Todos",
    publishedLabel: "Publicado",
    updatedLabel: "Actualizado",
    backToLabLabel: "Volver al Lab",
    tocAriaLabel: "Secciones del tutorial",
    openCtaLabel: "Abrir",
    comingSoonLabel: "Próximamente",
    nextPageLabel: "Siguiente",
    prevPageLabel: "Anterior",
    pagesNavOpenLabel: "Mostrar páginas",
    pagesNavCloseLabel: "Ocultar páginas",
    filterEmptyMessage: "No hay resultados para este filtro.",
    settingsCloseLabel: "Cerrar configuración",
    menuOpenLabel: "Abrir menú",
    menuCloseLabel: "Cerrar menú",
    menuKicker: "Sección",
    menuTitle: "Menú",
    typeLabel: {
      tutorial: "Tutorial",
      guia: "Guía",
      checklist: "Checklist",
      infografia: "Infografía",
      dashboard: "Dashboard",
      nota: "Nota",
    },
    levelLabel: {
      intro: "Nivel introductorio",
      intermedio: "Nivel intermedio",
    },
  },
  en: {
    navKicker: "Section",
    flyoutCtaLabel: "Open the Lab",
    flyoutEmptyMessage: "No entries published yet. Check back soon.",
    indexKicker: "Lab",
    indexTitle: "Lab",
    indexDescription:
      "Practical tutorials, guides, checklists, and infographics on BIM, AI, and development, written to be clear for people who aren't used to them.",
    indexEmptyMessage: "No entries published yet in this language. Check back soon.",
    filterAllLabel: "All",
    publishedLabel: "Published",
    updatedLabel: "Updated",
    backToLabLabel: "Back to Lab",
    tocAriaLabel: "Tutorial sections",
    openCtaLabel: "Open",
    comingSoonLabel: "Coming soon",
    nextPageLabel: "Next",
    prevPageLabel: "Previous",
    pagesNavOpenLabel: "Show pages",
    pagesNavCloseLabel: "Hide pages",
    filterEmptyMessage: "No results for this filter.",
    settingsCloseLabel: "Close settings",
    menuOpenLabel: "Open menu",
    menuCloseLabel: "Close menu",
    menuKicker: "Section",
    menuTitle: "Menu",
    typeLabel: {
      tutorial: "Tutorial",
      guia: "Guide",
      checklist: "Checklist",
      infografia: "Infographic",
      dashboard: "Dashboard",
      nota: "Note",
    },
    levelLabel: {
      intro: "Introductory level",
      intermedio: "Intermediate level",
    },
  },
};

export function getLabCopy(locale: Locale): LabUiCopy {
  return LAB_COPY[locale];
}
