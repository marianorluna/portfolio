import type { MetadataRoute } from "next";
import { getPortfolioDataByLocale, LOCALES, PROJECT_SEGMENT } from "@/i18n/locale";

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

  const projectEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => {
    const data = getPortfolioDataByLocale(locale);
    const segment = PROJECT_SEGMENT[locale];
    return data.projects.categories.flatMap(cat =>
      cat.items.map(item => ({
        url: `${SITE_URL}/${locale}/${segment}/${item.id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      }))
    );
  });

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...localizedEntries,
    ...projectEntries,
  ];
}
