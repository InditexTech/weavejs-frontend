// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollaborationRoom } from "@/store/store";
import {
  Avatar as AvatarUI,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useGetSession } from "../room-components/hooks/use-get-session";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth.client";
import { useWeave } from "@inditextech/weave-react";
import { useNavigate } from "@tanstack/react-router";

export function RoomUser() {
  const navigate = useNavigate();

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const { session } = useGetSession();

  return (
    <div className="w-full flex gap-2 justify-between items-center">
      {session && session.user && (
        <>
          <div className="flex gap-1 justify-start items-center">
            {roomInfo?.roomUser?.role === "owner" && (
              <Badge variant="outline">owner</Badge>
            )}
            {roomInfo?.roomUser?.role === "user" && (
              <Badge variant="outline">user</Badge>
            )}
          </div>
          <DropdownMenu
            open={menuOpen}
            onOpenChange={(open: boolean) => {
              setMenuOpen(open);
            }}
          >
            <DropdownMenuTrigger
              className={cn("rounded-none cursor-pointer focus:outline-none", {
                ["font-normal"]: menuOpen,
                ["font-extralight"]: !menuOpen,
              })}
            >
              <div className="text-sm font-light flex gap-1 justify-start items-center">
                <AvatarUI className="w-[40px] h-[40px] bg-muted font-light !text-xs leading-[18px] border-[0.5px] border-[#c9c9c9]">
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt={session.user.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-transparent uppercase">
                    {session.user.name}
                  </AvatarFallback>
                </AvatarUI>
                <div className="flex flex-col gap-0 leading-tight justify-start items-start font-light text-sm whitespace-nowrap">
                  <div className="flex gap-2 justify-start items-center">
                    <div>{session.user.name}</div>
                  </div>
                  <b className="text-xs text-[#757575]">{session.user.email}</b>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              align="start"
              side="bottom"
              alignOffset={-8}
              sideOffset={14}
              className="font-inter rounded-none !shadow-none !drop-shadow"
            >
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none w-full"
                onPointerDown={async () => {
                  sessionStorage.removeItem(`weave.js_${room}`);
                  await instance?.getStore().disconnect();
                  await authClient.signOut();
                  navigate({ to: "/" });
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
