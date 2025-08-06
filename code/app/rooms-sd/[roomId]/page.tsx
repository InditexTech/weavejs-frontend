// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { RoomShadowDomHost } from "@/components/room/room-shadow-dom-host";
import { NoSsr } from "@/components/room-components/no-ssr";

export default function RoomPage() {
  return (
    <NoSsr>
      <RoomShadowDomHost />
    </NoSsr>
  );
}
