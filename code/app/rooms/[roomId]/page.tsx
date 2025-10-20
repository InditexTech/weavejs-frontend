// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

// import { Room } from "@/components/room/room";
// import { NoSsr } from "@/components/room-components/no-ssr";
import dynamic from "next/dynamic";

const NoSsr = dynamic(
  () => import("@/components/room-components/no-ssr").then((mod) => mod.NoSsr),
  { ssr: false }
);
const Room = dynamic(
  () => import("@/components/room/room").then((mod) => mod.Room),
  { ssr: false }
);

export default function RoomPage() {
  if (typeof window !== "undefined") {
    return null;
  }

  return (
    <NoSsr>
      <Room />
    </NoSsr>
  );
}
