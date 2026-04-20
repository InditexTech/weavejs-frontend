// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn, SYSTEM_OS } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useWeave } from "@inditextech/weave-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/utils/logo";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useGetOs } from "@/components/room-components/hooks/use-get-os";
import { useStandaloneUseCase } from "../../store/store";
import { useCollaborationRoom } from "@/store/store";

export function Menu() {
  const os = useGetOs();
  const navigate = useNavigate();

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const setUser = useStandaloneUseCase((state) => state.setUser);
  const setInstanceId = useStandaloneUseCase((state) => state.setInstanceId);
  const setManagingImageId = useStandaloneUseCase(
    (state) => state.setManagingImageId,
  );

  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const setRoomsRoomId = useCollaborationRoom((state) => state.setRoomsRoomId);
  const setRoomsDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsDeleteVisible,
  );

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_standalone_${instanceId}`);
    await instance?.getStore().disconnect();
    setMenuOpen(false);
    setUser(undefined);
    setInstanceId("undefined");
    setManagingImageId(null);
    navigate({ to: "/use-cases/standalone" });
  }, [
    instance,
    instanceId,
    navigate,
    setInstanceId,
    setManagingImageId,
    setUser,
  ]);

  const handleArchiveRoom = React.useCallback(async () => {
    setMenuOpen(false);
    setRoomsRoomId(room ?? "");
    setRoomsDeleteVisible(true);
  }, [room, setRoomsRoomId, setRoomsDeleteVisible]);

  const handlePrintToConsoleState = React.useCallback(() => {
    if (instance) {
      // eslint-disable-next-line no-console
      console.log({
        appState: JSON.parse(JSON.stringify(instance.getStore().getState())),
      });
    }
    setMenuOpen(false);
  }, [instance]);

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
            className="text-foreground cursor-pointer hover:rounded-none w-full"
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onPointerDown={handlePrintToConsoleState}
          >
            Print state to console
            <DropdownMenuShortcut>
              {[SYSTEM_OS.MAC as string].includes(os) && "⌥ ⌘ C"}
              {[SYSTEM_OS.WINDOWS as string].includes(os) && "Alt Ctrl C"}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
