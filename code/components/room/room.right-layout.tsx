// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagesLibrary } from "../room-components/images-library/images-library";
import { FramesLibrary } from "../room-components/frames-library/frames-library";
import { ColorTokensLibrary } from "../room-components/color-tokens-library/color-tokens-library";
import { NodeProperties } from "../room-components/overlay/node-properties";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { Comments } from "../room-components/comment/comments";
import { VideosLibrary } from "../room-components/videos-library/videos-library";
import { TemplatesLibrary } from "../room-components/templates-library/templates-library";
import { ChatBot } from "../room-components/ai-components/chatbot";
import { useIAChat } from "@/store/ia-chat";
import { useWeave } from "@inditextech/weave-react";
import { RoomUser } from "./room.user";

export const RoomRightSidebar = () => {
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const isRoomSwitching = useWeave((state) => state.room.switching);

  const showRightSidebarFloating = useCollaborationRoom(
    (state) => state.showRightSidebarFloating,
  );
  const viewType = useCollaborationRoom((state) => state.viewType);
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);

  if (WEAVE_STORE_CONNECTION_STATUS.CONNECTED !== weaveConnectionStatus) {
    return null;
  }

  return (
    <section
      className={cn(
        "z-0 top-0 right-0 w-[400px] flex flex-col justify-between",
        {
          ["fixed top-0 right-0 bottom-0 h-[calc(100%-65px-40px)] w-[400px]"]:
            viewType === "fixed",
          ["absolute top-[62px] right-[8px] w-[400px] h-[calc(100%-54px-16px-40px)]"]:
            viewType === "floating",
          ["h-[65px]"]: imageCroppingEnabled,
          ["bottom-[8px] h-[calc(100%-54px-16px-40px)]"]:
            !imageCroppingEnabled && viewType === "floating",
          ["visible pointer-events-auto"]:
            !imageCroppingEnabled &&
            ((viewType === "floating" && showRightSidebarFloating) ||
              viewType === "fixed"),
          ["invisible pointer-events-none"]:
            imageCroppingEnabled ||
            (viewType === "floating" && !showRightSidebarFloating),
        },
      )}
    >
      <div
        className={cn("w-full h-full", {
          ["drop-shadow"]: viewType === "floating",
        })}
      >
        {viewType === "fixed" && (
          <div className="w-full flex justify-end items-center gap-3 p-5 py-3 border-b-[0.5px] border-[#c9c9c9]">
            <RoomUser />
          </div>
        )}
        {WEAVE_STORE_CONNECTION_STATUS.CONNECTED === weaveConnectionStatus &&
          !isRoomSwitching && (
            <div
              className={cn("w-full h-full bg-white", {
                // ["border-t-[0.5px] border-[#c9c9c9]"]: viewType === "fixed",
                ["border-[0.5px] border-[#c9c9c9]"]: viewType === "floating",
                ["visible pointer-events-auto"]:
                  !imageCroppingEnabled &&
                  ((viewType === "floating" && showRightSidebarFloating) ||
                    viewType === "fixed"),
                ["invisible pointer-events-none"]:
                  imageCroppingEnabled ||
                  (viewType === "floating" && !showRightSidebarFloating),
              })}
            >
              <AnimatePresence>
                {WEAVE_STORE_CONNECTION_STATUS.CONNECTED ===
                  weaveConnectionStatus && (
                  <>
                    <NodeProperties />
                    <ImagesLibrary key={SIDEBAR_ELEMENTS.images} />
                    <TemplatesLibrary key={SIDEBAR_ELEMENTS.templates} />
                    <VideosLibrary key={SIDEBAR_ELEMENTS.videos} />
                    <FramesLibrary key={SIDEBAR_ELEMENTS.frames} />
                    <ColorTokensLibrary key={SIDEBAR_ELEMENTS.colorTokens} />
                    <Comments key={SIDEBAR_ELEMENTS.comments} />
                    {/* <ElementsTree key={SIDEBAR_ELEMENTS.nodesTree} /> */}
                    {aiChatEnabled && <ChatBot key={SIDEBAR_ELEMENTS.aiChat} />}
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
      </div>
    </section>
  );
};
