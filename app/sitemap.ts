import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/locale";

const SITE_URL = "https://marianorluna.com";
const LOCALIZED_PATH_SUFFIXES = [
  "",
  "/legal/aviso-legal",
  "/legal/privacidad",
  "/legal/cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const localizedEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    LOCALIZED_PATH_SUFFIXES.map((suffix) => ({
      url: `${SITE_URL}/${locale}${suffix}`,
      lastModified: now,
      changeFrequency: suffix === "" ? "monthly" : "yearly",
      priority: suffix === "" ? 1 : 0.6,
    }))
  );

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...localizedEntries,
  ];
}
