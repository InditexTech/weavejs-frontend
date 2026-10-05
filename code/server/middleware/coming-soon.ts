// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import {
  COMING_SOON_PATH,
  isAllowedPath,
  isComingSoonEnabled,
} from "../../lib/coming-soon";

export default function comingSoonMiddleware(event: {
  url: URL;
  res: { headers: Headers };
}) {
  if (!isComingSoonEnabled()) return;

  const { pathname } = event.url;

  if (isAllowedPath(pathname) && pathname !== COMING_SOON_PATH) return;

  // Keep the requested URL; the app renders the coming soon page in place.
  event.res.headers.set("X-Robots-Tag", "noindex, nofollow");
  event.res.headers.set("Cache-Control", "no-store");
}
