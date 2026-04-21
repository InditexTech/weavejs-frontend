// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";
import useHandleRouteParams from "../../hooks/use-handle-route-params";
import { useStandaloneUseCase } from "../../store/store";
import { Comments } from "../comment/comments";
import { ImageCanvas } from "../image-canvas/image-canvas";
import { Images } from "../images/images";
import { Ban, LoaderCircle, XIcon } from "lucide-react";
import { Menu } from "./menu";
import { Measures } from "../measure/measures";
import { Footer } from "./footer";
import { useGetSession } from "@/components/room-components/hooks/use-get-session";
import { RoomUser } from "@/components/room/room.user";
import { Button } from "@/components/ui/button";
import { SessionLogin } from "@/components/session/session.login";
import { Logo } from "@/components/utils/logo";
import { useCollaborationRoom } from "@/store/store";
import { useLoadRoom } from "@/components/room-components/hooks/use-load-room";
import { Divider } from "@/components/room-components/overlay/divider";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ImageToolbar } from "../toolbars/image.toolbar";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { SignOverlay } from "@/components/sign-overlay/sign-overlay";

export const StandalonePage = () => {
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

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const imageUploading = useStandaloneUseCase(
    (state) => state.images.uploading,
  );
  const sidebarVisible = useStandaloneUseCase((state) => state.sidebar.visible);
  const showComments = useStandaloneUseCase((state) => state.comments.show);
  const setUser = useStandaloneUseCase((state) => state.setUser);
  const setManagingImageId = useStandaloneUseCase(
    (state) => state.setManagingImageId,
  );
  const setCommentsShow = useStandaloneUseCase(
    (state) => state.setCommentsShow,
  );

  React.useEffect(() => {
    if (roomInfo) {
      document.title = `${roomInfo.room.name} | Standalone | Weave.js`;
    } else {
      document.title = `Room | Standalone | Weave.js`;
    }
  }, [roomInfo]);

  React.useEffect(() => {
    setManagingImageId(null);
  }, [instanceId, setManagingImageId]);

  React.useEffect(() => {
    if (instanceId !== "undefined" && !session) {
      const userStorage = sessionStorage.getItem(
        `weave.js_standalone_${instanceId}`,
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
              STANDALONE
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
        <div className="absolute top-0 left-0 right-0 w-full h-[55px] p-5 py-0 border-b-[0.5px] border-[#c9c9c9] flex justify-between items-center">
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
            {managingImageId && (
              <>
                <Divider className="h-[20px]" />
                <ImageToolbar />
              </>
            )}
          </div>
          <div className="flex justify-end items-center gap-3">
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
            {managingImageId && (
              <>
                <Divider className="h-[20px]" />
                <ToolbarButton
                  icon={<XIcon size={20} strokeWidth={1} />}
                  onClick={() => {
                    setManagingImageId(null);
                    setCommentsShow(false);
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Close</p>
                    </div>
                  }
                  variant="squared"
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
              </>
            )}
          </div>
        </div>
        {!managingImageId && (
          <div className="absolute top-[55px] left-0 right-0 bottom-0">
            <Images />
          </div>
        )}
        {managingImageId && (
          <div
            className={cn(
              "absolute top-[55px] bottom-[40px] flex justify-center items-center relative",
              {
                ["h-[calc(100%-55px-40px)]"]: managingImageId,
                ["col-span-8"]: showComments,
              },
            )}
          >
            <ImageCanvas key={managingImageId} />
          </div>
        )}
        {managingImageId && (
          <>
            <div
              className={cn(
                "absolute top-[calc(55px+8px)] right-[8px] bottom-[48px] w-[400px] h-[calc(100%-65px-8px-48px)] bg-white drop-shadow",
                {
                  ["pointer-events-none invisible"]: !sidebarVisible,
                  ["pointer-events-auto visible"]: sidebarVisible,
                },
              )}
            >
              <Comments />
              <Measures />
            </div>
            <Footer />
          </>
        )}
      </div>
      {imageUploading && (
        <div className="absolute top-[55px] left-0 right-0 bottom-0 w-full h-[calc(100%-65px)] bg-white flex flex-col justify-center items-center">
          <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none gap-8">
            <div className="flex flex-col gap-3 justify-center items-center">
              <LoaderCircle
                strokeWidth={1}
                size={48}
                className="animate-spin"
              />
              <div className="w-full flex flex-col font-light text-lg justify-center items-center text-[#757575]">
                UPLOADING IMAGE
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
