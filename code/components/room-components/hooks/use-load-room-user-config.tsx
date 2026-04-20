// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { getSessionConfig } from "@/components/utils/session-config";
import { useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
  WeaveStageGridPlugin,
  WeaveUsersPointersPlugin,
} from "@inditextech/weave-sdk";
import React from "react";
import { useBreakpoint } from "../overlay/hooks/use-breakpoint";
import { useIAChat } from "@/store/ia-chat";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";

export const useLoadRoomUserConfig = () => {
  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const setViewType = useCollaborationRoom((state) => state.setViewType);
  const setGridEnabled = useCollaborationRoom((state) => state.setGridEnabled);
  const setGridType = useCollaborationRoom((state) => state.setGridType);
  const setBackgroundColor = useCollaborationRoom(
    (state) => state.setBackgroundColor,
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

  const setAiChatHidden = useIAChat((state) => state.setHidden);

  const breakpoint = useBreakpoint();

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    if (!roomInfo) {
      return;
    }

    if (status !== "running") {
      return;
    }

    const sessionConfig = getSessionConfig(roomInfo.room.roomId);

    // Set view type

    if (["2xl"].includes(breakpoint)) {
      setViewType(sessionConfig.viewType);
    } else {
      setViewType("floating");
    }

    // Set AI prompt visibility
    setAiChatHidden(sessionConfig.ai.prompt.visible);

    // Set UI users pointers visibility
    const userPointersPlugin =
      instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");

    if (userPointersPlugin && sessionConfig.ui.usersPointers.visible) {
      setUIUsersPointersVisible(true);
      userPointersPlugin.enable();
    }
    if (userPointersPlugin && !sessionConfig.ui.usersPointers.visible) {
      setUIUsersPointersVisible(false);
      userPointersPlugin.disable();
    }

    // Set UI comments visibility
    if (sessionConfig.ui.comments.visible) {
      setUICommentsVisible(true);
      instance.enablePlugin("commentsRenderer");
    }
    if (!sessionConfig.ui.comments.visible) {
      setUICommentsVisible(false);
      instance.disablePlugin("commentsRenderer");
    }

    // Set UI reference area visibility
    if (sessionConfig.ui.referenceArea.visible) {
      setUIReferenceAreaVisible(true);
      instance.enablePlugin(EXPORT_AREA_REFERENCE_PLUGIN_KEY);
    }
    if (!sessionConfig.ui.referenceArea.visible) {
      setUIReferenceAreaVisible(false);
      instance.disablePlugin(EXPORT_AREA_REFERENCE_PLUGIN_KEY);
    }

    // Set stage grid plugin config
    const stageGridPlugin = instance.getPlugin(
      "stageGrid",
    ) as WeaveStageGridPlugin;

    stageGridPlugin?.setType(sessionConfig.grid.type);
    setGridType(sessionConfig.grid.type);

    if (sessionConfig.grid.enabled) {
      instance.enablePlugin("stageGrid");
    } else {
      instance.disablePlugin("stageGrid");
    }
    setGridEnabled(sessionConfig.grid.enabled);

    setBackgroundColor(sessionConfig.backgroundColor);
  }, [
    breakpoint,
    instance,
    status,
    roomInfo,
    setViewType,
    setAiChatHidden,
    setUIUsersPointersVisible,
    setUICommentsVisible,
    setUIReferenceAreaVisible,
    setGridEnabled,
    setGridType,
    setBackgroundColor,
  ]);
};
