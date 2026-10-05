// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { DOCUMENTATION_URL, GITHUB_URL } from "@/lib/constants";
import logoLandscapeSrc from "@/assets/images/logo-landscape.png";

export function ComingSoonPage() {
  // Child routes rendered underneath set their own <title>; override it.
  useEffect(() => {
    document.title = "Coming soon | Weave.js";
  }, []);

  return (
    <div className="relative isolate min-h-screen flex flex-col bg-background text-foreground font-sans">
      <img
        src="/coming-soon-bg.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-background/40 dark:bg-background/60"
      />
      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 text-center">
        <div className="flex flex-col items-center gap-3 bg-background px-9 py-7 shadow-sm">
          <img
            src={logoLandscapeSrc}
            alt="Weave.js"
            width={207}
            height={24}
            className="dark:invert"
          />
          <h1 className="text-3xl md:text-4xl font-light">SHOWCASE</h1>
        </div>
        <div className="flex flex-col items-center">
          <p className="max-w-md text-base text-foreground/80">
            We are getting things ready. This site is temporarily unavailable
            and will be back shortly.
          </p>
        </div>
      </main>
      <footer className="absolute inset-x-0 bottom-0 bg-background py-4 text-sm">
        <nav
          aria-label="Project links"
          className="flex justify-center items-center gap-4"
        >
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <ExternalLink size={16} strokeWidth={1} aria-hidden="true" />
            GITHUB
          </a>
          <span aria-hidden="true">|</span>
          <a
            href={DOCUMENTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <ExternalLink size={16} strokeWidth={1} aria-hidden="true" />
            DOCUMENTATION
          </a>
        </nav>
      </footer>
    </div>
  );
}
