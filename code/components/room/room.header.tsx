// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn, SYSTEM_OS } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useWeave } from "@inditextech/weave-react";
import { Badge } from "@/components/ui/badge";
import {
  BACKGROUND_COLOR,
  BackgroundColor,
  useCollaborationRoom,
} from "@/store/store";
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
  SquarePen,
} from "lucide-react";
import {
  WEAVE_GRID_TYPES,
  WEAVE_GRID_DOT_TYPES,
  WeaveStageGridPlugin,
  WeaveStageGridType,
  WeaveStageGridDotType,
  WeaveUsersPointersPlugin,
} from "@inditextech/weave-sdk";
import { DOCUMENTATION_URL, GITHUB_URL } from "@/lib/constants";
import {
  getSessionConfig,
  setSessionConfig,
} from "@/components/utils/session-config";
import { useIAChat } from "@/store/ia-chat";
import { useGetOs } from "../room-components/hooks/use-get-os";
import { useExportPageToImageServerSide } from "../room-components/hooks/use-export-page-to-image-server-side";
import { HelpDrawerTrigger } from "../room-components/help/help-drawer";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "../plugins/export-area-reference/constants";
import { Divider } from "../room-components/overlay/divider";
import { RightSidebarToolbar } from "../room-components/toolbars/right-sidebar.toolbar";
import { LeftSidebarToolbar } from "../room-components/toolbars/left-sidebar.toolbar";
import { ToolbarButton } from "../room-components/toolbar/toolbar-button";
import { RoomUser } from "./room.user";
import { useLoadRoomUserConfig } from "../room-components/hooks/use-load-room-user-config";
import { useIsRoomReady } from "../room-components/hooks/use-is-room-ready";

