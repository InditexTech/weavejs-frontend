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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/utils/logo";
import {
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  IdCard,
  Bookmark,
  Contact,
} from "lucide-react";
import {
  WEAVE_GRID_TYPES,
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
import { useExportToImageServerSide } from "../hooks/use-export-to-image-server-side";
import {
  getSessionConfig,
  setSessionConfig,
} from "@/components/utils/session-config";

export function RoomHeader() {
  const os = useGetOs();
  const router = useRouter();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const selectionActive = useWeave((state) => state.selection.active);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const showUI = useCollaborationRoom((state) => state.ui.show);
  const user = useCollaborationRoom((state) => state.user);
  const room = useCollaborationRoom((state) => state.room);
  const setExportNodes = useCollaborationRoom((state) => state.setExportNodes);
  const setExportConfigVisible = useCollaborationRoom(
    (state) => state.setExportConfigVisible
  );

  const connectionTestsShow = useCollaborationRoom(
    (state) => state.connection.tests.show
  );
  const setConnectionTestsShow = useCollaborationRoom(
    (state) => state.setConnectionTestsShow
  );

  const iaEnabled = useIACapabilities((state) => state.enabled);
  const setIASetupVisible = useIACapabilities((state) => state.setSetupVisible);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pointersEnabled, setPointersEnabled] = React.useState(true);
  const [commentsEnabled, setCommentsEnabled] = React.useState(true);
  const [gridEnabled, setGridEnabled] = React.useState(true);
  const [gridType, setGridType] = React.useState<WeaveStageGridType>(
    WEAVE_GRID_TYPES.LINES
  );

  const {
    handlePrintStateSnapshotToClipboard,
    // handleExportToImageServerSide,
    isExporting,
  } = useExportToImageServerSide();

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

  const handleToggleComments = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (instance.isPluginEnabled("commentsRenderer")) {
      instance.disablePlugin("commentsRenderer");
      setCommentsEnabled(false);
      setMenuOpen(false);
      return;
    }
    if (!instance.isPluginEnabled("commentsRenderer")) {
      instance.enablePlugin("commentsRenderer");
      setCommentsEnabled(true);
      setMenuOpen(false);
    }
  }, [instance]);

  const handleToggleGrid = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (!room) {
      return;
    }

    if (instance.isPluginEnabled("stageGrid")) {
      instance.disablePlugin("stageGrid");

      const sessionConfig = getSessionConfig(room);
      sessionConfig.grid.enabled = false;
      setSessionConfig(room, sessionConfig);

      setGridEnabled(false);
      setMenuOpen(false);
      return;
    }
    if (!instance.isPluginEnabled("stageGrid")) {
      instance.enablePlugin("stageGrid");

      const sessionConfig = getSessionConfig(room);
      sessionConfig.grid.enabled = true;
      setSessionConfig(room, sessionConfig);

      setGridEnabled(true);
      setMenuOpen(false);
    }
  }, [instance, room]);

  const handleSetGridType = React.useCallback(
    (type: WeaveStageGridType) => {
      if (instance) {
        (instance.getPlugin("stageGrid") as WeaveStageGridPlugin)?.setType(
          type
        );
        setGridType(type);

        if (!room) {
          return;
        }

        const sessionConfig = getSessionConfig(room);
        sessionConfig.grid.type = type;
        setSessionConfig(room, sessionConfig);
      }
      setMenuOpen(false);
    },
    [instance, room]
  );

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (!room) {
      return;
    }

    if (status !== "running") {
      return;
    }

    const sessionConfig = getSessionConfig(room);

    const stageGridPlugin = instance.getPlugin(
      "stageGrid"
    ) as WeaveStageGridPlugin;

    stageGridPlugin?.setType(sessionConfig.grid.type);
    setGridType(sessionConfig.grid.type);

    if (sessionConfig.grid.enabled) {
      instance.enablePlugin("stageGrid");
    } else {
      instance.disablePlugin("stageGrid");
    }
    setGridEnabled(sessionConfig.grid.enabled);
  }, [instance, status, room]);

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

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_${room}`);
    await instance?.getStore().disconnect();
    setMenuOpen(false);
    router.push("/");
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
      {![
        WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].includes(weaveConnectionStatus as any) && (
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
      )}
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
        <div className="bg-white min-w-[370px] flex justify-between items-center gap-0 p-[3px] px-[12px] 2xl:py-[5px] 2xl:px-[32px] border-[0.5px] border-[#c9c9c9]">
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-none">
                    Details
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-none">
                      <DropdownMenuItem
                        disabled
                        className="text-foreground cursor-pointer hover:rounded-none"
                      >
                        <div className="flex flex gap-2 justify-start items-center">
                          <Bookmark size={16} strokeWidth={1} />
                          <div className="flex flex-col">
                            <div className="text-xs font-inter font-bold">
                              Room
                            </div>
                            <div className="text-sm font-inter font-light">
                              {room}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled
                        className="text-foreground cursor-pointer hover:rounded-none w-full"
                      >
                        <div className="flex flex gap-2 justify-start items-center">
                          <IdCard size={16} strokeWidth={1} />
                          <div className="flex flex-col">
                            <div className="text-xs font-inter font-bold">
                              Client Id
                            </div>
                            <div className="text-sm font-inter font-light">
                              {(
                                instance?.getStore() as WeaveStoreAzureWebPubsub
                              )?.getClientId()}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled
                        className="text-foreground cursor-pointer hover:rounded-none w-full"
                      >
                        <div className="flex flex gap-2 justify-start items-center">
                          <Contact size={16} strokeWidth={1} />
                          <div className="flex flex-col">
                            <div className="text-xs font-inter font-bold">
                              User Id
                            </div>
                            <div className="text-sm font-inter font-light">
                              {user?.id ?? "anonymous"}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-none">
                    Tools
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-none">
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={
                          weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED &&
                          !instance?.isEmpty() &&
                          !isExporting()
                        }
                        onPointerDown={async () => {
                          setExportNodes([]);
                          setExportConfigVisible(true);
                          setMenuOpen(false);
                        }}
                      >
                        <div className="w-[16px] h-[16px]" /> Export room as
                        image
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={
                          instance?.isEmpty() ??
                          weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onPointerDown={handleExportToImage}
                      >
                        <ImageDown size={16} strokeWidth={1} /> Export room as
                        image (on the client)
                      </DropdownMenuItem> */}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-none">
                    View
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-none">
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer rounded-none hover:rounded-none"
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onPointerDown={handleToggleUsersPointers}
                      >
                        {pointersEnabled ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Users pointers
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onPointerDown={handleToggleComments}
                      >
                        {commentsEnabled ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Comments
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onPointerDown={handleToggleGrid}
                      >
                        {gridEnabled ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Reference grid
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                        Grid type
                      </DropdownMenuLabel>
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
                      >
                        {gridType === WEAVE_GRID_TYPES.DOTS ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Dots
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={
                          !gridEnabled ||
                          (gridEnabled &&
                            gridType === WEAVE_GRID_TYPES.LINES) ||
                          weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          handleSetGridType(WEAVE_GRID_TYPES.LINES);
                          setMenuOpen(false);
                        }}
                      >
                        {gridType === WEAVE_GRID_TYPES.LINES ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Lines
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-none">
                    Help
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-none">
                      <HelpDrawerTrigger
                        onClick={() => {
                          setMenuOpen(false);
                        }}
                      />
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          window.open(
                            GITHUB_URL,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        <ExternalLink size={16} strokeWidth={1} /> GitHub
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
                      >
                        <ExternalLink size={16} strokeWidth={1} /> Documentation
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-none">
                    Extra
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-none">
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          setConnectionTestsShow(!connectionTestsShow);
                          setMenuOpen(false);
                        }}
                      >
                        {connectionTestsShow ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Connection testing
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={
                          weaveConnectionStatus ===
                            WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED ||
                          (weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED &&
                            iaEnabled)
                        }
                        onPointerDown={() => {
                          setIASetupVisible(true);
                          setMenuOpen(false);
                        }}
                      >
                        {iaEnabled ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        IA Capabilities
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none w-full"
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onPointerDown={handlePrintToConsoleState}
                      >
                        <div className="w-[16px] h-[16px]" /> Print state to
                        console
                        <DropdownMenuShortcut>
                          {[SYSTEM_OS.MAC as string].includes(os) && "⌥ ⌘ C"}
                          {[SYSTEM_OS.WINDOWS as string].includes(os) &&
                            "Alt Ctrl C"}
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none w-full"
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onPointerDown={() => {
                          handlePrintStateSnapshotToClipboard();
                          setMenuOpen(false);
                        }}
                      >
                        <div className="w-[16px] h-[16px]" /> Set state snapshot
                        to clipboard
                        <DropdownMenuShortcut>
                          {[SYSTEM_OS.MAC as string].includes(os) && "⌘ S"}
                          {[SYSTEM_OS.WINDOWS as string].includes(os) &&
                            "Ctrl S"}
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none"
                  onPointerDown={handleExitRoom}
                >
                  Close
                </DropdownMenuItem>
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
      {![
        WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ].includes(weaveConnectionStatus as any) && (
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
                <ConnectionStatus
                  weaveConnectionStatus={weaveConnectionStatus}
                />
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
      )}
      <LlmSetupDialog />
    </>
  );
}
