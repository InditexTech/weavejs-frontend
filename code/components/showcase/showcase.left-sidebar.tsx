// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Logo } from "@/components/utils/logo";
import { ExternalLink } from "lucide-react";
import { DOCUMENTATION_URL, GITHUB_URL } from "@/lib/constants";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { useCollaborationRoom } from "@/store/store";
import { Link, useRouterState } from "@tanstack/react-router";
import { LEGAL_PAGES, LEGAL_PATHS } from "@/lib/legal-pages";
import { SectionTitle } from "../utils/section-title";
import { BuildInfo } from "../utils/build-info";
import { cn } from "@/lib/utils";
import { ShowcaseUserMenu } from "./showcase.user-menu";

const rowClass = (active: boolean) =>
  cn(
    "w-[calc(100%+1.5rem)] -mx-3 px-3 py-2 inline-flex items-center gap-2 text-left text-base cursor-pointer font-inter tracking-wide transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-black",
    active
      ? "bg-neutral-100 text-black font-normal"
      : "text-neutral-600 font-light hover:bg-neutral-50 hover:text-black",
  );

const SidebarNavLink = ({
  to,
  active,
  children,
}: Readonly<{
  to: string;
  active: boolean;
  children: React.ReactNode;
}>) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className={cn(rowClass(active), active && "pointer-events-none")}
  >
    {children}
  </Link>
);

export const ShowcaseLeftSidebar = () => {
  const location = useRouterState({ select: (s) => s.location });

  const isStandalone = location.pathname.startsWith("/use-cases/standalone");
  const isTemplates = location.pathname.startsWith("/use-cases/templates");
  const isLegal = LEGAL_PATHS.includes(location.pathname);
  const isShowcase = !isStandalone && !isTemplates && !isLegal;

  const dependenciesVisible = useCollaborationRoom(
    (state) => state.dependencies.visible,
  );
  const setDependenciesVisible = useCollaborationRoom(
    (state) => state.setDependenciesVisible,
  );

  const { session } = useGetSession();
  const legalLinks = LEGAL_PAGES.map((page) => (
    <SidebarNavLink
      key={page.to}
      to={page.to}
      active={location.pathname === page.to}
    >
      {page.label}
    </SidebarNavLink>
  ));

  return (
    <div className="w-full h-full flex flex-col gap-8 overflow-y-auto border-r border-r-[0.5px] border-[#c9c9c9] p-8 justify-between items-start">
      <div className="w-full flex flex-col gap-2 justify-start items-start">
        <Logo kind="landscape" variant="no-text" />
        <nav
          aria-label="Showcase sections"
          className="w-full mt-8 flex flex-col gap-8 justify-start items-start"
        >
          <SidebarNavLink to="/" active={isShowcase}>
            SHOWCASE
          </SidebarNavLink>
          <div className="w-full flex flex-col gap-1 justify-start items-start">
            <SectionTitle>Use cases</SectionTitle>
            <SidebarNavLink to="/use-cases/standalone" active={isStandalone}>
              STANDALONE
            </SidebarNavLink>
          </div>
        </nav>
      </div>
      <div className="w-full flex flex-col gap-8 justify-start items-start">
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <SectionTitle>Legal</SectionTitle>
          {legalLinks}
        </div>
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <SectionTitle>Resources</SectionTitle>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass(false)}
          >
            GITHUB <ExternalLink strokeWidth={1} className="size-3.5" />
          </a>
          <a
            href={DOCUMENTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass(false)}
          >
            DOCUMENTATION <ExternalLink strokeWidth={1} className="size-3.5" />
          </a>
          <button
            type="button"
            aria-pressed={dependenciesVisible}
            onClick={() => {
              setDependenciesVisible(!dependenciesVisible);
            }}
            className={rowClass(dependenciesVisible)}
          >
            DEPENDENCIES
          </button>
        </div>
        <BuildInfo />
        {session && session.user && (
          <ShowcaseUserMenu user={session.user} showCopyUserId />
        )}
      </div>
    </div>
  );
};
