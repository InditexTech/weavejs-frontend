// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { cn, SYSTEM_OS } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/utils/logo";
import {
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Grid3X3Icon,
  GripIcon,
  Braces,
  MousePointer2,
  Check,
  Grid2X2Check,
  Grid2X2X,
  ShieldCheck,
  ExternalLink,
  LogOut,
  MonitorCog,
  IdCard,
} from "lucide-react";
import {
  WEAVE_GRID_TYPES,
  WeaveExportStageActionParams,
  WeaveStageGridPlugin,
  WeaveStageGridType,
  WeaveUsersPointersPlugin,
} from "@inditextech/weave-sdk";
import { ConnectionStatus } from "../connection-status";
import { bottomElementVariants, topElementVariants } from "./variants";
import { ConnectedUsers } from "../connected-users";
import { Divider } from "./divider";
import { ZoomToolbar } from "./zoom-toolbar";
import { HelpDrawerTrigger } from "../help/help-drawer";
import { DOCUMENTATION_URL, GITHUB_URL } from "@/lib/constants";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { useIACapabilities } from "@/store/ia";
import { LlmSetupDialog } from "./llm-setup";
import { useGetOs } from "../hooks/use-get-os";
import { WeaveStoreAzureWebPubsub } from "@inditextech/weave-store-azure-web-pubsub/client";

