// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollaborationRoom } from "@/store/store";
import React from "react";
import { useGetSession } from "../hooks/use-get-session";
import { useNavigate } from "@tanstack/react-router";
import { Divider } from "../overlay/divider";
import useHandleRouteParams from "../hooks/use-handle-route-params";
import { Logo } from "@/components/utils/logo";
import { Ban, LoaderCircle } from "lucide-react";
import { SessionLogin } from "@/components/session/session.login";

export function RoomLoader() {
  const navigate = useNavigate();

  const room = useCollaborationRoom((state) => state.room);
  const roomStatus = useCollaborationRoom((state) => state.status);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const roomInfoLoading = useCollaborationRoom(
    (state) => state.roomInfo.loading,
  );
  const roomInfoLoaded = useCollaborationRoom((state) => state.roomInfo.loaded);
  const roomInfoError = useCollaborationRoom((state) => state.roomInfo.error);

  const { loadedParams } = useHandleRouteParams();

  const { session, isPending } = useGetSession();

  const loadingDescription = React.useMemo(() => {
    if (roomInfoLoading) {
      return "loading room information";
    }
    if (roomStatus === "loading") {
      return "loading room data";
    }
    if (roomStatus === "loaded") {
      return "starting room";
    }
    return "";
  }, [roomStatus, roomInfoLoading]);

  if (isPending) {
    return null;
  }

  return (
    <>
      <div className="w-full h-full bg-transparent flex justify-center items-center overflow-hidden z-[101]">
        <div className="max-w-lg flex flex-col items-center justify-center w-full shadow-none">
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <Logo kind="landscape" variant="no-text" />
            <h1 className="text-4xl font-inter font-light text-muted-foreground uppercase">
              SHOWCASE
            </h1>
          </div>
          <div className="w-full flex flex-col justify-center items-center text-black gap-8 mt-8">
            {session && roomInfo && (
              <div className="w-full flex flex-col gap-2 justify-center items-center">
                <div className="font-light text-center text-lg text-[#757575]">
                  <p>ACCESSING ROOM</p>
                </div>
                <Badge
                  className="ml-2 font-light text-2xl max-w-lg rounded-sm overflow-hidden text-ellipsis whitespace-nowrap"
                  variant="outline"
                >
                  {roomInfo.room.name}
                </Badge>
              </div>
            )}
            {session && !roomInfo && roomInfoError && (
              <div className="w-full flex flex-col gap-2 justify-center items-center">
                <div className="text-center text-base text-[#757575]">
                  <p>ROOM ID</p>
                </div>
                <Badge
                  className="ml-2 font-light text-2xl max-w-lg rounded-sm overflow-hidden text-ellipsis whitespace-nowrap"
                  variant="outline"
                >
                  {room}
                </Badge>
              </div>
            )}
            {!isPending && loadedParams && room && !roomInfo && (
              <>
                {!session && (
                  <div className="text-center text-xl text-[#757575]">
                    <p>YOU NEED TO SIGNED IN</p>
                  </div>
                )}
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
                    <Divider className="h-[0.5px] w-full" />
                    <Button
                      className="cursor-pointer font-inter font-light rounded-none"
                      onClick={async () => {
                        navigate({ to: "/" });
                      }}
                    >
                      BACK TO HOME
                    </Button>
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
                    <Divider className="h-[0.5px] w-full" />
                    <Button
                      className="cursor-pointer font-inter font-light rounded-none"
                      onClick={async () => {
                        navigate({ to: "/" });
                      }}
                    >
                      BACK TO HOME
                    </Button>
                  </>
                )}
                {!session && <SessionLogin hideTitle />}
                {!session && roomInfoLoaded && (
                  <>
                    <Divider className="h-[0.5px] w-full" />
                    <Button
                      className="cursor-pointer font-inter font-light rounded-none"
                      onClick={async () => {
                        navigate({ to: "/" });
                      }}
                    >
                      BACK TO HOME
                    </Button>
                  </>
                )}
              </>
            )}
            {!isPending &&
              loadedParams &&
              room &&
              session &&
              roomInfo !== undefined && (
                <div className="flex flex-col gap-3 justify-center items-center">
                  <LoaderCircle
                    strokeWidth={1}
                    size={48}
                    className="animate-spin"
                  />
                  <div className="w-full flex flex-col font-light text-lg justify-center items-center text-[#757575]">
                    {loadingDescription.toUpperCase()}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
