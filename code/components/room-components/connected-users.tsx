"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { WeaveConnectedUsersChanged } from "@inditextech/weavejs-sdk";

type ConnectionStatusProps = {
  connectedUsers: WeaveConnectedUsersChanged;
};

export const ConnectedUsers = ({ connectedUsers }: Readonly<ConnectionStatusProps>) => {
  if (Object.keys(connectedUsers).length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none flex gap-5 justify-start items-center">
      {Object.keys(connectedUsers).map((user) => {
        const userInfo = connectedUsers[user];
        return (
          <Avatar key={user} className="w-[32px] h-[32px]">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{userInfo.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        );
      })}
    </div>
  );
};
