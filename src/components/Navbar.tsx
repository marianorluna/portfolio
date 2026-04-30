"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import type {
  DeviceMode,
  Locale,
  NavBrand,
  NavLink,
  NavUiText,
  PortfolioData,
  TextSizeLevel,
} from "@/types/portfolio";
import { NavIcon } from "./NavIcon";
import { CalBookingEmbed } from "./CalBookingEmbed";
import { ContactForm } from "./ContactForm";
import { ContactSocialRow } from "./ContactSocialRow";
import type { SceneTheme } from "@/config/scene-theme";

export type NavActivePanel = "brand" | string | null;

type Props = {
  brand:          NavBrand;
  links:          NavLink[];
  projects:       PortfolioData["projects"];
  formacion:      PortfolioData["formacion"];
  contactForm:    PortfolioData["ui"]["contactForm"];
  contactSocial:  PortfolioData["ui"]["contactSocial"];
  legal:          PortfolioData["legal"];
  uiText:         NavUiText;
  theme:          SceneTheme;
  activePanel:    NavActivePanel;
  onActivePanelChange: Dispatch<SetStateAction<NavActivePanel>>;
  onThemeToggle:  () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  showInitialHelpSetting: boolean;
  initialHelpEnabled: boolean;
  onInitialHelpToggle: () => void;
  activeDeviceMode: DeviceMode;
  textSizeLevel: TextSizeLevel;
  textSizeLevels: readonly TextSizeLevel[];
  onTextSizeLevelChange: (level: TextSizeLevel) => void;
  onProjectSelect: (
    project: PortfolioData["projects"]["categories"][number]["items"][number],
    categoryLabel: string
  ) => void;
};

