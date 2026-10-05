// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import "./globals.css";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import React from "react";
import {
  hasPreviewCandidate,
  resolvePreviewAccess,
} from "../../lib/coming-soon-preview-browser";
import { isAllowedPath, isComingSoonEnabled } from "../../lib/coming-soon";
import { ComingSoonPage } from "@/components/coming-soon/coming-soon-page";
import { NotFound } from "@/components/not-found/not-found";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: isComingSoonEnabled()
          ? "width=device-width, initial-scale=1"
          : "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
      { title: "Weave.js" },
      {
        name: "description",
        content:
          "Weave.js, an open source library to build collaborative visual canvas applications.",
      },
      ...(isComingSoonEnabled()
        ? [{ name: "robots", content: "noindex, nofollow" }]
        : []),
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  const { pathname } = useLocation();
  const gated = isComingSoonEnabled() && !isAllowedPath(pathname);
  // "idle": SSR + first client render (shows coming soon, hydrates cleanly)
  // "checking": validating a preview key/token (render nothing, no flash)
  const [preview, setPreview] = React.useState<
    "idle" | "checking" | "granted" | "denied"
  >("idle");

  React.useEffect(() => {
    if (!gated || preview !== "idle") return;
    if (!hasPreviewCandidate()) {
      setPreview("denied");
      return;
    }
    setPreview("checking");
    resolvePreviewAccess()
      .then((ok) => setPreview(ok ? "granted" : "denied"))
      .catch(() => setPreview("denied"));
  }, [gated, preview]);

  const blocked = gated && preview !== "granted";

  let content: React.ReactNode = <Outlet />;
  if (blocked) {
    // While validating a preview key/token render nothing (no flash).
    content = preview === "checking" ? null : <ComingSoonPage />;
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <HeadContent />
      </head>
      <body>
        {content}
        <Scripts />
      </body>
    </html>
  );
}
