// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import dynamic from "next/dynamic";

const NoSsr = dynamic(
  () => import("@/components/room-components/no-ssr").then((mod) => mod.NoSsr),
  { ssr: false },
);
const Room = dynamic(
  () => import("@/components/room/room").then((mod) => mod.Room),
  { ssr: false },
);

export default function RoomPage() {
  return (
    <NoSsr>
      <Room />
    </NoSsr>
  );
}
