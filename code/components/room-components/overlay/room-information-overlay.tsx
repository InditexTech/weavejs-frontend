"use client";

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { Logo } from "@/components/utils/logo";

export function RoomInformationOverlay() {
  const room = useCollaborationRoom((state) => state.room);

  return (
    <div className="absolute top-2 left-2 flex gap-1 justify-center items-center">
      <div className="p-2 bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-2">
        <Logo kind="small" />
        <div className="w-[1px] h-4 bg-zinc-200"></div>
        <div className="flex justify-start items-center font-noto-sans-mono text-foreground !normal-case min-h-[32px]">{room}</div>
      </div>
    </div>
  );
}
