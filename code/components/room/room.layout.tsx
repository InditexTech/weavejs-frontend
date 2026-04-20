// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useCollaborationRoom } from "@/store/store";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
} from "@inditextech/weave-types";
import { Logo } from "../utils/logo";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import useContextMenu from "../room-components/hooks/use-context-menu";
import useCopyPaste from "../room-components/hooks/use-copy-paste";
import { MaskSlider } from "../room-components/overlay/mask-slider";
import { useToolsEvents } from "../room-components/hooks/use-tools-events";
import { RemoveBackgroundActionPopup } from "../room-components/overlay/remove-background-action-popup";
import { ManageIdleDisconnection } from "../room-components/manage-idle-disconnection";
import { useKeyboardHandler } from "../room-components/hooks/use-keyboard-handler";
import { SaveTemplateDialog } from "../room-components/overlay/save-template";
import { useUserChanges } from "../room-components/hooks/use-user-changes";
import { RoomCanvas } from "./room.canvas";
import { RoomFooter } from "./room.footer";
import { useWeave, useWeaveEvents } from "@inditextech/weave-react";
import { RoomLeftSidebar } from "./room.left-sidebar";
import { RoomRightSidebar } from "./room.right-layout";
import { LlmSetupDialog } from "../room-components/overlay/llm-setup";
import { AppConfigurationDialog } from "../room-components/overlay/app-configuration";
import { ToolsOverlay } from "../room-components/overlay/tools-overlay";
import { NodeToolbar } from "../room-components/overlay/node-toolbar";
import ChatBotPrompt from "../room-components/ai-components/chatbot.prompt";
import { ContextMenuRender } from "../room-components/context-menu";
import { WeaveContextMenuPlugin } from "@inditextech/weave-sdk";
import { useIAChat } from "@/store/ia-chat";
import { RoomHeaderShadowDom } from "../room-components/overlay/room-header-shadow-dom";
import { RoomHeader } from "./room.header";
import { useHandleStageResize } from "../room-components/hooks/use-handle-stage-resize";
import { useHandleFontsLoaded } from "../room-components/hooks/use-handle-fonts-loaded";
import { useHandleRoomEvents } from "../room-components/hooks/use-handle-room-events";
import { ExportRoomToPdfConfigDialog } from "../room-components/overlay/export-room-to-pdf-config";
import { ExportPageToImageConfigDialog } from "../room-components/overlay/export-page-to-image-config";
import { ExportFramesToPDFConfigDialog } from "../room-components/overlay/export-frames-to-pdf-config";
import { PresentationMode } from "./presentation-mode/presentation-mode";

type RoomLayoutProps = {
  inShadowDom: boolean;
};

export const RoomLayout = ({ inShadowDom }: Readonly<RoomLayoutProps>) => {
  useWeaveEvents();
  useUserChanges();
  useContextMenu();
  useCopyPaste();
  useHandleRoomEvents();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const roomInfo = useCollaborationRoom((state) => state.roomInfo.data);
  const addingImages = useCollaborationRoom((state) => state.images.adding);
  const uploadingVideo = useCollaborationRoom(
    (state) => state.videos.uploading,
  );

  const viewType = useCollaborationRoom((state) => state.viewType);

  const contextMenuShow = useCollaborationRoom(
    (state) => state.contextMenu.show,
  );
  const contextMenuPosition = useCollaborationRoom(
    (state) => state.contextMenu.position,
  );
  const contextMenuOptions = useCollaborationRoom(
    (state) => state.contextMenu.options,
  );
  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow,
  );
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);

  useHandleFontsLoaded();
  useHandleStageResize();

  useToolsEvents();
  useKeyboardHandler();

  const roomFullyLoaded = React.useMemo(() => {
    return status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded;
  }, [status, roomLoaded]);

  const controls = useAnimation();

  React.useEffect(() => {
    if (!instance) return;

    if (roomFullyLoaded) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 0.5,
        },
      });
    }
  }, [instance, roomFullyLoaded, controls]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        className="absolute top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col relative overflow-hidden"
      >
        <RoomCanvas />
        {viewType === "floating" && (
          <>
            {inShadowDom && <RoomHeaderShadowDom />}
            {!inShadowDom && <RoomHeader />}
          </>
        )}
        {roomLoaded && <NodeToolbar />}
        {<ToolsOverlay />}
        {roomFullyLoaded && (
          <>
            {aiChatEnabled &&
              !imageCroppingEnabled &&
              WEAVE_STORE_CONNECTION_STATUS.CONNECTED ===
                weaveConnectionStatus && <ChatBotPrompt />}
            <ContextMenuRender
              show={contextMenuShow}
              onChanged={(show: boolean) => {
                if (!show) {
                  instance
                    ?.getPlugin<WeaveContextMenuPlugin>("contextMenu")
                    ?.closeContextMenu();
                }
                setContextMenuShow(show);
              }}
              position={contextMenuPosition}
              options={contextMenuOptions}
            />
            <ManageIdleDisconnection />
            <MaskSlider />
            <SaveTemplateDialog />
            <RemoveBackgroundActionPopup />
            <ExportPageToImageConfigDialog />
            <ExportRoomToPdfConfigDialog />
            <ExportFramesToPDFConfigDialog />
            <LlmSetupDialog />
            <AppConfigurationDialog />
          </>
        )}
        <RoomLeftSidebar inShadowDom={inShadowDom} />
        <RoomRightSidebar />
        <RoomFooter />
        {addingImages && (
          <div className="bg-black/5 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">
                Adding images, please wait...
              </div>
            </div>
          </div>
        )}
        {uploadingVideo && (
          <div className="bg-black/5 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">
                Uploading video, please wait...
              </div>
            </div>
          </div>
        )}
        <PresentationMode key={roomInfo?.roomId} />
      </motion.div>
    </AnimatePresence>
  );
};
