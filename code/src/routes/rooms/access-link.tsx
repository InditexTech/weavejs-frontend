// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from "@tanstack/react-router";
import { NoSsr } from "@/components/room-components/no-ssr";
import { ClientOnly } from "@tanstack/react-router";
import { AppProviders } from "@/src/providers";
import { RoomAccessLink } from "@/components/room-access-link/room-access-link";

export const Route = createFileRoute("/rooms/access-link")({
  component: RoomPage,
  head: () => ({
    meta: [
      {
        title: "Room Access Link | Weave.js",
      },
    ],
  }),
  notFoundComponent: () => (
    <div style={{ padding: 20 }}>
      <h1>404 - Page not found</h1>
    </div>
  ),
});

function RoomPage() {
  return (
    <NoSsr>
      <div className="hidden lg:block w-full h-full">
        <ClientOnly fallback={null}>
          <AppProviders>
            <RoomAccessLink />
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
