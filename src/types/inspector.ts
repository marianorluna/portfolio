export type InspectorSectionKind = "text" | "chips" | "pairs" | "json";

export type InspectorKeyValue = {
  label: string;
  value: string;
};

export type InspectorSection = {
  id: string;
  label: string;
  kind: InspectorSectionKind;
  /** Texto largo (contexto, impacto, etc.). */
  text?: string;
  /** Lista de pares label / valor (pisos, metadatos). */
  pairs?: InspectorKeyValue[];
  /** Etiquetas (stack tecnológico). */
  chips?: string[];
  /** Bloque JSON formateado (pisos sin proyecto). */
  json?: string;
};

export type InspectorContent =
  | {
      key: string;
      variant: "idle";
      message: string;
    }
  | {
      key: string;
      variant: "sections";
      headline?: string;
      sections: InspectorSection[];
    };
