// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";

const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export function useBreakpoint() {
  const getBreakpoint = () => {
    if (window.matchMedia(breakpoints["2xl"]).matches) return "2xl";
    if (window.matchMedia(breakpoints.xl).matches) return "xl";
    if (window.matchMedia(breakpoints.lg).matches) return "lg";
    if (window.matchMedia(breakpoints.md).matches) return "md";
    if (window.matchMedia(breakpoints.sm).matches) return "sm";
    return "base";
  };

  const [breakpoint, setBreakpoint] = useState(getBreakpoint);

  useEffect(() => {
    const mediaQueries = Object.values(breakpoints).map((query) =>
      window.matchMedia(query),
    );

    const handler = () => setBreakpoint(getBreakpoint());

    mediaQueries.forEach((mq) => mq.addEventListener("change", handler));

    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener("change", handler));
    };
  }, []);

  return breakpoint;
}
