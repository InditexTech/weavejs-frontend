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
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { LogOut } from "lucide-react";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const PRESENCE: Record<string, { label: string; dot: string }> = {
  [WEAVE_STORE_CONNECTION_STATUS.CONNECTED]: {
    label: "Connected to the room",
    dot: "bg-emerald-500",
  },
  [WEAVE_STORE_CONNECTION_STATUS.CONNECTING]: {
    label: "Connecting to the room…",
    dot: "bg-amber-400 motion-safe:animate-pulse",
  },
  [WEAVE_STORE_CONNECTION_STATUS.SWITCHING_ROOM]: {
    label: "Switching room…",
    dot: "bg-amber-400 motion-safe:animate-pulse",
  },
  [WEAVE_STORE_CONNECTION_STATUS.ERROR]: {
    label: "Connection problem",
    dot: "bg-red-500",
  },
  [WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED]: {
    label: "Disconnected",
    dot: "bg-[#757575]",
  },
};

export function RoomUser() {
  const navigate = useNavigate();

  const instance = useWeave((state) => state.instance);
  const connectionStatus = useWeave((state) => state.connection.status);
  const presence =
    PRESENCE[connectionStatus] ??
    PRESENCE[WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED];

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
              className={cn(
                "rounded-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#757575] focus-visible:ring-offset-2 max-w-[240px]",
                {
                  ["font-normal"]: menuOpen,
                  ["font-extralight"]: !menuOpen,
                },
              )}
            >
              <div className="text-sm font-light flex gap-2 justify-start items-center min-w-0">
                <div className="relative shrink-0" title={presence.label}>
                  <AvatarUI className="w-[40px] h-[40px] bg-muted font-light !text-xs leading-[18px] border-[0.5px] border-[#c9c9c9]">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-transparent">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </AvatarUI>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 block size-3 rounded-full border-2 border-white transition-colors duration-300",
                      presence.dot,
                    )}
                  />
                  <span className="sr-only">{presence.label}</span>
                </div>
                <div className="flex flex-col gap-0 leading-tight justify-start items-start font-light text-sm whitespace-nowrap min-w-0">
                  <div className="max-w-full truncate">{session.user.name}</div>
                  <b className="max-w-full truncate text-xs text-[#757575]">
                    {session.user.email}
                  </b>
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
                <LogOut strokeWidth={1} /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
