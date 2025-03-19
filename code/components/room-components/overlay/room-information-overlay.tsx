"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import {
  Image as ImageIcon,
  FileText,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WeaveExportStageActionParams } from "@inditextech/weavejs-sdk";
import { ConnectionStatus } from "../connection-status";
import { topElementVariants } from "./variants";

export function RoomInformationOverlay() {
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const showUI = useCollaborationRoom((state) => state.ui.show);
  const room = useCollaborationRoom((state) => state.room);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleExportToImage = React.useCallback(() => {
    if (instance) {
      instance.triggerAction<WeaveExportStageActionParams>("exportStageTool", {
        options: {
          padding: 20,
          pixelRatio: 2,
        },
      });
    }
  }, [instance]);

  const handleExportToPdf = React.useCallback(() => {
    if (instance) {
      instance.triggerAction<WeaveExportStageActionParams>("exportStageTool", {
        options: {
          padding: 20,
          pixelRatio: 2,
        },
      });
    }
  }, [instance]);

  const handleExitRoom = React.useCallback(() => {
    router.push("/");
  }, [router]);

  if (!showUI) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={topElementVariants}
      className="pointer-events-none absolute top-2 left-2 flex gap-1 justify-center items-center"
    >
      <div className="bg-white border border-zinc-200 shadow-lg flex justify-start items-center gap-0 pr-1">
        <div className="bg-accent h-[48px] flex justify-start items-center py-0 px-2">
          <Logo kind="small" />
        </div>
        <div className="flex justify-start items-center p-1 gap-1">
          <DropdownMenu onOpenChange={(open: boolean) => setMenuOpen(open)}>
            <DropdownMenuTrigger
              className={cn(
                "pointer-events-auto rounded-none cursor-pointer p-1 px-3 hover:bg-accent focus:outline-none",
                {
                  ["bg-accent"]: menuOpen,
                  ["bg-white"]: !menuOpen,
                }
              )}
            >
              <div className="flex justify-start items-center gap-2 font-noto-sans-mono text-foreground !normal-case min-h-[32px]">
                <div className="font-noto-sans text-lg font-extralight">
                  {room}
                </div>
                {menuOpen ? <ChevronUp /> : <ChevronDown />}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              alignOffset={0}
              sideOffset={4}
              className="font-noto-sans-mono rounded-none"
            >
              <DropdownMenuItem
                className="text-foreground cursor-pointer hover:rounded-none"
                onClick={handleExportToImage}
              >
                <ImageIcon /> Export to image
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
          <ConnectionStatus weaveConnectionStatus={weaveConnectionStatus} />
        </div>
      </div>
    </motion.div>
  );
}
