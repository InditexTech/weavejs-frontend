// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Toaster } from "@/components/ui/sonner";
import { ShowcaseDependencies } from "@/components/showcase/showcase.dependencies";
import { ShowcaseLeftSidebar } from "@/components/showcase/showcase.left-sidebar";
import { Markdown } from "./markdown";

type LegalPageProps = {
  title: string;
  markdown: string;
};

export function LegalPage({ title, markdown }: Readonly<LegalPageProps>) {
  return (
    <>
      <main className="relative w-full h-dvh grid grid-cols-1 lg:grid-cols-[400px_1fr] bg-background text-foreground font-sans">
        <div className="hidden lg:block h-dvh">
          <ShowcaseLeftSidebar />
        </div>
        <div className="h-dvh overflow-y-auto">
          <div className="max-w-[68ch] p-8 flex flex-col gap-8">
            <h1 className="text-3xl leading-6 font-light tracking-tight text-foreground text-balance">
              {title}
            </h1>
            <article>
              <Markdown>{markdown}</Markdown>
            </article>
          </div>
        </div>
        <ShowcaseDependencies />
      </main>
      <Toaster
        offset={16}
        mobileOffset={16}
        toastOptions={{
          classNames: {
            toast: "w-full !font-light text-xs drop-shadow",
            content: "w-full",
            title: "w-full !font-light text-sm",
            description: "w-full !font-light text-xs !text-black",
          },
          style: {
            borderRadius: "0px",
            boxShadow: "none",
          },
        }}
      />
    </>
  );
}
