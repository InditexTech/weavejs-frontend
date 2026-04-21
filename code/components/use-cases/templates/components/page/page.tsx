// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import useHandleRouteParams from "../../hooks/use-handle-route-params";
import { useTemplatesUseCase } from "../../store/store";
import { Templates } from "../templates/templates";
import { Images } from "../images/images";
import { Ban, LoaderCircle, X } from "lucide-react";
import { Menu } from "./menu";
import { AddToRoomDialog } from "../add-to-room/add-to-room.dialog";
import { Divider } from "@/components/room-components/overlay/divider";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { useGetSession } from "@/components/room-components/hooks/use-get-session";
import { useLoadRoom } from "@/components/room-components/hooks/use-load-room";
import { useCollaborationRoom } from "@/store/store";
import { Logo } from "@/components/utils/logo";
import { SessionLogin } from "@/components/session/session.login";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { RoomUser } from "@/components/room/room.user";
import { SignOverlay } from "@/components/sign-overlay/sign-overlay";

export const TemplatesPage = () => {
  const navigate = useNavigate();

  useHandleRouteParams();

  useLoadRoom();

  const { session, isPending } = useGetSession();

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const roomInfoLoading = useCollaborationRoom(
    (state) => state.roomInfo.loading,
  );
  const roomInfoLoaded = useCollaborationRoom((state) => state.roomInfo.loaded);
  const roomInfoError = useCollaborationRoom((state) => state.roomInfo.error);

  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const templatesManage = useTemplatesUseCase(
    (state) => state.templates.manage,
  );
  const setUser = useTemplatesUseCase((state) => state.setUser);
  const setTemplatesManage = useTemplatesUseCase(
    (state) => state.setTemplatesManage,
  );
  const setAddToRoomOpen = useTemplatesUseCase(
    (state) => state.setAddToRoomOpen,
  );

  React.useEffect(() => {
    if (roomInfo) {
      document.title = `${roomInfo.room.name} | Templates | Weave.js`;
    } else {
      document.title = `Room | Templates | Weave.js`;
    }
  }, [roomInfo]);

  React.useEffect(() => {
    setTemplatesManage(false);
    setAddToRoomOpen(false);
  }, [setTemplatesManage, setAddToRoomOpen]);

  React.useEffect(() => {
    if (instanceId !== "undefined" && !session) {
      const userStorage = sessionStorage.getItem(
        `weave.js_standalone_templates_${instanceId}`,
      );
      try {
        const userMapped = JSON.parse(userStorage ?? "");
        if (userMapped) {
          setUser(userMapped);
        }
        // eslint-disable-next-line no-empty
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, session]);

  if (!isPending && session && roomInfoLoading) {
    return (
      <div className="w-full h-full bg-transparent flex justify-center items-center overflow-hidden z-[101]">
        <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none">
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <Logo kind="landscape" variant="no-text" />
            <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
              TEMPLATES
            </h1>
          </div>
          <div className="w-full flex flex-col justify-center items-center text-black gap-8 mt-8">
            <div className="flex flex-col gap-3 justify-center items-center">
              <LoaderCircle
                strokeWidth={1}
                size={48}
                className="animate-spin"
              />
              <div className="w-full flex flex-col font-light text-lg justify-center items-center text-[#757575]">
                LOADING ROOM
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!isPending && session && roomInfoLoaded && roomInfoError) {
    return (
      <div className="w-full h-full bg-transparent flex justify-center items-center overflow-hidden z-[101]">
        <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none">
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <Logo kind="landscape" variant="no-text" />
            <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
              STANDALONE
            </h1>
          </div>
          <div className="w-full flex flex-col justify-center items-center text-black gap-8 mt-8">
            {roomInfoError && roomInfoError.cause === 404 && (
              <>
                <Divider className="h-[0.5px] w-full" />
                <Ban size={48} strokeWidth={1} />
                <div className="text-center text-base text-[#757575]">
                  <p>
                    The specified room does not exist.
                    <br />
                    It may have been deleted or the URL may be incorrect.
                  </p>
                </div>
              </>
            )}
            {roomInfoError && roomInfoError.cause === 403 && (
              <>
                <Divider className="h-[0.5px] w-full" />
                <Ban size={48} strokeWidth={1} />
                <div className="text-center text-base text-[#757575]">
                  <p>
                    You don't have permissions to access this room,
                    <br />
                    ask the room owner or any participant for an invite.
                  </p>
                </div>
              </>
            )}
            <Divider className="h-[0.5px] w-full" />
            <Button
              className="cursor-pointer font-inter font-light rounded-none"
              onClick={async () => {
                navigate({ to: "/use-cases/standalone" });
              }}
            >
              BACK TO HOME
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isPending && !session) {
    return (
      <>
        <div className="w-full h-full bg-transparent flex justify-center items-center overflow-hidden z-[101]">
          <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none">
            <div className="w-full flex flex-col gap-2 justify-center items-center">
              <Logo kind="landscape" variant="no-text" />
              <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
                STANDALONE
              </h1>
            </div>
            <div className="w-full flex flex-col justify-center items-center text-black gap-8 mt-8">
              <div className="text-center text-xl text-[#757575]">
                <p>YOU NEED TO SIGN IN</p>
              </div>
              <SessionLogin hideTitle />
            </div>
          </div>
        </div>
        <SignOverlay />
      </>
    );
  }

  if (!isPending && !session) {
    return (
      <>
        <div className="w-full h-full bg-transparent flex justify-center items-center overflow-hidden z-[101]">
          <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none">
            <div className="w-full flex flex-col gap-2 justify-center items-center">
              <Logo kind="landscape" variant="no-text" />
              <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
                STANDALONE
              </h1>
            </div>
            <div className="w-full flex flex-col justify-center items-center text-black gap-8 mt-8">
              <div className="text-center text-xl text-[#757575]">
                <p>YOU NEED TO SIGN IN</p>
              </div>
              <SessionLogin hideTitle />
            </div>
          </div>
        </div>
        <SignOverlay />
      </>
    );
  }

  return (
    <>
      <div className="w-full h-full relative">
        <div className="absolute top-0 left-0 right-0 w-full h-[55px] p-5 border-b-[0.5px] border-[#c9c9c9] flex justify-between items-center">
          <div className="w-full h-full flex gap-3 justify-start items-center">
            <Menu />
            <div className="flex justify-start w-auto max-w-[400px] items-center gap-2 whitespace-nowrap font-inter text-lg overflow-hidden text-ellipsis">
              <Badge variant="secondary" className="text-sm font-mono">
                ROOM
              </Badge>
              <div className="font-light max-w-[calc(100%-52px)] truncate">
                {roomInfo?.room?.name ?? ""}
              </div>
            </div>
            {templatesManage && (
              <>
                <Divider className="h-[20px]" />
                <div className="font-light text-xl uppercase">Templates</div>
              </>
            )}
          </div>
          <div className="flex gap-3 justify-end items-center">
            {roomInfo?.room?.status === "archived" && (
              <>
                <div className="flex gap-1 justify-start items-center">
                  {roomInfo?.room?.status === "archived" && (
                    <Badge variant="destructive">archived</Badge>
                  )}
                </div>
              </>
            )}
            <RoomUser />
            {templatesManage && (
              <>
                <Divider className="h-[20px]" />
                <ToolbarButton
                  icon={<X strokeWidth={1} />}
                  onClick={() => {
                    setTemplatesManage(!templatesManage);
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Close</p>
                    </div>
                  }
                  size="small"
                  variant="squared"
                  tooltipSideOffset={14}
                  tooltipSide="bottom"
                  tooltipAlign="end"
                />
              </>
            )}
          </div>
        </div>
        <div className="absolute top-[55px] left-0 right-0 bottom-0 w-full h-[calc(100%-55px)] grid grid-cols-12 border">
          {!templatesManage && (
            <div className="w-full h-full col-span-12">
              <Images />
            </div>
          )}
          {templatesManage && (
            <div className="w-full h-full col-span-12">
              <Templates />
            </div>
          )}
        </div>
      </div>
      <AddToRoomDialog />
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
