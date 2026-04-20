// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { ShowcaseLeftSidebar } from "@/components/showcase/showcase.left-sidebar";
import { SessionLogin } from "@/components/session/session.login";
import { ShowcaseDependencies } from "@/components/showcase/showcase.dependencies";
import { useGetSession } from "@/components/room-components/hooks/use-get-session";
import { Rooms } from "@/components/room-components/rooms/rooms";
import { CreateRoomDialog } from "@/components/room-components/overlay/create-room";
import { JoinRoomDialog } from "@/components/room-components/overlay/join-room";
import { EditRoomDialog } from "@/components/room-components/overlay/edit-room";
import { DeleteRoomDialog } from "@/components/room-components/overlay/delete-room";
import { RoomAccessLinkDialog } from "@/components/room-components/overlay/room-acces-link";
import { SignOverlay } from "@/components/sign-overlay/sign-overlay";

export const TemplatesHomePage = () => {
  const { session } = useGetSession();

  return (
    <>
      <main className="w-full h-full grid grid-cols-[400px_1fr] 2xl:grid-cols-[400px_1fr] flex justify-center items-center relative">
        <ShowcaseLeftSidebar />
        <div className="w-full h-dvh flex flex-col items-center justify-center">
          {!session && <SessionLogin />}
          {session && <Rooms kind="templates" />}
        </div>
        <ShowcaseDependencies />
      </main>
      <CreateRoomDialog kind="templates" />
      <JoinRoomDialog />
      <EditRoomDialog />
      <DeleteRoomDialog />
      <RoomAccessLinkDialog />
      <SignOverlay />
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
};
