import type { NavIconName } from "@/types/portfolio";

const SIZE = 22;

type Props = {
  name: NavIconName;
  className?: string;
  title?: string;
};

export function NavIcon({ name, className, title }: Props) {
  const common = {
    width: SIZE,
    height: SIZE,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "folder") {
    return (
      <svg {...common} className={className} role="img" aria-label={title}>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.2 1.5H19A2.5 2.5 0 0 1 21.5 9V17.5A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5V7.5Z" />
        <path d="M3 8.5V6.5A1.5 1.5 0 0 1 4.5 5h2" opacity="0.4" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg {...common} className={className} role="img" aria-label={title}>
        <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" />
        <path d="M3 12 12 16.5 21 12" />
        <path d="M3 16.5 12 21l9-4.5" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...common} className={className} role="img" aria-label={title}>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="m2.5 7.5 9.5 6.5L22 7.5" />
      </svg>
    );
  }

  return null;
}
