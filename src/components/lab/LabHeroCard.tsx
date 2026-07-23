"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import type { LabResourceType } from "@/types/lab";
import type { Locale } from "@/types/portfolio";
import { LabSettingsModal, type LabSettingsCopy } from "./LabSettingsModal";

type FilterItem = {
  type: LabResourceType | null;
  href: string;
  label: string;
  active: boolean;
};

type Props = {
  locale: Locale;
  title: string;
  description: string;
  filters: FilterItem[];
  filtersAriaLabel: string;
  backHref: string;
  backLabel: string;
  settingsLabel: string;
  settingsCopy: LabSettingsCopy;
};

/** Primera celda del bento: identidad del Lab + filtros + volver/config. */
export function LabHeroCard({
  locale,
  title,
  description,
  filters,
  filtersAriaLabel,
  backHref,
  backLabel,
  settingsLabel,
  settingsCopy,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="lab-bento__card lab-bento__card--hero">
      <div className="lab-bento__hero-top">
        <Link href={backHref} className="lab-bento__icon-btn" aria-label={backLabel} title={backLabel}>
          <ArrowLeft size={18} strokeWidth={1.8} aria-hidden />
        </Link>
        <button
          type="button"
          className="lab-bento__icon-btn"
          aria-label={settingsLabel}
          title={settingsLabel}
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={18} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      <div className="lab-bento__hero-main">
        <h1 className="lab-bento__hero-title">{title}</h1>
        <p className="lab-bento__hero-description">{description}</p>
        {filters.length > 0 && (
          <nav className="lab-bento__filters" aria-label={filtersAriaLabel}>
            {filters.map((filter) => (
              <Link
                key={filter.type ?? "all"}
                href={filter.href}
                className={`lab-bento__filter${filter.active ? " is-active" : ""}`}
              >
                {filter.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <LabSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        locale={locale}
        copy={settingsCopy}
      />
    </header>
  );
}
