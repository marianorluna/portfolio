import type { MetadataRoute } from "next";
import { getPortfolioDataByLocale, LOCALES, PROJECT_SEGMENT } from "@/i18n/locale";
import { getLabEffectiveDate, labMonthToDate, listLabResources } from "@/lib/lab";

const SITE_URL = "https://marianorluna.com";
const LOCALIZED_PATH_SUFFIXES = [
  "",
  "/legal/aviso-legal",
  "/legal/privacidad",
  "/legal/cookies",
  "/lab",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const localizedEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    LOCALIZED_PATH_SUFFIXES.map((suffix) => ({
      url: `${SITE_URL}/${locale}${suffix}`,
      lastModified: now,
      changeFrequency: suffix === "" ? "monthly" : suffix === "/lab" ? "weekly" : "yearly",
      priority: suffix === "" ? 1 : suffix === "/lab" ? 0.7 : 0.6,
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

  const labEntries: MetadataRoute.Sitemap = (
    await Promise.all(
      LOCALES.map(async (locale) => {
        const resources = await listLabResources(locale);
        return resources.map((resource) => ({
          url: `${SITE_URL}/${locale}/lab/${resource.slug}`,
          lastModified: labMonthToDate(getLabEffectiveDate(resource)),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }));
      })
    )
  ).flat();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...localizedEntries,
    ...projectEntries,
    ...labEntries,
  ];
}
