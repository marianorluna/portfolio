"use client";

import { useEffect, useState } from "react";
import {
  resolveLabBentoBreakpoint,
  type LabBentoBreakpoint,
} from "@/lib/lab/bento-pages";

/** Breakpoint del bento Lab alineado con los media queries de `globals.css`. */
export function useLabBentoBreakpoint(): LabBentoBreakpoint {
  const [breakpoint, setBreakpoint] = useState<LabBentoBreakpoint>("desktop");

  useEffect(() => {
    const sync = () => setBreakpoint(resolveLabBentoBreakpoint(window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return breakpoint;
}
