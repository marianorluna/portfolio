/**
 * Paleta de colores para la escena 3D (estrategia dark / light).
 * Todos los colores 3D se leen desde aquí; ningún módulo usa literales hardcodeados.
 */

export type SceneTheme = "dark" | "light";

function toCSS(hex: number) {
  return `#${(hex >>> 0).toString(16).padStart(6, "0")}` as const;
}

// ─── Tokens por tema ──────────────────────────────────────────────────────────
export const SCENE_COLORS = {
  dark: {
    background:          0x323232,
    backgroundCSS:       toCSS(0x323232),
    loadingBgCSS:        "#1f1f1f",
    gridMajor:           0x4a5568,
    gridMinor:           0x2d3548,
    horizonLine:         0x4a5568,
    buildingBase:        0x2e2e2e,
    buildingMetalness:   0.8,
    buildingRoughness:   0.2,
    buildingBaseOpacity: 0.8,
    buildingLines:       0x333333,
    buildingLinesOpacity:0.5,
    buildingCore:        0x0a0a0a,
    dirLight1:           { color: 0x0070f3, intensity: 1.5 },
    dirLight2:           { color: 0x00e5ff, intensity: 1.0 },
    dirLight3:           { color: 0x00e5ff, intensity: 1.1 },
    fillA:               { color: 0xaedbff, intensity: 0.25 },
    fillB:               { color: 0xaedbff, intensity: 0.20 },
  },
  light: {
    background:          0xe8eaed,
    backgroundCSS:       toCSS(0xe8eaed),
    loadingBgCSS:        "#f1f2f4",
    gridMajor:           0xa0a8b0,   // gris medio neutro
    gridMinor:           0xc4c8cc,   // gris claro neutro
    horizonLine:         0xa0a8b0,
    buildingBase:        0xd0d4d8,   // concreto gris claro
    buildingMetalness:   0.45,
    buildingRoughness:   0.35,
    buildingBaseOpacity: 0.94,
    buildingLines:       0x7a8088,   // aristas grises
    buildingLinesOpacity:0.5,
    buildingCore:        0xb0b6bc,   // núcleo gris medio
    dirLight1:           { color: 0xffffff, intensity: 1.3 },
    dirLight2:           { color: 0xf0f0f0, intensity: 0.9 },
    dirLight3:           { color: 0xffffff, intensity: 1.0 },
    fillA:               { color: 0xdddddd, intensity: 0.5 },
    fillB:               { color: 0xdddddd, intensity: 0.45 },
  },
} as const satisfies Record<SceneTheme, unknown>;

// Compat: otros módulos que importan la constante anterior siguen funcionando.
export const SCENE_BACKGROUND     = SCENE_COLORS.dark.background;
export const SCENE_BACKGROUND_CSS = SCENE_COLORS.dark.backgroundCSS;
