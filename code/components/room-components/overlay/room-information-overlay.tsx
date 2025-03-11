"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Logo } from "@/components/utils/logo";
import { Image, FileText, Ellipsis, LogOut } from "lucide-react";
import { WeaveExportStageActionParams } from "@inditextech/weavejs-sdk";

export function RoomInformationOverlay() {
  const router = useRouter();

  const instance = useWeave((state) => state.instance);

  const room = useCollaborationRoom((state) => state.room);

  const handleExportToImage = React.useCallback(() => {
    if (instance) {
      instance.triggerAction<WeaveExportStageActionParams>("exportStageTool", {
        options: {
          padding: 20,
          pixelRatio: 2,
        },
      });
    }
  }, [router]);

  const handleExportToPdf = React.useCallback(() => {
    if (instance) {
      instance.triggerAction<WeaveExportStageActionParams>("exportStageTool", {
        options: {
          padding: 20,
          pixelRatio: 2,
        },
      });
    }
  }, [router]);

  const handleExitRoom = React.useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="absolute top-2 left-2 flex gap-1 justify-center items-center">
      <div className="p-2 bg-white border border-zinc-200 shadow-xs flex justify-start items-center gap-2">
        <Logo kind="small" />
        <div className="w-[1px] h-4 mx-2 bg-zinc-200"></div>
        <div className="flex justify-start items-center font-noto-sans-mono text-foreground !normal-case min-h-[32px] pr-2">
          {room}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-none cursor-pointer p-1 hover:bg-zinc-200 focus:outline-none">
            <Ellipsis className="rounded-none" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="font-noto-sans-mono rounded-none"
          >
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none"
              onClick={handleExportToImage}
            >
              <Image /> Export to image
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none"
              onClick={handleExportToPdf}
            >
              <FileText />
              Export to PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-foreground cursor-pointer hover:rounded-none"
              onClick={handleExitRoom}
            >
              <LogOut /> Exit room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
