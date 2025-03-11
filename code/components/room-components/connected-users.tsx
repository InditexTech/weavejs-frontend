"use client";

import React from "react";
import Avatar from "boring-avatars";
import { Avatar as AvatarUI, AvatarFallback } from "@/components/ui/avatar";
import { WeaveConnectedUsersChanged } from "@inditextech/weavejs-sdk";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCollaborationRoom } from "@/store/store";
import { Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ConnectionStatusProps = {
  connectedUsers: WeaveConnectedUsersChanged;
};

export const ConnectedUsers = ({
  connectedUsers,
}: Readonly<ConnectionStatusProps>) => {
  const user = useCollaborationRoom((state) => state.user);

  const connectedUserKey = React.useMemo(() => {
    const filterOwnUser = Object.keys(connectedUsers).filter(
      (actUser) => actUser === user?.name
    );
    return filterOwnUser?.[0];
  }, [user, connectedUsers]);

  const { showUsers, restUsers } = React.useMemo(() => {
    const filterOwnUser = Object.keys(connectedUsers).filter(
      (actUser) => actUser !== user?.name
    );
    return {
      showUsers: filterOwnUser.slice(0, 6),
      restUsers: filterOwnUser.slice(6),
    };
  }, [user, connectedUsers]);

  if (Object.keys(connectedUsers).length === 0) {
    return null;
  }

  return (
    <div className="w-full min-h-[40px] flex gap-1 justify-start items-center">
      <TooltipProvider delayDuration={300}>
        {connectedUserKey && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer">
                <AvatarUI className="w-[32px] h-[32px]">
                  <AvatarFallback>
                    <Avatar name={user?.name} variant="beam" />
                  </AvatarFallback>
                </AvatarUI>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-noto-sans-mono text-sm">{user?.name}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {/* <div className="w-[1px] h-[20px] bg-zinc-200"></div> */}
        {showUsers.map((user) => {
          const userInfo = connectedUsers[user];
          return (
            <Tooltip key={user}>
              <TooltipTrigger asChild>
                <button className="cursor-pointer">
                  <AvatarUI className="w-[32px] h-[32px]">
                    <AvatarFallback>
                      <Avatar name={userInfo?.name} variant="beam" />
                    </AvatarFallback>
                  </AvatarUI>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-noto-sans-mono text-sm">{userInfo.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {restUsers.length > 0 && (
          <>
            <div className="w-[1px] mx-1 h-[20px] bg-zinc-200"></div>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-none cursor-pointer p-2 hover:bg-zinc-200 focus:outline-none">
                    <Users className="rounded-none" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    alignOffset={-6}
                    sideOffset={8}
                    className="font-noto-sans-mono rounded-none"
                  >
                    {restUsers.map((user) => {
                      const userInfo = connectedUsers[user];
                      return (
                        <DropdownMenuItem
                          key={user}
                          className="text-foreground focus:bg-white hover:rounded-none"
                        >
                          <AvatarUI className="w-[32px] h-[32px]">
                            <AvatarFallback>
                              <Avatar name={userInfo?.name} variant="beam" />
                            </AvatarFallback>
                          </AvatarUI>
                          {userInfo?.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="font-noto-sans-mono text-sm">More users</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </TooltipProvider>
    </div>
  );
};
