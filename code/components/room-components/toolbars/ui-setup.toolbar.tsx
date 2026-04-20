// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Grid2X2, MessageCircle, MousePointer2, Scan } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useCollaborationRoom } from "@/store/store";
import {
  getSessionConfig,
  setSessionConfig,
} from "@/components/utils/session-config";
import { WeaveUsersPointersPlugin } from "@inditextech/weave-sdk";
import { Divider } from "../overlay/divider";
import { useWeave } from "@inditextech/weave-react";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const UISetupToolbar = () => {
  const instance = useWeave((state) => state.instance);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const gridEnabled = useCollaborationRoom((state) => state.grid.enabled);
  const usersPointersVisible = useCollaborationRoom(
    (state) => state.ui.usersPointers.visible,
  );
  const commentsVisible = useCollaborationRoom(
    (state) => state.ui.comments.visible,
  );
  const referenceAreaVisible = useCollaborationRoom(
    (state) => state.ui.referenceArea.visible,
  );

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const setGridEnabled = useCollaborationRoom((state) => state.setGridEnabled);
  const setUIUsersPointersVisible = useCollaborationRoom(
    (state) => state.setUIUsersPointersVisible,
  );
  const setUICommentsVisible = useCollaborationRoom(
    (state) => state.setUICommentsVisible,
  );
  const setUIReferenceAreaVisible = useCollaborationRoom(
    (state) => state.setUIReferenceAreaVisible,
  );

  const handleToggleGrid = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (!roomInfo) {
      return;
    }

    const room = roomInfo.room.roomId;

    const sessionConfig = getSessionConfig(room);
    sessionConfig.grid.enabled = !gridEnabled;
    setSessionConfig(room, sessionConfig);

    if (sessionConfig.grid.enabled) {
      instance.enablePlugin("stageGrid");
      setGridEnabled(true);
      return;
    }
    if (!sessionConfig.grid.enabled) {
      instance.disablePlugin("stageGrid");
      setGridEnabled(false);
    }
  }, [instance, roomInfo, gridEnabled, setGridEnabled]);

  const handleToggleUsersPointers = React.useCallback(() => {
    if (!instance) {
      return;
    }

    if (!roomInfo) {
      return;
    }

    const room = roomInfo.room.roomId;

    const sessionConfig = getSessionConfig(room);
    sessionConfig.ui.usersPointers.visible = !usersPointersVisible;
    setSessionConfig(room, sessionConfig);

    const userPointersPlugin =
      instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");

    if (userPointersPlugin && sessionConfig.ui.usersPointers.visible) {
      setUIUsersPointersVisible(true);
      userPointersPlugin.enable();
      return;
    }
    if (userPointersPlugin && !sessionConfig.ui.usersPointers.visible) {
      setUIUsersPointersVisible(false);
      userPointersPlugin.disable();
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

    if (sessionConfig.ui.comments.visible) {
      setUICommentsVisible(true);
      instance.enablePlugin("commentsRenderer");
      return;
    }
    if (!sessionConfig.ui.comments.visible) {
      setUICommentsVisible(false);
      instance.disablePlugin("commentsRenderer");
    }

    setUICommentsVisible(sessionConfig.ui.comments.visible);
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

    if (sessionConfig.ui.referenceArea.visible) {
      setUIReferenceAreaVisible(true);
      instance.enablePlugin(EXPORT_AREA_REFERENCE_PLUGIN_KEY);
      return;
    }
    if (!sessionConfig.ui.referenceArea.visible) {
      setUIReferenceAreaVisible(false);
      instance.disablePlugin(EXPORT_AREA_REFERENCE_PLUGIN_KEY);
    }
  }, [instance, roomInfo, referenceAreaVisible, setUIReferenceAreaVisible]);

  const isRoomReady = useIsRoomReady();

  if (isRoomSwitching || !isRoomReady) {
    return null;
  }

  return (
    <>
      <Divider className="h-[20px]" />
      <ToolbarButton
        icon={
          gridEnabled ? (
            <Grid2X2 size={20} strokeWidth={1} className="text-red-500" />
          ) : (
            <Grid2X2 size={20} strokeWidth={1} />
          )
        }
        onClick={handleToggleGrid}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>{gridEnabled ? "Hide reference grid" : "Show reference grid"}</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={
          usersPointersVisible ? (
            <MousePointer2 size={20} strokeWidth={1} className="text-red-500" />
          ) : (
            <MousePointer2 size={20} strokeWidth={1} />
          )
        }
        onClick={handleToggleUsersPointers}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>
              {usersPointersVisible
                ? "Hide users pointers"
                : "Show users pointers"}
            </p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={
          commentsVisible ? (
            <MessageCircle size={20} strokeWidth={1} className="text-red-500" />
          ) : (
            <MessageCircle size={20} strokeWidth={1} />
          )
        }
        onClick={handleToggleComments}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>{commentsVisible ? "Hide comments" : "Show comments"}</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
      <ToolbarButton
        icon={
          referenceAreaVisible ? (
            <Scan size={20} strokeWidth={1} className="text-red-500" />
          ) : (
            <Scan size={20} strokeWidth={1} />
          )
        }
        onClick={handleTogglePageAreaReference}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>
              {referenceAreaVisible
                ? "Hide page reference area"
                : "Show page reference area"}
            </p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={14}
        tooltipSide="bottom"
        tooltipAlign="center"
      />
    </>
  );
};
