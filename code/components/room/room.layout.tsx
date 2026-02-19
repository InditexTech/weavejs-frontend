// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ContextMenuRender } from "@/components/room-components/context-menu";
import { TransformingOperation, useCollaborationRoom } from "@/store/store";
import { RoomHeader } from "@/components/room-components/overlay/room-header";
import { ToolsOverlay } from "@/components/room-components/overlay/tools-overlay";
import { useWeave, useWeaveEvents } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveFont,
} from "@inditextech/weave-types";
import { Logo } from "../utils/logo";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
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
import { MaskSlider } from "../room-components/overlay/mask-slider";
import { useToolsEvents } from "../room-components/hooks/use-tools-events";
import { RemoveBackgroundActionPopup } from "../room-components/overlay/remove-background-action-popup";
import { RoomHeaderShadowDom } from "../room-components/overlay/room-header-shadow-dom";
import { Comments } from "../room-components/comment/comments";
import { ExportConfigDialog } from "../room-components/overlay/export-config";
import { NodeToolbar } from "../room-components/overlay/node-toolbar";
import { VideosLibrary } from "../room-components/videos-library/videos-library";
import { ConnectionTestsOverlay } from "../room-components/overlay/connection-tests-overlay";
import { Button } from "../ui/button";
import { ManageIdleDisconnection } from "../room-components/manage-idle-disconnection";
import { useKeyboardHandler } from "../room-components/hooks/use-keyboard-handler";
import { SaveTemplateDialog } from "../room-components/overlay/save-template";
import { TemplatesLibrary } from "../room-components/templates-library/templates-library";
import { RoomHeaderRight } from "../room-components/overlay/room-header.right";
import { ChatBot } from "../room-components/ai-components/chatbot";
import ChatBotPrompt from "../room-components/ai-components/chatbot.prompt";
import { useIAChat } from "@/store/ia-chat";
import { useUserChanges } from "../room-components/hooks/use-user-changes";
import { ExportPDFConfigDialog } from "../room-components/overlay/export-pdf-config";
import { Progress } from "../ui/progress";

type RoomLayoutProps = {
  inShadowDom: boolean;
};

const TRANSFORMING_OPERATIONS: Record<
  Exclude<TransformingOperation, undefined>,
  string
> = {
  "background-removal": "background Removal",
  "negate-image": "image negative",
  "flip-horizontal-image": "image horizontal flip",
  "flip-vertical-image": "image vertical flip",
  "grayscale-image": "image grayscaling",
  "image-generation": "image generation",
  "image-edition": "image edition",
};

