// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn, SYSTEM_OS } from "@/lib/utils";
import { useRouter } from "next/navigation";
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

export function Menu() {
  const os = useGetOs();
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const setUser = useStandaloneUseCase((state) => state.setUser);
  const setInstanceId = useStandaloneUseCase((state) => state.setInstanceId);
  const setManagingImageId = useStandaloneUseCase(
    (state) => state.setManagingImageId
  );

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_standalone_${instanceId}`);
    await instance?.getStore().disconnect();
    setMenuOpen(false);
    setUser(undefined);
    setInstanceId("undefined");
    setManagingImageId(null);
    router.push("/use-cases/standalone");
  }, [
    instance,
    instanceId,
    router,
    setInstanceId,
    setManagingImageId,
    setUser,
  ]);

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
          <div className="flex gap-1 justify-start items-center">
            <div className="h-[40px] 2xl:h-[60px] flex justify-start items-center">
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
          alignOffset={-12}
          sideOffset={9}
          className="font-inter rounded-none"
        >
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
            Close
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
