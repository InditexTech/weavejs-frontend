// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { createPortal } from "react-dom";
import { Rooms } from "../room-components/rooms/rooms";
import { CreateRoomDialog } from "../room-components/overlay/create-room";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { ShowcaseDependencies } from "../showcase/showcase.dependencies";
import { ShowcaseLeftSidebar } from "../showcase/showcase.left-sidebar";
import { EditRoomDialog } from "../room-components/overlay/edit-room";
import { DeleteRoomDialog } from "../room-components/overlay/delete-room";
import { RoomAccessLinkDialog } from "../room-components/overlay/room-acces-link";
import { JoinRoomDialog } from "../room-components/overlay/join-room";
import { useGlobalEvents } from "../room-components/hooks/use-global-events";
import { useHandleGlobalEvents } from "../room-components/hooks/use-handle-global-events";
import { SessionLogin } from "../session/session.login";
import { SignOverlay } from "../sign-overlay/sign-overlay";

export const Home = () => {
  return (
    <>
      <HomeInternal />
      <Toasts />
    </>
  );
};

const HomeInternal = () => {
  const { session } = useGetSession();

  useGlobalEvents();
  useHandleGlobalEvents();

  return (
    <>
      <main className="w-full h-full grid grid-cols-[400px_1fr] 2xl:grid-cols-[400px_1fr] flex justify-center items-center relative">
        <ShowcaseLeftSidebar />
        <div className="w-full h-dvh flex flex-col items-center justify-center">
          {!session && <SessionLogin />}
          {session && <Rooms kind="showcase" />}
        </div>
        <ShowcaseDependencies />
      </main>
      <CreateRoomDialog kind="showcase" />
      <JoinRoomDialog />
      <EditRoomDialog />
      <DeleteRoomDialog />
      <RoomAccessLinkDialog />
      <SignOverlay />
    </>
  );
};

const Toasts = () => {
  const toasterContent = (
    <Toaster
      offset={16}
      mobileOffset={16}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "w-full !font-light text-xs",
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
  );

  // Only render in the browser
  if (typeof window === "undefined") return null;

  return createPortal(toasterContent, document.body);
};
