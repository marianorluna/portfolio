"use client";

import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import {
  getLabBentoPageCount,
  getLabBentoPageItems,
  LAB_BENTO_CAPACITY,
} from "@/lib/lab/bento-pages";
import {
  LabCardRevealProvider,
  useLabCardRevealClear,
} from "@/components/lab/LabCardRevealContext";
import { useLabBentoBreakpoint } from "@/components/lab/useLabBentoBreakpoint";

type Props = {
  hero: ReactNode;
  items: ReactNode[];
  nextPageLabel: string;
  prevPageLabel: string;
  pagesNavOpenLabel: string;
  pagesNavCloseLabel: string;
};

function wrapSlot(node: ReactNode, slot: string, key: string): ReactElement {
  return (
    <div key={key} className={`lab-bento__slot lab-bento__slot--${slot}`}>
      {node}
    </div>
  );
}

/** Viewport slideshow: desktop 5×3; tablet/móvil 2×4 con fill por resultados. */
export function LabBentoSlideshow(props: Props) {
  return (
    <LabCardRevealProvider>
      <LabBentoSlideshowInner {...props} />
    </LabCardRevealProvider>
  );
}

function LabBentoSlideshowInner({
  hero,
  items,
  nextPageLabel,
  prevPageLabel,
  pagesNavOpenLabel,
  pagesNavCloseLabel,
}: Props) {
  const breakpoint = useLabBentoBreakpoint();
  const clearReveal = useLabCardRevealClear();
  const compactNav = breakpoint !== "desktop";
  const itemList = useMemo(
    () => Children.toArray(items).filter(Boolean),
    [items]
  );
  const totalPages = getLabBentoPageCount(itemList.length, breakpoint);
  const fullHomeCount = 1 + LAB_BENTO_CAPACITY[breakpoint].firstContent;
  const fullMoreCount = LAB_BENTO_CAPACITY[breakpoint].moreSize;
  const [page, setPage] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const navOpenVisible = compactNav && navOpen;

  useEffect(() => {
    clearReveal();
  }, [safePage, clearReveal]);

  const goPrev = useCallback(() => {
    setPage((current) => Math.max(0, current - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((current) => Math.min(totalPages - 1, current + 1));
  }, [totalPages]);

  useEffect(() => {
    if (totalPages <= 1) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, totalPages]);

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, pageIndex) => {
      const pageItems = getLabBentoPageItems(itemList, pageIndex, breakpoint);
      if (pageIndex === 0) {
        const [feat, ...rest] = pageItems;
        const contentCount = pageItems.length;
        const compactFill =
          breakpoint !== "desktop"
            ? Math.min(Math.max(contentCount, 0), 6)
            : null;
        return {
          key: `page-${pageIndex}`,
          variant: "home" as const,
          count: 1 + contentCount,
          fullCount: fullHomeCount,
          compactFill,
          nodes: [
            wrapSlot(hero, "hero", "hero"),
            ...(feat != null ? [wrapSlot(feat, "feat", "feat")] : []),
            ...rest.map((node, index) =>
              wrapSlot(node, `s${index + 2}`, `home-${index + 2}`)
            ),
          ],
        };
      }
      return {
        key: `page-${pageIndex}`,
        variant: "more" as const,
        count: pageItems.length,
        fullCount: fullMoreCount,
        compactFill: null as number | null,
        nodes: pageItems.map((node, index) =>
          wrapSlot(node, `m${index}`, `more-${pageIndex}-${index}`)
        ),
      };
    });
  }, [breakpoint, fullHomeCount, fullMoreCount, hero, itemList, totalPages]);

  const controlsId = "lab-bento-nav-controls";

  return (
    <div className="lab-bento-stage">
      <div
        className="lab-bento-track"
        style={{ transform: `translate3d(-${safePage * 100}%, 0, 0)` }}
      >
        {pages.map((entry) => {
          const useCompactFill = entry.compactFill != null;
          const usePartial =
            !useCompactFill && entry.count < entry.fullCount;
          return (
            <section
              key={entry.key}
              className={[
                "lab-bento-page",
                `lab-bento-page--${entry.variant}`,
                useCompactFill
                  ? `lab-bento-page--compact-fill-${entry.compactFill}`
                  : "",
                usePartial ? "lab-bento-page--partial" : "",
                usePartial ? `lab-bento-page--count-${entry.count}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={pages[safePage]?.key !== entry.key}
            >
              {entry.nodes}
            </section>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div
          className={[
            "lab-bento-nav-dock",
            compactNav ? "lab-bento-nav-dock--compact" : "",
            navOpenVisible ? "is-open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {compactNav && (
            <button
              type="button"
              className="lab-bento-nav__tab"
              onClick={() => setNavOpen((open) => !open)}
              aria-expanded={navOpenVisible}
              aria-controls={controlsId}
              aria-label={navOpenVisible ? pagesNavCloseLabel : pagesNavOpenLabel}
            >
              {navOpenVisible ? (
                <ChevronDown size={18} strokeWidth={2.2} aria-hidden />
              ) : (
                <ChevronUp size={18} strokeWidth={2.2} aria-hidden />
              )}
            </button>
          )}

          <div
            id={controlsId}
            className="lab-bento-nav"
            hidden={compactNav && !navOpenVisible}
          >
            <button
              type="button"
              className="lab-bento-nav__btn"
              onClick={goPrev}
              disabled={safePage === 0}
              aria-label={prevPageLabel}
            >
              <ChevronLeft size={22} aria-hidden />
              <span>{prevPageLabel}</span>
            </button>
            <p className="lab-bento-nav__indicator" aria-live="polite">
              {safePage + 1} / {totalPages}
            </p>
            <button
              type="button"
              className="lab-bento-nav__btn"
              onClick={goNext}
              disabled={safePage >= totalPages - 1}
              aria-label={nextPageLabel}
            >
              <span>{nextPageLabel}</span>
              <ChevronRight size={22} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
