// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/home/home";
import { AppProviders } from "../providers";
import { NotFound } from "@/components/not-found/not-found";
import { NoSsr } from "@/components/room-components/no-ssr";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "Home | Showcase | Weave.js",
      },
    ],
  }),
  notFoundComponent: NotFound,
});

function HomePage() {
  return (
    <NoSsr>
      <div className="hidden lg:block w-full h-full">
        <ClientOnly fallback={null}>
          <AppProviders>
            <Home />
          </AppProviders>
        </ClientOnly>
      </div>
      <div className="block block lg:hidden flex justify-center items-center text-center w-full h-full">
        <div>
          <b>Weave.js</b> only works
          <br />
          on resolutions greater than <b>768px</b>
          <br />
          (tablet or desktop devices)
        </div>
      </div>
    </NoSsr>
  );
}
