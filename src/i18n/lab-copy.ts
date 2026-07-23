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
    publishedLabel: "Publicado el",
    backToLabLabel: "Volver al Lab",
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
    publishedLabel: "Published on",
    backToLabLabel: "Back to Lab",
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
