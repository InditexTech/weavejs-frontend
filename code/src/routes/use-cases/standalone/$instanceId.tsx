// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { NoSsr } from "@/components/room-components/no-ssr";
import { StandalonePage } from "@/components/use-cases/standalone/components/page/page";
import { ClientOnly } from "@tanstack/react-router";
import { AppProviders } from "@/src/providers";
import { NotFound } from "@/components/not-found/not-found";

export const Route = createFileRoute("/use-cases/standalone/$instanceId")({
  component: RoomPage,
  head: () => ({
    meta: [
      {
        title: "Room | Standalone | Weave.js",
      },
    ],
  }),
  notFoundComponent: NotFound,
});

function RoomPage() {
  return (
    <NoSsr>
      <div className="hidden lg:block w-full h-full">
        <ClientOnly fallback={null}>
          <AppProviders>
            <StandalonePage />
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
