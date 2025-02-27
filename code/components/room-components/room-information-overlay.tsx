"use client";

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { Logo } from "@/components/utils/logo";

export function RoomInformationOverlay() {
  const room = useCollaborationRoom((state) => state.room);

  return (
    <div className="pointer-events-none absolute top-[20px] left-[20px] flex gap-1 justify-center items-center">
      <div className="pl-3 p-3 bg-light-background-1 rounded-lg border border-light-border-3 shadow-md flex justify-start items-center gap-3">
        <Logo kind="small" />
        <div className="w-[1px] h-[20px] bg-light-content-1"></div>
        <div className="font-mono text-light-content-3 !normal-case">{room}</div>
      </div>
    </div>
  );
}
