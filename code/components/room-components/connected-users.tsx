// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  Avatar as AvatarUI,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWeave } from "@inditextech/weave-react";
import { getUserShort, stringToColor } from "../utils/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveUserMutexLock,
} from "@inditextech/weave-types";
import { OPERATIONS_MAP } from "../utils/weave/constants";
import { Divider } from "./overlay/divider";
import { useGetSession } from "./hooks/use-get-session";
import { useCollaborationRoom } from "@/store/store";

const SHOW_USERS_LIMIT = 6;

export const ConnectedUsers = () => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const isRoomSwitching = useWeave((state) => state.room.switching);
  const connectedUsers = useWeave((state) => state.users);
  const usersLocks = useWeave((state) => state.usersLocks);

  const clientId = useCollaborationRoom((state) => state.clientId);

  const { session } = useGetSession();
  const userId = React.useMemo(() => {
    if (!session?.user) {
      return `unknown-${clientId}`;
    }

    return `${session.user.id}-${clientId}`;
  }, [clientId, session]);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const connectedUserKey = React.useMemo(() => {
    const filterOwnUser = Object.keys(connectedUsers).filter((actUserKey) => {
      const actUser = connectedUsers[actUserKey];
      return actUser.id === userId;
    });
    return filterOwnUser?.[0];
  }, [userId, connectedUsers]);

  const { showUsers, restUsers } = React.useMemo(() => {
    const filterOwnUser = Object.keys(connectedUsers).filter((actUserKey) => {
      const actUser = connectedUsers[actUserKey];
      return actUser.id !== userId;
    });
    return {
      showUsers: filterOwnUser.slice(0, SHOW_USERS_LIMIT - 1),
      restUsers: filterOwnUser.slice(SHOW_USERS_LIMIT - 1),
    };
  }, [userId, connectedUsers]);

  if (
    isRoomSwitching ||
    weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
  ) {
    return null;
  }

  if (Object.keys(connectedUsers).length === 0) {
    return null;
  }

  return (
    <>
      <Divider className="h-[20px]" />
      <div className="min-h-[24px] flex gap-1 justify-between items-center">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div
              className="relative w-full h-[24px] flex gap-1 justify-start items-center"
              role="button"
            >
              <AvatarGroup>
                {connectedUserKey && (
                  <AvatarUI
                    size="sm"
                    className="cursor-pointer bg-muted font-light !text-xs border-[0.5px] border-[#c9c9c9]"
                  >
                    <AvatarImage
                      src={connectedUsers[userId].image}
                      alt={connectedUsers[userId].name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-transparent uppercase">
                      {getUserShort(session?.user?.name ?? "")}
                    </AvatarFallback>
                  </AvatarUI>
                )}
                {showUsers.map((user) => {
                  const userInfo = connectedUsers[user];
                  return (
                    <AvatarUI
                      key={`${userInfo.clientId ?? ""}.${userInfo.email ?? ""}`}
                      size="sm"
                      className="cursor-pointer bg-muted font-light !text-xs border-[0.5px] border-[#c9c9c9]"
                    >
                      <AvatarImage
                        src={userInfo.image}
                        alt={userInfo.name}
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="bg-transparent uppercase">
                        {getUserShort(userInfo?.name ?? "")}
                      </AvatarFallback>
                    </AvatarUI>
                  );
                })}
              </AvatarGroup>
              {restUsers.length > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer ml-1 text-xs"
                >
                  and {restUsers.length} more
                </Badge>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            sideOffset={12}
            className="rounded-none p-0 shadow-none drop-shadow"
          >
            {/* <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 font-inter text-xs">
            Connected users
          </DropdownMenuLabel>
          <DropdownMenuSeparator /> */}
            <DropdownMenuGroup>
              {Object.keys(connectedUsers).map((userKey) => {
                const userInfo = connectedUsers[userKey];
                return (
                  <React.Fragment key={userKey}>
                    <DropdownMenuItem className="text-foreground cursor-default hover:!bg-white hover:rounded-none w-full text-xs">
                      <div
                        className="w-[16px] h-[16px]"
                        style={{
                          background: stringToColor(userInfo?.name ?? ""),
                        }}
                      ></div>
                      <AvatarUI
                        size="sm"
                        className="bg-muted font-light !text-[11] border-[0.5px] border-[#c9c9c9]"
                      >
                        <AvatarImage
                          src={userInfo?.image}
                          alt={userInfo?.name}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-transparent uppercase">
                          {getUserShort(userInfo?.name ?? "")}
                        </AvatarFallback>
                      </AvatarUI>
                      <div className="flex flex-col gap-0 leading-tight">
                        <div className="w-full text-sm">{userInfo?.name}</div>
                        <div className="w-full font-mono text-xs text-[#757575]">
                          {userInfo?.email}
                        </div>
                        {/* <div className="w-full font-mono mt-1 text-xs text-[#999999] whitespace-nowrap">
                          {typeof usersLocks[userInfo.id] !== "undefined"
                            ? OPERATIONS_MAP[
                                (
                                  usersLocks[
                                    userInfo.id
                                  ] as WeaveUserMutexLock<unknown>
                                ).operation
                              ]
                            : "idle"}
                        </div> */}
                      </div>
                      <Divider className="h-[32px]" />
                      <Badge className="mt-2">
                        {typeof usersLocks[userInfo.id] !== "undefined"
                          ? OPERATIONS_MAP[
                              (
                                usersLocks[
                                  userInfo.id
                                ] as WeaveUserMutexLock<unknown>
                              ).operation
                            ]
                          : "idle"}
                      </Badge>
                    </DropdownMenuItem>
                  </React.Fragment>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