export const RoomLayout = ({ inShadowDom }: Readonly<RoomLayoutProps>) => {
  const router = useRouter();

  useWeaveEvents();
  useUserChanges();
  useContextMenu();
  useCopyPaste();

  const instance = useWeave((state) => state.instance);
  const status = useWeave((state) => state.status);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const room = useCollaborationRoom((state) => state.room);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const asyncElementsLoaded = useWeave((state) => state.asyncElements.loaded);
  const asyncElementsTotal = useWeave((state) => state.asyncElements.total);
  const asyncElementsAllLoaded = useWeave(
    (state) => state.asyncElements.allLoaded,
  );

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
  const transformingImage = useCollaborationRoom(
    (state) => state.images.transforming,
  );
  const transformingOperation = useCollaborationRoom(
    (state) => state.images.transformingOperation,
  );
  const uploadingImage = useCollaborationRoom(
    (state) => state.images.uploading,
  );
  const uploadingVideo = useCollaborationRoom(
    (state) => state.videos.uploading,
  );
  const loadingImage = useCollaborationRoom((state) => state.images.loading);
  const showMinimap = useCollaborationRoom((state) => state.ui.minimap);

  const fontsLoaded = useCollaborationRoom((state) => state.fonts.loaded);
  const setFontsLoaded = useCollaborationRoom((state) => state.setFontsLoaded);
  const setFontsValues = useCollaborationRoom((state) => state.setFontsValues);

  const backgroundColor = useCollaborationRoom(
    (state) => state.backgroundColor,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);

  const handleReconnectRoom = React.useCallback(async () => {
    if (!instance) {
      return;
    }

    await instance.getStore().connect();
  }, [instance]);

  const handleExitRoom = React.useCallback(async () => {
    sessionStorage.removeItem(`weave.js_${room}`);
    router.push("/");
  }, [room, router]);

  React.useEffect(() => {
    if (!instance) return;

    async function handleFontsLoaded(fonts: WeaveFont[]) {
      setFontsValues(fonts);
      setFontsLoaded(true);
    }

    instance.addEventListener("onFontsLoaded", handleFontsLoaded);

    return () => {
      instance.removeEventListener("onFontsLoaded", handleFontsLoaded);
    };
  }, [instance, fontsLoaded, setFontsLoaded, setFontsValues]);

  React.useEffect(() => {
    if (!instance) return;

    if (status !== WEAVE_INSTANCE_STATUS.RUNNING) return;

    if (!roomLoaded) return;

    const elementsTree = instance.getElementsTree();

    if (elementsTree.length === 0) {
      const stage = instance.getStage();
      stage.x(stage.width() / 2);
      stage.y(stage.height() / 2);
    }

    if (status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded) {
      instance.triggerAction("fitToScreenTool", {
        previousAction: "selectionTool",
        overrideZoom: false,
      });
    }
  }, [instance, status, roomLoaded, asyncElementsAllLoaded]);

  useToolsEvents();
  useKeyboardHandler();

  const roomFullyLoaded = React.useMemo(() => {
    return (
      status === WEAVE_INSTANCE_STATUS.RUNNING &&
      roomLoaded &&
      asyncElementsAllLoaded
    );
  }, [status, roomLoaded, asyncElementsAllLoaded]);

  const controls = useAnimation();

  React.useEffect(() => {
    if (!instance) return;

    if (roomFullyLoaded && asyncElementsAllLoaded) {
      controls.start({
        transition: {
          duration: 0.5,
          delay: !roomFullyLoaded ? 0 : 0.5,
        },
      });

      instance.triggerAction("fitToScreenTool", {
        previousAction: "selectionTool",
        overrideZoom: false,
      });
    }
  }, [instance, roomFullyLoaded, asyncElementsAllLoaded, controls]);

  return (
    <AnimatePresence>
      <motion.div
        animate={controls}
        className="w-full h-full flex flex-col relative overflow-hidden"
      >
        <section className="w-[calc(100%-480px)] h-full flex z-0 overflow-hidden relative">
          <div
            id="weave"
            tabIndex={0}
            style={{
              background: backgroundColor,
            }}
            className={cn("w-full h-full relative overflow-hidden", {
              ["pointer-events-none"]:
                weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED || !roomFullyLoaded,
              ["pointer-events-auto"]: roomFullyLoaded,
            })}
          >
            {roomFullyLoaded && <NodeToolbar />}
          </div>
          {weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.ERROR && (
            <div className="absolute top-0 left-0 right-0 bottom-0">
              <div className="w-full h-full bg-black/50 flex justify-center items-center pointer-events-none">
                <div className="bg-white p-8 flex justify-center items-center flex-col gap-2">
                  <div className="text-2xl font-inter font-light uppercase">
                    ERROR CONNECTING
                  </div>
                  <div className="text-xl font-inter font-light text-muted-foreground">
                    Please wait...
                  </div>
                </div>
              </div>
            </div>
          )}
          {weaveConnectionStatus ===
            WEAVE_STORE_CONNECTION_STATUS.CONNECTING && (
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
          {weaveConnectionStatus ===
            WEAVE_STORE_CONNECTION_STATUS.DISCONNECTED && (
            <div className="absolute top-0 left-0 right-0 bottom-0">
              <div className="w-full h-full bg-black/50 flex justify-center items-center">
                <div className="bg-white p-8 flex justify-center items-center flex-col gap-2">
                  <div className="text-2xl font-inter font-light uppercase">
                    YOU HAVE BEEN DISCONNECTED
                  </div>
                  <div className="text-xl font-inter font-light text-muted-foreground mt-3 flex gap-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-none !cursor-pointer uppercase !text-xs"
                      onClick={handleReconnectRoom}
                    >
                      Reconnect to room
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-none !cursor-pointer uppercase !text-xs"
                      onClick={handleExitRoom}
                    >
                      Close room
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {roomFullyLoaded && (
            <>
              {aiChatEnabled && <ChatBotPrompt />}
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
              <ConnectionTestsOverlay />
              {weaveConnectionStatus ===
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED && <ToolsOverlay />}
              <div
                id="minimap"
                className={cn(
                  "absolute bottom-[16px] right-[16px] border border-[#c9c9c9] w-[460px] w-auto bg-white z-[11]",
                  {
                    ["visible"]: showMinimap,
                    ["invisible"]: !showMinimap,
                  },
                )}
              ></div>
            </>
          )}
        </section>
        {inShadowDom ? <RoomHeaderShadowDom /> : <RoomHeader />}
        {WEAVE_STORE_CONNECTION_STATUS.CONNECTED === weaveConnectionStatus && (
          <section className="fixed bg-white top-0 right-0 bottom-0 w-[480px] h-full border-l border-l-[#c9c9c9]">
            <RoomHeaderRight />
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
                  <ElementsTree key={SIDEBAR_ELEMENTS.nodesTree} />
                  {aiChatEnabled && <ChatBot key={SIDEBAR_ELEMENTS.aiChat} />}
                </>
              )}
            </AnimatePresence>
          </section>
        )}
        {uploadingImage && (
          <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">
                Uploading image, please wait...
              </div>
            </div>
          </div>
        )}
        {uploadingVideo && (
          <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">
                Uploading video, please wait...
              </div>
            </div>
          </div>
        )}
        {loadingImage && (
          <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">
                Loading image, please wait...
              </div>
            </div>
          </div>
        )}
        {!asyncElementsAllLoaded && (
          <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="min-w-[320px] max-w-[320px] flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">Loading resources</div>
              <div className="w-full flex flex-col gap-1 justify-center items-center">
                <Progress
                  value={(asyncElementsLoaded / asyncElementsTotal) * 100}
                />
                <div className="font-inter text-xs text-center">{`${asyncElementsLoaded} / ${asyncElementsTotal}`}</div>
              </div>
            </div>
          </div>
        )}
        {transformingImage && transformingOperation && (
          <div className="bg-black/25 flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-[100]">
            <div className="flex flex-col gap-5 bg-white p-11 py-8 justify-center items-center">
              <Logo kind="large" variant="no-text" />
              <div className="font-inter text-base">
                {`Requesting ${TRANSFORMING_OPERATIONS[transformingOperation]}, please wait...`}
              </div>
            </div>
          </div>
        )}

        {roomFullyLoaded && (
          <>
            <ManageIdleDisconnection />
            <MaskSlider />
            <SaveTemplateDialog />
            <RemoveBackgroundActionPopup />
            <ExportConfigDialog />
            <ExportPDFConfigDialog />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
