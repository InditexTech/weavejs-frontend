// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useWeave } from "@inditextech/weave-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/utils/logo";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTemplatesUseCase } from "../../store/store";
import { useCollaborationRoom } from "@/store/store";

export function Menu() {
  const navigate = useNavigate();

  const instance = useWeave((state) => state.instance);

  const instanceId = useTemplatesUseCase((state) => state.instanceId);
  const setUser = useTemplatesUseCase((state) => state.setUser);
  const setInstanceId = useTemplatesUseCase((state) => state.setInstanceId);

  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const setRoomsRoomId = useCollaborationRoom((state) => state.setRoomsRoomId);
  const setRoomsDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsDeleteVisible,
  );

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleArchiveRoom = React.useCallback(async () => {
    setMenuOpen(false);
    setRoomsRoomId(room ?? "");
    setRoomsDeleteVisible(true);
  }, [room, setRoomsRoomId, setRoomsDeleteVisible]);

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_standalone_templates_${instanceId}`);
    await instance?.getStore().disconnect();
    setMenuOpen(false);
    setUser(undefined);
    setInstanceId("undefined");
    navigate({ to: "/use-cases/templates" });
  }, [instance, instanceId, navigate, setInstanceId, setUser]);

  return (
    <>
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
          <div className="flex gap-1 justify-start items-center min-w-[50px]">
            <div className="h-[54px] flex justify-start items-center">
              <Logo kind="only-logo" variant="no-text" />
            </div>
            {menuOpen ? (
              <ChevronUp size={16} strokeWidth={1} />
            ) : (
              <ChevronDown size={16} strokeWidth={1} />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          align="start"
          side="bottom"
          alignOffset={-8}
          sideOffset={8}
          className="font-inter rounded-none !shadow-none !drop-shadow"
        >
          {roomInfo?.roomUser?.role === "owner" &&
            roomInfo?.room.status !== "archived" && (
              <>
                <DropdownMenuItem
                  className="text-foreground cursor-pointer text-[#ff2c2c] hover:rounded-none"
                  onPointerDown={handleArchiveRoom}
                >
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
          <DropdownMenuItem
            className="text-foreground cursor-pointer hover:rounded-none"
            onPointerDown={handleExitRoom}
          >
            Exit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
