// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ContextMenuRender } from "@/components/room-components/context-menu";
import { useCollaborationRoom } from "@/store/store";
import { RoomHeader } from "@/components/room-components/overlay/room-header";
import { ToolsOverlay } from "@/components/room-components/overlay/tools-overlay";
import { useWeave, useWeaveEvents } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
} from "@inditextech/weave-types";
import { Logo } from "../utils/logo";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagesLibrary } from "../room-components/images-library/images-library";
import { FramesLibrary } from "../room-components/frames-library/frames-library";
import { ColorTokensLibrary } from "../room-components/color-tokens-library/color-tokens-library";
import { ElementsTree } from "../room-components/elements-tree/elements-tree";
import { NodeProperties } from "../room-components/overlay/node-properties";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { WeaveContextMenuPlugin } from "@inditextech/weave-sdk";
import useContextMenu from "../room-components/hooks/use-context-menu";
import useCopyPaste from "../room-components/hooks/use-copy-paste";
import { LLMGenerationV2Popup } from "../room-components/overlay/llm-popup-v2";
import { LLMPredictionsSelectionV2Popup } from "../room-components/overlay/llm-predictions-selection-v2";
import { MaskSlider } from "../room-components/overlay/mask-slider";
import { LLMReferenceSelectionV2Popup } from "../room-components/overlay/llm-reference-selection-v2";
import { useToolsEvents } from "../room-components/hooks/use-tools-events";

export const RoomLayout = () => {
  useWeaveEvents();
  useContextMenu();
  useCopyPaste();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const sidebarLeftActive = useCollaborationRoom(
    (state) => state.sidebar.left.active
  );
  const sidebarRightActive = useCollaborationRoom(
    (state) => state.sidebar.right.active
  );
  const contextMenuShow = useCollaborationRoom(
    (state) => state.contextMenu.show
  );
  const contextMenuPosition = useCollaborationRoom(
    (state) => state.contextMenu.position
  );
  const contextMenuOptions = useCollaborationRoom(
    (state) => state.contextMenu.options
  );
  const setContextMenuShow = useCollaborationRoom(
    (state) => state.setContextMenuShow
  );
  const transformingImage = useCollaborationRoom(
    (state) => state.images.transforming
  );
  const uploadingImage = useCollaborationRoom(
    (state) => state.images.uploading
  );
  const loadingImage = useCollaborationRoom((state) => state.images.loading);

  React.useEffect(() => {
    if (!instance) return;

    if (status !== WEAVE_INSTANCE_STATUS.RUNNING) return;

    if (!roomLoaded) return;

    const elementsTree = instance.getElementsTree();
    if (elementsTree.length === 0) {
      const stage = instance.getStage();
      stage.x(stage.width() / 2);
      stage.y(stage.height() / 2);
    } else {
      instance.triggerAction("fitToScreenTool", {
        previousAction: "selectionTool",
      });
    }
  }, [instance, status, roomLoaded]);

  useToolsEvents();

  return (
    <AnimatePresence>
      <motion.div
        transition={{
          duration: 0.5,
          delay: !(status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded)
            ? 0
            : 0.5,
        }}
        className="w-full h-full flex flex-col relative overflow-hidden"
      >
        <section
          id="sidebar-left"
          className={cn(
            "bg-white absolute top-0 left-0 bottom-0 border-r border-[#c9c9c9] z-[10] overflow-hidden",
            {
              ["w-0"]: sidebarLeftActive === null,
              ["w-[370px]"]: sidebarLeftActive !== null,
            }
          )}
        >
          <AnimatePresence>
            <ImagesLibrary key={SIDEBAR_ELEMENTS.images} />
            <FramesLibrary key={SIDEBAR_ELEMENTS.frames} />
            <ColorTokensLibrary key={SIDEBAR_ELEMENTS.colorTokens} />
            <ElementsTree key={SIDEBAR_ELEMENTS.nodesTree} />
            {weaveConnectionStatus !==
              WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
              <div className="absolute top-0 left-0 right-0 bottom-0">
                <div className="w-full h-full bg-black/50 flex justify-center items-center pointer-events-none"></div>
              </div>
            )}
          </AnimatePresence>
        </section>
        <section
          className={cn("w-full h-full flex z-0 overflow-hidden", {
            // ["left-[370px]"]: sidebarLeftActive !== null,
            // ["right-[370px]"]: sidebarRightActive !== null,
            // ["w-[calc(100%-370px)]"]:
            //   sidebarLeftActive !== null || sidebarRightActive !== null,
            // ["w-[calc(100%-740px)]"]:
            //   sidebarLeftActive !== null && sidebarRightActive !== null,
          })}
        >
          <div
            id="paste-catcher"
            contentEditable="true"
            tabIndex={0}
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
            }}
          ></div>
          <div
            id="weave"
            // contentEditable="true"
            tabIndex={0}
            className={cn("w-full h-full relative overflow-hidden", {
              ["pointer-events-none"]:
                weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                status !== WEAVE_INSTANCE_STATUS.RUNNING ||
                !roomLoaded,
              ["pointer-events-auto"]:
                status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded,
            })}
          ></div>
          <RoomHeader />
          {weaveConnectionStatus !==
            WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
            <div className="absolute top-0 left-0 right-0 bottom-0">
              <div className="w-full h-full bg-black/50 flex justify-center items-center pointer-events-none">
                <div className="bg-white p-8 flex justify-center items-center flex-col gap-2">
                  <div className="text-2xl font-inter font-light uppercase">
                    CONNECTING
                  </div>
                  <div className="text-xl font-inter font-light text-muted-foreground">
                    Please wait...
                  </div>
                </div>
              </div>
            </div>
          )}
          {status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded && (
            <>
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
              <ToolsOverlay />
              {transformingImage && (
                <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0">
                  <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
                    <Logo kind="large" variant="no-text" />
                    <div className="font-inter text-base">
                      Removing background...
                    </div>
                  </div>
                </div>
              )}
              {uploadingImage && (
                <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0">
                  <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
                    <Logo kind="large" variant="no-text" />
                    <div className="font-inter text-base">
                      Uploading image...
                    </div>
                  </div>
                </div>
              )}
              {loadingImage && (
                <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0">
                  <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
                    <Logo kind="large" variant="no-text" />
                    <div className="font-inter text-base">Loading image...</div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        <section
          id="sidebar-right"
          className={cn(
            "bg-white absolute top-0 right-0 bottom-0 border-l border-[#c9c9c9] z-[10] overflow-hidden",
            {
              ["w-0"]: sidebarRightActive === null,
              ["w-[370px]"]: sidebarRightActive !== null,
            }
          )}
        >
          <NodeProperties />
          {weaveConnectionStatus !==
            WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
            <div className="absolute top-0 left-0 right-0 bottom-0">
              <div className="w-full h-full bg-black/50 flex justify-center items-center pointer-events-none"></div>
            </div>
          )}
        </section>

        {status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded && (
          <>
            <MaskSlider />
            <LLMGenerationV2Popup />
            <LLMPredictionsSelectionV2Popup />
            <LLMReferenceSelectionV2Popup />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
