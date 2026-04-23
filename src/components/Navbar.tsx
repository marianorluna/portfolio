import type { NavLink } from "@/types/portfolio";

type Props = {
  logo: string;
  links: NavLink[];
  cta: string;
  activeNav: string;
  onNavClick: (id: string) => void;
  onCtaClick: () => void;
};

export function Navbar({ logo, links, cta, activeNav, onNavClick, onCtaClick }: Props) {
  return (
    <nav>
      <div className="nav-logo">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="7" height="11" rx="1" fill="#4a9eff" opacity="0.9" />
          <rect x="10" y="6" width="7" height="11" rx="1" fill="#8b5cf6" opacity="0.6" />
          <line x1="8" y1="6" x2="10" y2="11" stroke="#4a9eff" strokeWidth="1" />
        </svg>
        {logo}
      </div>
      <div className="nav-links">
        {links.map(link => (
          <button
            key={link.id}
            className={`nav-link${activeNav === link.id ? " active" : ""}`}
            onClick={() => onNavClick(link.id)}
            type="button"
          >
            {link.label}
          </button>
        ))}
      </div>
      <button className="nav-cta" type="button" onClick={onCtaClick}>
        {cta}
      </button>
    </nav>
  );
}
