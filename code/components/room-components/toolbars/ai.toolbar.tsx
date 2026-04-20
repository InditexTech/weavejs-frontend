// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Bot, BotOff } from "lucide-react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { useIAChat } from "@/store/ia-chat";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useWeave } from "@inditextech/weave-react";
import { Divider } from "../overlay/divider";
import {
  getSessionConfig,
  setSessionConfig,
} from "@/components/utils/session-config";
import { useCollaborationRoom } from "@/store/store";
import { useIsRoomReady } from "../hooks/use-is-room-ready";

export const AIToolbar = () => {
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);

  const aiChatHidden = useIAChat((state) => state.hidden);
  const setAiChatHidden = useIAChat((state) => state.setHidden);

  useHotkey({ key: "I", mod: false, shift: true }, () => {
    setAiChatHidden(!aiChatHidden);
  });

  const isRoomReady = useIsRoomReady();

  if (isRoomSwitching || !isRoomReady) {
    return null;
  }

  return (
    <>
      <ToolbarButton
        icon={
          aiChatHidden ? <Bot strokeWidth={1} /> : <BotOff strokeWidth={1} />
        }
        onClick={() => {
          if (!roomInfo) {
            return;
          }

          const room = roomInfo.room.roomId;

          const sessionConfig = getSessionConfig(room);
          sessionConfig.ai.prompt.visible = !aiChatHidden;
          setSessionConfig(room, sessionConfig);

          setAiChatHidden(sessionConfig.ai.prompt.visible);
        }}
        label={
          <div className="flex gap-3 justify-start items-center">
            <p>{aiChatHidden ? "Show AI Prompt" : "Hide AI Prompt"}</p>
          </div>
        }
        size="small"
        variant="squared"
        tooltipSideOffset={4}
        tooltipSide="top"
        tooltipAlign="center"
      />
      <Divider className="h-[20px]" />
    </>
  );
};