export function Navbar({
  brand,
  links,
  projects,
  formacion,
  contactForm,
  contactSocial,
  legal,
  uiText,
  theme,
  activePanel,
  onActivePanelChange,
  onThemeToggle,
  locale,
  onLocaleChange,
  showInitialHelpSetting,
  initialHelpEnabled,
  onInitialHelpToggle,
  activeDeviceMode,
  textSizeLevel,
  textSizeLevels,
  onTextSizeLevelChange,
  onProjectSelect,
}: Props) {
  const railRef = useRef<HTMLElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const defaultFormacionItemId = "autodesk-authorized-developer";
  const [openFormationId, setOpenFormationId] = useState<string | null>(null);
  const aboutParagraphs = brand.aboutText
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean);
  const leadParagraph = aboutParagraphs[0] ?? "";
  const bodyParagraph = aboutParagraphs[1] ?? "";
  const isBrandOpen   = activePanel === "brand";
  const isSettingsOpen = activePanel === "settings";
  const openLink = activePanel && activePanel !== "brand" && activePanel !== "settings"
    ? links.find(l => l.id === activePanel)
    : undefined;
  const bookingLink = links.find(l => l.id === "citas");
  const contactLink = links.find(l => l.id === "contacto");

  useEffect(() => {
    if (activePanel == null) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target;
      if (t instanceof Node && railRef.current?.contains(t)) return;
      if (t instanceof Node && flyoutRef.current?.contains(t)) return;
      onActivePanelChange(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [activePanel, onActivePanelChange]);

  const effectiveOpenFormationId =
    activePanel === "formacion" ? (openFormationId ?? defaultFormacionItemId) : null;

  const fullNameA11y = `${brand.nameMain} ${brand.nameRest}`;
  const deviceModeLabelMap: Record<DeviceMode, string> = {
    mobile: uiText.textSizeModeMobile,
    tablet: uiText.textSizeModeTablet,
    desktop: uiText.textSizeModeDesktop,
  };
  const flyoutLabel =
    isBrandOpen
      ? uiText.siteBrandLabel
      : isSettingsOpen
        ? uiText.settingsLabel
        : openLink
          ? openLink.label
          : uiText.panelFallbackLabel;

  return (
    <>
      <aside className="nav-rail" ref={railRef} aria-label={uiText.railAriaLabel}>
        <button
          type="button"
          className={`nav-rail__brand nav-rail__brand--action${isBrandOpen ? " is-active" : ""}`}
          onClick={() => onActivePanelChange(p => (p === "brand" ? null : "brand"))}
          title={`${brand.nameMain}${brand.nameJoin}${brand.nameRest} | ${brand.tagline}`}
          aria-expanded={isBrandOpen}
          aria-controls="nav-flyout"
        >
          <span className="nav-rail__brand-mark" aria-hidden>
            {brand.initials}
          </span>
          <span className="visually-hidden">{uiText.brandScreenReaderPrefix} {fullNameA11y}</span>
        </button>

        <nav className="nav-rail__tabs" aria-label={uiText.sectionsAriaLabel}>
          {links.map(link => {
            const isOpen = activePanel === link.id;
            return (
              <button
                key={link.id}
                type="button"
                className={`nav-rail__icon-btn${isOpen ? " is-active" : ""}`}
                onClick={() => onActivePanelChange(p => (p === link.id ? null : link.id))}
                aria-expanded={isOpen}
                aria-controls="nav-flyout"
                title={link.label}
              >
                <span className="nav-rail__icon-pill" aria-hidden />
                <NavIcon name={link.icon} title={link.label} />
              </button>
            );
          })}
        </nav>

        {/* Botón de configuración — ancla al fondo del rail */}
        <button
          type="button"
          className={`nav-rail__icon-btn nav-rail__settings-btn${isSettingsOpen ? " is-active" : ""}`}
          onClick={() => onActivePanelChange(p => (p === "settings" ? null : "settings"))}
          aria-expanded={isSettingsOpen}
          aria-controls="nav-flyout"
          title={uiText.settingsLabel}
        >
          <span className="nav-rail__icon-pill" aria-hidden />
          <Settings size={22} strokeWidth={1.6} aria-hidden />
        </button>
      </aside>

      <div
        ref={flyoutRef}
        id="nav-flyout"
        className={`nav-rail__flyout${activePanel != null ? " is-open" : ""}${
          activePanel === "citas" ? " nav-rail__flyout--booking" : ""
        }`}
        aria-hidden={activePanel == null}
        role="region"
        aria-label={flyoutLabel}
      >
        {isBrandOpen && (
          <div className="nav-rail__flyout-inner nav-rail__flyout-inner--brand">
            <div className="nav-flyout-brand" aria-label={fullNameA11y}>
              <p className="nav-flyout-brand__line1">
                <span className="nav-flyout-brand__title-card">
                  <Link
                    href={`/${locale}`}
                    className="nav-flyout-brand__title-link"
                    onClick={() => onActivePanelChange(null)}
                  >
                    <span className="nav-flyout-brand__name-main">{brand.nameMain}</span>
                    <span className="nav-flyout-brand__name-join">{brand.nameJoin}</span>
                    <span className="nav-flyout-brand__name-rest">{brand.nameRest}</span>
                  </Link>
                </span>
              </p>
              <section className="nav-flyout-about" aria-label={brand.aboutKicker}>
                <p className="nav-flyout-about__kicker">{brand.aboutKicker}</p>
                <p className="nav-flyout-about__role">{brand.aboutRole}</p>
                <p className="nav-flyout-about__lead">{leadParagraph}</p>
                {bodyParagraph && <p className="nav-flyout-about__text">{bodyParagraph}</p>}
                {brand.aboutStatement && (
                  <p className="nav-flyout-about__statement">{brand.aboutStatement}</p>
                )}
              </section>
              <nav className="nav-flyout-about__legal" aria-label={legal.footerAriaLabel}>
                <Link href={`/${locale}/legal/aviso-legal`} onClick={() => onActivePanelChange(null)}>
                  {legal.links.legalNotice}
                </Link>
                <Link href={`/${locale}/legal/privacidad`} onClick={() => onActivePanelChange(null)}>
                  {legal.links.privacy}
                </Link>
                <Link href={`/${locale}/legal/cookies`} onClick={() => onActivePanelChange(null)}>
                  {legal.links.cookies}
                </Link>
              </nav>
            </div>
          </div>
        )}
        {openLink && openLink.id !== "citas" && openLink.id !== "contacto" && (
          <div
            className={`nav-rail__flyout-inner${
              openLink.id === "proyectos" ||
              openLink.id === "formacion"
                ? " nav-rail__flyout-inner--projects"
                : ""
            }`}
          >
            <p className="nav-rail__flyout-kicker">{uiText.sectionKicker}</p>
            <h2 className="nav-rail__flyout-title">{openLink.label}</h2>
            <p className="nav-rail__flyout-desc">{openLink.description}</p>
            {openLink.id === "proyectos" && (
              <div className="nav-projects">
                {projects.categories.map(category => (
                  <section key={category.id} className="nav-projects__category" aria-label={category.label}>
                    <h3 className="nav-projects__category-title">{category.label}</h3>
                    <ul className="nav-projects__list">
                      {category.items.map(item => (
                        <li key={item.id} className="nav-projects__item">
                          <button
                            type="button"
                            className="nav-projects__item-btn"
                            onClick={() => { onProjectSelect(item, category.label); onActivePanelChange(null); }}
                          >
                            <p className="nav-projects__item-name">{item.name}</p>
                            <p className="nav-projects__item-summary">{item.summary}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
            {openLink.id === "formacion" && (
              <div className="nav-projects">
                {formacion.categories.map(category => (
                  <section key={category.id} className="nav-projects__category" aria-label={category.label}>
                    <h3 className="nav-projects__category-title">{category.label}</h3>
                    <ul className="nav-projects__list">
                      {category.items.map(item => {
                        const isExpanded = effectiveOpenFormationId === item.id;
                        const panelId = `formacion-desc-${item.id}`;
                        const logoSrc =
                          theme === "light"
                            ? (item.logoLight ?? item.logoDark)
                            : (item.logoDark ?? item.logoLight);
                        return (
                          <li key={item.id} className="nav-projects__item nav-projects__item--static">
                            <div
                              className={`nav-formacion__details${isExpanded ? " nav-formacion__details--open" : ""}`}
                            >
                              <button
                                type="button"
                                className="nav-formacion__summary"
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                                id={`formacion-trigger-${item.id}`}
                                onClick={() => {
                                  setOpenFormationId(prev => (prev === item.id ? null : item.id));
                                }}
                              >
                                <span className="nav-formacion__summary-text">
                                  <span className="nav-projects__item-name nav-formacion__summary-title">{item.name}</span>
                                  <span className="nav-projects__item-summary nav-formacion__summary-meta">{item.meta}</span>
                                </span>
                                <span className="nav-formacion__summary-chevron" aria-hidden>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6" />
                                  </svg>
                                </span>
                              </button>
                              {isExpanded && (
                                <div className="nav-formacion__desc" id={panelId} aria-labelledby={`formacion-trigger-${item.id}`}>
                                  {logoSrc != null && (
                                    <div className="nav-formacion__logo-wrap">
                                      <Image
                                        src={logoSrc}
                                        alt={item.logoAlt ?? item.name}
                                        className="nav-formacion__logo"
                                        width={240}
                                        height={80}
                                        loading="lazy"
                                      />
                                    </div>
                                  )}
                                  <p className="nav-formacion__desc-text">{item.description}</p>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
        {contactLink && (
          <div
            className="nav-rail__flyout-inner nav-rail__flyout-inner--projects nav-rail__flyout-inner--contact"
            hidden={activePanel !== "contacto"}
            aria-hidden={activePanel !== "contacto"}
            style={{ display: activePanel === "contacto" ? "flex" : "none" }}
          >
            <p className="nav-rail__flyout-kicker">{uiText.sectionKicker}</p>
            <h2 className="nav-rail__flyout-title">{contactLink.label}</h2>
            <p className="nav-rail__flyout-desc">{contactLink.description}</p>
            <ContactForm copy={contactForm} />
            <ContactSocialRow contactSocial={contactSocial} />
          </div>
        )}
        {bookingLink && activePanel === "citas" && (
          <div
            className="nav-rail__flyout-inner nav-rail__flyout-inner--projects"
            aria-hidden={false}
          >
            <p className="nav-rail__flyout-kicker">{uiText.sectionKicker}</p>
            <h2 className="nav-rail__flyout-title">{bookingLink.label}</h2>
            <p className="nav-rail__flyout-desc">{bookingLink.description}</p>
            <CalBookingEmbed theme={theme} locale={locale} />
          </div>
        )}
        {isSettingsOpen && (
          <div className="nav-rail__flyout-inner nav-rail__flyout-inner--settings">
            <p className="nav-rail__flyout-kicker">{uiText.settingsKicker}</p>
            <h2 className="nav-rail__flyout-title">{uiText.settingsTitle}</h2>
            <div className="nav-settings-option">
              <div className="nav-settings-option__copy">
                <p className="nav-settings-option__title">{uiText.themeTitle}</p>
                <p className="nav-settings-option__desc">
                  {uiText.themeDescription}
                </p>
              </div>
              <button
                type="button"
                className={`theme-toggle${theme === "light" ? " is-light" : ""}`}
                onClick={onThemeToggle}
                aria-label={theme === "dark" ? uiText.switchToLightLabel : uiText.switchToDarkLabel}
              >
                <span className="theme-toggle__thumb" />
              </button>
            </div>
            <div className="nav-settings-option nav-settings-option--text-size">
              <div className="nav-settings-option__copy">
                <p className="nav-settings-option__title">{uiText.languageTitle}</p>
                <p className="nav-settings-option__desc">
                  {uiText.languageDescription}
                </p>
              </div>
              <div className="text-size-levels text-size-levels--locale" role="group" aria-label={uiText.languageTitle}>
                <button
                  type="button"
                  className={`text-size-level-btn${locale === "es" ? " is-active" : ""}`}
                  onClick={() => onLocaleChange("es")}
                  aria-pressed={locale === "es"}
                  aria-label={uiText.switchToSpanishLabel}
                >
                  {uiText.languageSpanishLabel}
                </button>
                <button
                  type="button"
                  className={`text-size-level-btn${locale === "en" ? " is-active" : ""}`}
                  onClick={() => onLocaleChange("en")}
                  aria-pressed={locale === "en"}
                  aria-label={uiText.switchToEnglishLabel}
                >
                  {uiText.languageEnglishLabel}
                </button>
              </div>
            </div>
            {showInitialHelpSetting && (
              <div className="nav-settings-option">
                <div className="nav-settings-option__copy">
                  <p className="nav-settings-option__title">{uiText.initialHelpTitle}</p>
                  <p className="nav-settings-option__desc">
                    {uiText.initialHelpDescription}
                  </p>
                </div>
                <button
                  type="button"
                  className={`theme-toggle${initialHelpEnabled ? " is-light" : ""}`}
                  onClick={onInitialHelpToggle}
                  aria-label={initialHelpEnabled ? uiText.initialHelpOnLabel : uiText.initialHelpOffLabel}
                >
                  <span className="theme-toggle__thumb" />
                </button>
              </div>
            )}
            <div className="nav-settings-option nav-settings-option--text-size">
              <div className="nav-settings-option__copy">
                <p className="nav-settings-option__title">{uiText.textSizeTitle}</p>
                <p className="nav-settings-option__desc">
                  {uiText.textSizeDescription}
                </p>
              </div>
              <div
                className="text-size-levels"
                role="group"
                aria-label={`${uiText.textSizeOptionLabel} (${deviceModeLabelMap[activeDeviceMode]})`}
              >
                {textSizeLevels.map(level => (
                  <button
                    key={level}
                    type="button"
                    className={`text-size-level-btn${textSizeLevel === level ? " is-active" : ""}`}
                    onClick={() => onTextSizeLevelChange(level)}
                    aria-pressed={textSizeLevel === level}
                    aria-label={`${uiText.textSizeOptionLabel} ${level > 0 ? `+${level}` : level}`}
                  >
                    {level > 0 ? `+${level}` : level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