export function RoomHeader() {
  const os = useGetOs();
  const navigate = useNavigate();

  const instance = useWeave((state) => state.instance);
  const selectionActive = useWeave((state) => state.selection.active);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const room = useCollaborationRoom((state) => state.room);
  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const actualPageElement = useCollaborationRoom(
    (state) => state.pages.actualPageElement,
  );
  const gridEnabled = useCollaborationRoom((state) => state.grid.enabled);
  const gridType = useCollaborationRoom((state) => state.grid.type);
  const gridDotsKind = useCollaborationRoom((state) => state.grid.dots.kind);
  const backgroundColor = useCollaborationRoom(
    (state) => state.backgroundColor,
  );
  const pagesListVisible = useCollaborationRoom(
    (state) => state.pages.listVisible,
  );
  const setPagesListVisible = useCollaborationRoom(
    (state) => state.setPagesListVisible,
  );
  const setPagesGridVisible = useCollaborationRoom(
    (state) => state.setPagesGridVisible,
  );
  const setGridEnabled = useCollaborationRoom((state) => state.setGridEnabled);
  const setGridType = useCollaborationRoom((state) => state.setGridType);
  const setGridDotsKind = useCollaborationRoom(
    (state) => state.setGridDotsKind,
  );
  const setBackgroundColor = useCollaborationRoom(
    (state) => state.setBackgroundColor,
  );

  const connectionTestsShow = useCollaborationRoom(
    (state) => state.connection.tests.show,
  );
  const setConnectionTestsShow = useCollaborationRoom(
    (state) => state.setConnectionTestsShow,
  );
  const setRoomsRoomId = useCollaborationRoom((state) => state.setRoomsRoomId);
  const setRoomsPageId = useCollaborationRoom((state) => state.setRoomsPageId);
  const setRoomsPageEditVisible = useCollaborationRoom(
    (state) => state.setRoomsPageEditVisible,
  );

  const setRoomsEditVisible = useCollaborationRoom(
    (state) => state.setRoomsEditVisible,
  );
  const setRoomsDeleteVisible = useCollaborationRoom(
    (state) => state.setRoomsDeleteVisible,
  );

  const viewType = useCollaborationRoom((state) => state.viewType);
  const showLeftSidebarFloating = useCollaborationRoom(
    (state) => state.showLeftSidebarFloating,
  );

  const usersPointersVisible = useCollaborationRoom(
    (state) => state.ui.usersPointers.visible,
  );
  const commentsVisible = useCollaborationRoom(
    (state) => state.ui.comments.visible,
  );
  const referenceAreaVisible = useCollaborationRoom(
    (state) => state.ui.referenceArea.visible,
  );
  const setUIUsersPointersVisible = useCollaborationRoom(
    (state) => state.setUIUsersPointersVisible,
  );
  const setUICommentsVisible = useCollaborationRoom(
    (state) => state.setUICommentsVisible,
  );
  const setUIReferenceAreaVisible = useCollaborationRoom(
    (state) => state.setUIReferenceAreaVisible,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);
  const setAiChatSetupVisible = useIAChat((state) => state.setSetupVisible);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const { handlePrintStateSnapshotToClipboard } =
    useExportPageToImageServerSide();

  const handleToggleUsersPointers = React.useCallback(() => {
    if (!instance) return;

    if (!roomInfo) {
      return;
    }

    const room = roomInfo.room.roomId;

    const sessionConfig = getSessionConfig(room);
    sessionConfig.ui.usersPointers.visible = !usersPointersVisible;
    setSessionConfig(room, sessionConfig);

    const userPointersPlugin =
      instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");

    if (userPointersPlugin && userPointersPlugin.isEnabled()) {
      userPointersPlugin.disable();
      setUIUsersPointersVisible(false);
      return;
    }
    if (userPointersPlugin && !userPointersPlugin.isEnabled()) {
      userPointersPlugin.enable();
      setUIUsersPointersVisible(true);
    }
  }, [instance, roomInfo, usersPointersVisible, setUIUsersPointersVisible]);

  const handleToggleComments = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (!roomInfo) {
      return;
    }

    const room = roomInfo.room.roomId;

    const sessionConfig = getSessionConfig(room);
    sessionConfig.ui.comments.visible = !commentsVisible;
    setSessionConfig(room, sessionConfig);

    if (instance.isPluginEnabled("commentsRenderer")) {
      instance.disablePlugin("commentsRenderer");
      setUICommentsVisible(false);
      return;
    }
    if (!instance.isPluginEnabled("commentsRenderer")) {
      instance.enablePlugin("commentsRenderer");
      setUICommentsVisible(true);
    }
  }, [instance, roomInfo, commentsVisible, setUICommentsVisible]);

  const handleTogglePageAreaReference = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (!roomInfo) {
      return;
    }

    const room = roomInfo.room.roomId;

    const sessionConfig = getSessionConfig(room);
    sessionConfig.ui.referenceArea.visible = !referenceAreaVisible;
    setSessionConfig(room, sessionConfig);

    if (instance.isPluginEnabled(EXPORT_AREA_REFERENCE_PLUGIN_KEY)) {
      instance.disablePlugin(EXPORT_AREA_REFERENCE_PLUGIN_KEY);
      setUIReferenceAreaVisible(false);
      return;
    }
    if (!instance.isPluginEnabled(EXPORT_AREA_REFERENCE_PLUGIN_KEY)) {
      instance.enablePlugin(EXPORT_AREA_REFERENCE_PLUGIN_KEY);
      setUIReferenceAreaVisible(true);
    }
  }, [instance, roomInfo, referenceAreaVisible, setUIReferenceAreaVisible]);

  const handleToggleGrid = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (!roomInfo) {
      return;
    }

    const room = roomInfo.room.roomId;

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
  }, [instance, roomInfo, setGridEnabled]);

  const handleSetBackgroundColor = React.useCallback(
    (color: BackgroundColor) => {
      if (!instance) {
        return;
      }

      setBackgroundColor(color);

      if (!roomInfo) {
        return;
      }

      const room = roomInfo.room.roomId;

      const sessionConfig = getSessionConfig(room);
      sessionConfig.backgroundColor = color;
      setSessionConfig(room, sessionConfig);
    },
    [instance, roomInfo, setBackgroundColor],
  );

  const handleSetGridType = React.useCallback(
    (type: WeaveStageGridType) => {
      if (instance) {
        (instance.getPlugin("stageGrid") as WeaveStageGridPlugin)?.setType(
          type,
        );
        setGridType(type);

        if (!roomInfo) {
          return;
        }

        const room = roomInfo.room.roomId;

        const sessionConfig = getSessionConfig(room);
        sessionConfig.grid.type = type;
        setSessionConfig(room, sessionConfig);
      }
      setMenuOpen(false);
    },
    [instance, roomInfo, setGridType],
  );

  const handleSetGridDotsKind = React.useCallback(
    (dotsKind: WeaveStageGridDotType) => {
      if (instance) {
        (instance.getPlugin("stageGrid") as WeaveStageGridPlugin)?.setDotsType(
          dotsKind,
        );
        setGridDotsKind(dotsKind);

        if (!roomInfo) {
          return;
        }

        const room = roomInfo.room.roomId;

        const sessionConfig = getSessionConfig(room);
        sessionConfig.grid.dotsKind = dotsKind;
        setSessionConfig(room, sessionConfig);
      }
      setMenuOpen(false);
    },
    [instance, roomInfo, setGridDotsKind],
  );

  useLoadRoomUserConfig();

  const isRoomReady = useIsRoomReady();

  React.useEffect(() => {
    if (instance) {
      setGridEnabled(instance.isPluginEnabled("stageGrid"));
    }
  }, [instance, setGridEnabled]);

  React.useEffect(() => {
    if (instance) {
      const stageGridPlugin = instance.getPlugin(
        "stageGrid",
      ) as WeaveStageGridPlugin;
      setGridType(stageGridPlugin?.getType());
    }
  }, [instance, setGridType]);

  const handleEditRoom = React.useCallback(async () => {
    setMenuOpen(false);
    setRoomsRoomId(room ?? "");
    setRoomsEditVisible(true);
  }, [room, setRoomsRoomId, setRoomsEditVisible]);

  const handleArchiveRoom = React.useCallback(async () => {
    setMenuOpen(false);
    setRoomsRoomId(room ?? "");
    setRoomsDeleteVisible(true);
  }, [room, setRoomsRoomId, setRoomsDeleteVisible]);

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_${room}`);
    await instance?.getStore().disconnect();
    setMenuOpen(false);
    navigate({ to: "/" });
  }, [instance, room, navigate]);

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
      <div
        className={cn("w-auto z-2 flex gap-1 justify-start items-center", {
          ["pointer-events-none"]: selectionActive,
          ["pointer-events-auto"]: !selectionActive,
          ["absolute top-0 left-0 right-0 bg-white border-b-[0.5px] border-[#c9c9c9]"]:
            viewType === "floating",
          ["h-[57px]"]: viewType === "fixed",
        })}
      >
        <div
          className={cn(
            "w-full bg-white flex justify-between items-center gap-0 py-0",
            {
              ["px-[16px]"]: viewType === "floating",
              ["px-[24px]"]: viewType === "fixed",
            },
          )}
        >
          <div className="w-full flex justify-start items-center gap-3">
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
                  },
                )}
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
                <DropdownMenuSub>
                  {roomInfo?.roomUser?.role === "owner" && (
                    <DropdownMenuItem
                      disabled={!isRoomReady}
                      className="text-foreground cursor-pointer hover:rounded-none"
                      onPointerDown={handleEditRoom}
                    >
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSubTrigger className="rounded-none">
                    View
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="rounded-none">
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer rounded-none hover:rounded-none"
                        disabled={!isRoomReady}
                        onPointerDown={handleToggleUsersPointers}
                      >
                        {usersPointersVisible ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Users pointers
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={!isRoomReady}
                        onPointerDown={handleToggleComments}
                      >
                        {commentsVisible ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Comments
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={!isRoomReady}
                        onPointerDown={handleTogglePageAreaReference}
                      >
                        {referenceAreaVisible ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Page area reference
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                        Reference grid
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none"
                        disabled={!isRoomReady}
                        onPointerDown={handleToggleGrid}
                      >
                        {gridEnabled ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Enabled
                      </DropdownMenuItem>
                      <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                        Type
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={
                          !gridEnabled ||
                          (gridEnabled && gridType === WEAVE_GRID_TYPES.DOTS) ||
                          !isRoomReady
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
                          !isRoomReady
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
                      <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                        Dots Kind
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={
                          !gridEnabled ||
                          (gridEnabled &&
                            gridType === WEAVE_GRID_TYPES.LINES) ||
                          !isRoomReady
                        }
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          handleSetGridDotsKind(WEAVE_GRID_DOT_TYPES.CIRCLE);
                          setMenuOpen(false);
                        }}
                      >
                        {gridDotsKind === WEAVE_GRID_DOT_TYPES.CIRCLE ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Circle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={
                          !gridEnabled ||
                          (gridEnabled &&
                            gridType === WEAVE_GRID_TYPES.LINES) ||
                          !isRoomReady
                        }
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          handleSetGridDotsKind(WEAVE_GRID_DOT_TYPES.SQUARE);
                          setMenuOpen(false);
                        }}
                      >
                        {gridDotsKind === WEAVE_GRID_DOT_TYPES.SQUARE ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        Square
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 text-xs">
                        Background color
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        disabled={
                          backgroundColor === BACKGROUND_COLOR.WHITE ||
                          !isRoomReady
                        }
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          handleSetBackgroundColor(BACKGROUND_COLOR.WHITE);
                          setMenuOpen(false);
                        }}
                      >
                        {backgroundColor === BACKGROUND_COLOR.WHITE ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[18px] h-[18px]" />
                        )}
                        <div className="w-full flex gap-2 justify-between items-center">
                          White
                          <div
                            style={{ background: BACKGROUND_COLOR.WHITE }}
                            className={`w-[16px] h-[16px] border border-[#c9c9c9]`}
                          />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={
                          backgroundColor === BACKGROUND_COLOR.GRAY ||
                          !isRoomReady
                        }
                        className="text-foreground cursor-pointer hover:rounded-none"
                        onPointerDown={() => {
                          handleSetBackgroundColor(BACKGROUND_COLOR.GRAY);
                          setMenuOpen(false);
                        }}
                      >
                        {backgroundColor === BACKGROUND_COLOR.GRAY ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[18px] h-[18px]" />
                        )}
                        <div className="w-full flex gap-2 justify-between items-center">
                          Gray
                          <div
                            style={{ background: BACKGROUND_COLOR.GRAY }}
                            className={`w-[16px] h-[16px] border border-[#c9c9c9]`}
                          />
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                {/* <DropdownMenuItem
                  className="text-foreground cursor-pointer hover:rounded-none"
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onPointerDown={() => {
                    setConfigurationOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Configuration
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                {roomInfo?.roomUser?.role === "owner" &&
                  roomInfo?.room.status !== "archived" && (
                    <>
                      <DropdownMenuItem
                        disabled={!isRoomReady}
                        className="text-foreground cursor-pointer text-[#ff2c2c] hover:rounded-none"
                        onPointerDown={handleArchiveRoom}
                      >
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
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
                            "noopener,noreferrer",
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
                            "noopener,noreferrer",
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
                          !isRoomReady || (isRoomReady && aiChatEnabled)
                        }
                        onPointerDown={() => {
                          setAiChatSetupVisible(true);
                          setMenuOpen(false);
                        }}
                      >
                        {aiChatEnabled ? (
                          <Check size={16} strokeWidth={1} />
                        ) : (
                          <div className="w-[16px] h-[16px]" />
                        )}
                        IA Capabilities
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-foreground cursor-pointer hover:rounded-none w-full"
                        disabled={!isRoomReady}
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
                        disabled={!isRoomReady}
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
                  Exit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <Divider className="h-[20px]" /> */}
            {/* <Badge variant="outline" className="cursor-pointer ml-1 text-base">
              {room}
            </Badge> */}
            {viewType === "floating" && (
              <>
                <div className="flex justify-start w-auto max-w-[400px] items-center gap-2 whitespace-nowrap font-inter text-lg overflow-hidden text-ellipsis">
                  <Badge variant="secondary" className="text-sm font-mono">
                    ROOM
                  </Badge>
                  <div className="font-light max-w-[calc(100%-52px)] truncate">
                    {roomInfo?.room?.name || room}
                  </div>
                </div>
                <ToolbarButton
                  icon={<SquarePen strokeWidth={1} />}
                  onClick={() => {
                    setRoomsRoomId(actualPageElement.roomId ?? "");
                    setRoomsPageId(actualPageElement.pageId ?? "");
                    setRoomsEditVisible(true);
                  }}
                  disabled={isRoomSwitching || !isRoomReady}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Edit room</p>
                    </div>
                  }
                  size="small"
                  variant="squared"
                  tooltipSideOffset={14}
                  tooltipSide="top"
                  tooltipAlign="center"
                />
                {actualPageElement && (
                  <>
                    <Divider className="h-[20px]" />
                    <div
                      role="button"
                      className={cn(
                        "cursor-pointer w-auto max-w-[400px] flex justify-start whitespace-nowrap items-center gap-2 text-lg focus:outline-none",
                        {
                          ["hover:text-muted-foreground"]: !(
                            isRoomSwitching || !isRoomReady
                          ),
                          ["pointer-events-none cursor-default text-black opacity-50"]:
                            isRoomSwitching || !isRoomReady,
                        },
                      )}
                      onClick={() => {
                        setPagesGridVisible(false);
                        setPagesListVisible(!pagesListVisible);
                      }}
                    >
                      <Badge variant="secondary" className="text-sm font-mono">
                        PAGE
                      </Badge>
                      <div className="font-light max-w-[calc(100%-52px)] truncate">
                        {actualPageElement.name}
                      </div>
                    </div>
                    <ToolbarButton
                      icon={<SquarePen strokeWidth={1} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomsRoomId(actualPageElement.roomId ?? "");
                        setRoomsPageId(actualPageElement.pageId ?? "");
                        setRoomsPageEditVisible(true);
                      }}
                      disabled={isRoomSwitching || !isRoomReady}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Edit page</p>
                        </div>
                      }
                      size="small"
                      variant="squared"
                      tooltipSideOffset={14}
                      tooltipSide="top"
                      tooltipAlign="center"
                    />
                  </>
                )}
              </>
            )}
            {viewType === "floating" &&
              !showLeftSidebarFloating &&
              isRoomReady &&
              !isRoomSwitching && (
                <>
                  <LeftSidebarToolbar />
                </>
              )}
          </div>
          {viewType === "floating" && (
            <div className="w-full flex justify-end items-center gap-3">
              <div>
                <RoomUser />
              </div>
              <RightSidebarToolbar />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