export function RoomHeader() {
  const os = useGetOs();
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const selectionActive = useWeave((state) => state.selection.active);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const showUI = useCollaborationRoom((state) => state.ui.show);
  const room = useCollaborationRoom((state) => state.room);

  const iaEnabled = useIACapabilities((state) => state.enabled);
  const setIASetupVisible = useIACapabilities((state) => state.setSetupVisible);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pointersEnabled, setPointersEnabled] = React.useState(true);
  const [gridEnabled, setGridEnabled] = React.useState(true);
  const [gridType, setGridType] = React.useState<WeaveStageGridType>(
    WEAVE_GRID_TYPES.LINES
  );

  const handleToggleUsersPointers = React.useCallback(() => {
    if (!instance) return;

    const userPointersPlugin =
      instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");

    if (userPointersPlugin && userPointersPlugin.isEnabled()) {
      userPointersPlugin.disable();
      setPointersEnabled(false);
      setMenuOpen(false);
      return;
    }
    if (userPointersPlugin && !userPointersPlugin.isEnabled()) {
      userPointersPlugin.enable();
      setPointersEnabled(true);
      setMenuOpen(false);
    }
  }, [instance]);

  const handleToggleGrid = React.useCallback(() => {
    if (instance && instance.isPluginEnabled("stageGrid")) {
      instance.disablePlugin("stageGrid");
      setGridEnabled(instance.isPluginEnabled("stageGrid"));
      setMenuOpen(false);
      return;
    }
    if (instance && !instance.isPluginEnabled("stageGrid")) {
      instance.enablePlugin("stageGrid");
      setGridEnabled(instance.isPluginEnabled("stageGrid"));
      setMenuOpen(false);
    }
  }, [instance]);

  const handleSetGridType = React.useCallback(
    (type: WeaveStageGridType) => {
      if (instance) {
        (instance.getPlugin("stageGrid") as WeaveStageGridPlugin)?.setType(
          type
        );
        setGridType(type);
      }
      setMenuOpen(false);
    },
    [instance]
  );

  const handleExportToImage = React.useCallback(() => {
    if (instance) {
      instance.triggerAction<WeaveExportStageActionParams, void>(
        "exportStageTool",
        {
          options: {
            padding: 20,
            pixelRatio: 2,
          },
        }
      );
    }
    setMenuOpen(false);
  }, [instance]);

  React.useEffect(() => {
    if (instance) {
      setGridEnabled(instance.isPluginEnabled("stageGrid"));
    }
  }, [instance]);

  React.useEffect(() => {
    if (instance) {
      const stageGridPlugin = instance.getPlugin(
        "stageGrid"
      ) as WeaveStageGridPlugin;
      setGridType(stageGridPlugin?.getType());
    }
  }, [instance]);

  const handleExitRoom = React.useCallback(() => {
    sessionStorage.removeItem(`weave.js_${room}`);
    instance?.getStore().disconnect();
    router.push("/");
    setMenuOpen(false);
  }, [instance, room, router]);

  const handlePrintToConsoleState = React.useCallback(() => {
    if (instance) {
      // eslint-disable-next-line no-console
      console.log({
        appState: JSON.parse(JSON.stringify(instance.getStore().getState())),
      });
    }
    setMenuOpen(false);
  }, [instance]);

  if (!showUI) {
    return null;
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={bottomElementVariants}
        className="w-auto z-1 flex 2xl:hidden gap-1 justify-center items-center absolute bottom-[16px] left-[16px] right-[16px] pointer-events-none"
      >
        <div
          className={cn(
            "bg-white flex rounded-full justify-between items-center gap-0 p-[3px] px-[12px] 2xl:py-[5px] 2xl:px-[32px] border-[0.5px] border-[#c9c9c9]",
            {
              ["pointer-events-none"]: selectionActive,
              ["pointer-events-auto"]: !selectionActive,
            }
          )}
        >
          <ZoomToolbar />
        </div>
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={topElementVariants}
        className={cn(
          "w-auto z-1 flex gap-1 justify-center items-center absolute top-[16px] left-[16px]",
          {
            ["pointer-events-none"]: selectionActive,
            ["pointer-events-auto"]: !selectionActive,
          }
        )}
      >
        <div className="bg-white flex justify-between items-center gap-0 p-[3px] px-[12px] 2xl:py-[5px] 2xl:px-[32px] border-[0.5px] border-[#c9c9c9]">
          <div className="flex justify-start items-center gap-3">
            <DropdownMenu
              open={menuOpen}
              onOpenChange={(open: boolean) => {
                setMenuOpen(open);
              }}
            >
              <DropdownMenuTrigger
                className={cn(
                  "rounded-none cursor-pointer focus:outline-none",
                  {
                    ["font-normal"]: menuOpen,
                    ["font-extralight"]: !menuOpen,
                  }
                )}
              >
                <div className="flex gap-1 justify-start items-center">
                  <div className="h-[40px] 2xl:h-[60px] flex justify-start items-center">
                    <Logo kind="only-logo" variant="no-text" />
                  </div>
                  {menuOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
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
                <DropdownMenuItem className="text-foreground cursor-pointer hover:rounded-none w-full">
                  <IdCard />
                  <span className="text-xs font-inter font-light">
                    {(
                      instance?.getStore() as WeaveStoreAzureWebPubsub
                    ).getClientId()}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="block md:hidden px-2 py-1 pt-2 text-zinc-600 text-xs">
                  Room
                </DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={iaEnabled}
                  className="block md:hidden text-foreground cursor-pointer hover:rounded-none"
                >
                  {room}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="block md:hidden " />
                <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                  IA Capabilities
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={iaEnabled}
                    className="text-foreground cursor-pointer hover:rounded-none"
                    onPointerDown={() => {
                      setIASetupVisible(true);
                      setMenuOpen(false);
                    }}
                    onClick={() => {
                      setIASetupVisible(true);
                      setMenuOpen(false);
                    }}
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="w-full flex justify-start items-center gap-2">
                        {iaEnabled && (
                          <>
                            <ShieldCheck size={16} />
                            Enabled
                          </>
                        )}
                        {!iaEnabled && (
                          <>
                            <MonitorCog size={16} />
                            Setup
                          </>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                  Interface
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none"
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onPointerDown={handleToggleUsersPointers}
                    onClick={handleToggleUsersPointers}
                  >
                    <div className="w-full flex justify-between items-center gap-2">
                      <div className="w-full flex justify-start items-center gap-2">
                        <MousePointer2 size={16} />
                        Show users pointers
                      </div>
                      {pointersEnabled && (
                        <Check size={16} className="text-foreground" />
                      )}
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none"
                    disabled={
                      instance?.isEmpty() ??
                      weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onPointerDown={handleExportToImage}
                    onClick={handleExportToImage}
                  >
                    <ImageIcon /> Export as image
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                  Grid
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none"
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onPointerDown={handleToggleGrid}
                    onClick={handleToggleGrid}
                  >
                    <div className="w-full flex justify-between items-center gap-2">
                      <div className="w-full flex justify-start items-center gap-2">
                        {gridEnabled ? (
                          <>
                            <Grid2X2X size={16} />
                            Hide
                          </>
                        ) : (
                          <>
                            <Grid2X2Check size={16} />
                            Show
                          </>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={
                      !gridEnabled ||
                      (gridEnabled && gridType === WEAVE_GRID_TYPES.DOTS) ||
                      weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className="text-foreground cursor-pointer hover:rounded-none"
                    onPointerDown={() => {
                      handleSetGridType(WEAVE_GRID_TYPES.DOTS);
                      setMenuOpen(false);
                    }}
                    onClick={() => {
                      handleSetGridType(WEAVE_GRID_TYPES.DOTS);
                      setMenuOpen(false);
                    }}
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="w-full flex justify-start items-center gap-2">
                        <GripIcon size={16} /> Dots
                      </div>
                      {gridType === WEAVE_GRID_TYPES.DOTS && (
                        <Check size={16} />
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={
                      !gridEnabled ||
                      (gridEnabled && gridType === WEAVE_GRID_TYPES.LINES) ||
                      weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className="text-foreground cursor-pointer hover:rounded-none"
                    onPointerDown={() => {
                      handleSetGridType(WEAVE_GRID_TYPES.LINES);
                      setMenuOpen(false);
                    }}
                    onClick={() => {
                      handleSetGridType(WEAVE_GRID_TYPES.LINES);
                      setMenuOpen(false);
                    }}
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="w-full flex justify-start items-center gap-2">
                        <Grid3X3Icon size={16} /> Lines
                      </div>
                      {gridType === WEAVE_GRID_TYPES.LINES && (
                        <Check size={16} />
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                  Other
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none"
                    onPointerDown={() => {
                      window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
                    }}
                    onClick={() => {
                      window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <ExternalLink /> GitHub
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none"
                    onPointerDown={() => {
                      window.open(
                        DOCUMENTATION_URL,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    onClick={() => {
                      window.open(
                        DOCUMENTATION_URL,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    <ExternalLink /> Documentation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <HelpDrawerTrigger
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  />
                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none w-full"
                    onPointerDown={handlePrintToConsoleState}
                    onClick={handlePrintToConsoleState}
                  >
                    <Braces /> Print state to console
                    <DropdownMenuShortcut>
                      {[SYSTEM_OS.MAC as string].includes(os) && "⌥ ⌘ C"}
                      {[SYSTEM_OS.WINDOWS as string].includes(os) &&
                        "Alt Ctrl C"}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-foreground cursor-pointer hover:rounded-none"
                    onPointerDown={handleExitRoom}
                    onClick={handleExitRoom}
                  >
                    <LogOut /> Exit room
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Divider className="hidden lg:block" />
            <div className="hidden lg:block flex justify-start items-center gap-1">
              <div className="flex justify-start items-center gap-2 font-inter text-foreground !normal-case min-h-[32px]">
                <div className="font-inter text-[24px] font-light">{room}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={topElementVariants}
        className={cn(
          "w-auto z-1 flex gap-1 justify-center items-center absolute top-[16px] right-[16px]",
          {
            ["pointer-events-none"]: selectionActive,
            ["pointer-events-auto"]: !selectionActive,
          }
        )}
      >
        <div className="w-auto h-[48px] 2xl:h-[72px] bg-white flex justify-between items-center gap-0 p-[5px] px-[12px] 2xl:py-[5px] 2xl:px-[32px] border-[0.5px] border-[#c9c9c9]">
          <div className="flex justify-end items-center gap-[16px]">
            <div className="flex justify-end items-center gap-[16px]">
              <ConnectionStatus weaveConnectionStatus={weaveConnectionStatus} />
              <div className="max-w-[320px]">
                <ConnectedUsers />
              </div>
            </div>
            <div className="hidden 2xl:flex justify-end items-center gap-[16px]">
              <Divider />
              <ZoomToolbar />
            </div>
          </div>
        </div>
      </motion.div>
      <LlmSetupDialog />
    </>
  );
}
