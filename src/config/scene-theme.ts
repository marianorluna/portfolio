/**
 * Color de fondo (escena 3D + --bg-color en el documento). Cambiar solo aquí.
 */
export const SCENE_BACKGROUND = 0x323232;

const hex = (SCENE_BACKGROUND >>> 0).toString(16).padStart(6, "0");
export const SCENE_BACKGROUND_CSS = `#${hex}` as const;
