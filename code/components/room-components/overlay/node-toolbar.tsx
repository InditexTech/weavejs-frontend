// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useWeave } from "@inditextech/weave-react";
import React from "react";
import Konva from "konva";
import {
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveElementInstance,
  WeaveStateElement,
  WEAVE_EXPORT_RETURN_FORMAT,
} from "@inditextech/weave-types";
import { useMutation } from "@tanstack/react-query";
import { postRemoveBackground } from "@/api/v2/post-remove-background";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import {
  Group,
  Ungroup,
  Paperclip,
  Layers,
  Lock,
  EyeOff,
  Copy,
  BringToFront,
  ArrowUp,
  ArrowDown,
  SendToBack,
  Trash,
  Crop,
  BrushCleaning,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  UnfoldHorizontal,
  UnfoldVertical,
  Play,
  Pause,
  RotateCcw,
  Minus,
  FlipHorizontal,
  FlipVertical,
  PaintRoller,
  Unlink,
  Link,
  ImageUpscale,
  WandSparkles,
  FlipVertical2,
  Ruler,
  Settings,
} from "lucide-react";
import { ShortcutElement } from "../help/shortcut-element";
import { cn, SYSTEM_OS } from "@/lib/utils";
import {
  WEAVE_IMAGE_CROP_END_TYPE,
  WeaveCopyPasteNodesPlugin,
  WeaveAlignNodesToolActionTriggerParams,
  WeaveVideoNode,
  WeaveMeasureNode,
  WeaveTextNode,
  TEXT_LAYOUT,
} from "@inditextech/weave-sdk";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { fileToDataURL } from "@/components/utils/images";
import { postNegateImage } from "@/api/post-negate-image";
import { postFlipImage } from "@/api/post-flip-image";
import { postGrayscaleImage } from "@/api/post-grayscale-image";
import merge from "lodash/merge";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { IMAGE_TEMPLATE_FIT } from "@/components/nodes/image-template/constants";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import { useIAChat } from "@/store/ia-chat";
import { useBreakpoint } from "./hooks/use-breakpoint";
import { useGetSession } from "../hooks/use-get-session";

export const NodeToolbar = () => {
  const actualNodeRef = React.useRef<WeaveStateElement | undefined>(undefined);

  const [dontRender, setDontRender] = React.useState(false);
  const [movingImageTemplate, setMovingImageTemplate] =
    React.useState<Konva.Group | null>(null);

  const [actualMenusOpen, setActualMenusOpen] = React.useState<string[]>([]);

  const [isSelecting] = React.useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const [isVideoPaused, setIsVideoPaused] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const actualAction = useWeave((state) => state.actions.actual);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);

  const viewType = useCollaborationRoom((state) => state.viewType);
  const showRightSidebarFloating = useCollaborationRoom(
    (state) => state.showRightSidebarFloating,
  );
  const setShowRightSidebarFloating = useCollaborationRoom(
    (state) => state.setShowRightSidebarFloating,
  );

  const { session } = useGetSession();

  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const nodePropertiesAction: "create" | "update" | undefined =
    useCollaborationRoom((state) => state.nodeProperties.action);
  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads,
  );
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );
  const setReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.setReferenceMeasurePixels,
  );

  const linkedNode = useCollaborationRoom((state) => state.linkedNode);
  const setLinkedNode = useCollaborationRoom((state) => state.setLinkedNode);

  const imageModel = useIAChat((state) => state.imageOptions.model);
  const imageSamples = useIAChat((state) => state.imageOptions.samples);
  const imageAspectRatio = useIAChat((state) => state.imageOptions.aspectRatio);
  const imageSize = useIAChat((state) => state.imageOptions.size);
  const imageQuality = useIAChat((state) => state.imageOptions.quality);
  const sendMessage = useIAChat((state) => state.sendMessage);
  const setAiView = useIAChat((state) => state.setView);

  const promptInputAttachmentsController = usePromptInputAttachments();

  const breakpoint = useBreakpoint();

  // Handle drag & transform
  React.useEffect(() => {
    if (!instance) return;

    function handleOnDrag(node: Konva.Node | null = null) {
      if (node) {
        setDontRender(true);
      } else {
        setDontRender(false);
      }
    }

    function handleOnTransform(node: Konva.Node | null = null) {
      if (node) {
        setDontRender(true);
      } else {
        setDontRender(false);
      }
    }

    instance.addEventListener("onDrag", handleOnDrag);
    instance.addEventListener("onTransform", handleOnTransform);

    return () => {
      instance.addEventListener("onDrag", handleOnDrag);
      instance.addEventListener("onTransform", handleOnTransform);
    };
  }, [instance]);

  React.useEffect(() => {
    if (!instance) return;

    function handleOnEnterTextEditMode() {
      setDontRender(true);
    }

    function handleOnExitTextEditMode() {
      setDontRender(false);
    }

    instance.addEventListener(
      "onEnterTextNodeEditMode",
      handleOnEnterTextEditMode,
    );
    instance.addEventListener(
      "onExitTextNodeEditMode",
      handleOnExitTextEditMode,
    );

    return () => {
      instance.removeEventListener(
        "onEnterTextNodeEditMode",
        handleOnEnterTextEditMode,
      );
      instance.removeEventListener(
        "onExitTextNodeEditMode",
        handleOnExitTextEditMode,
      );
    };
  }, [instance]);

  React.useEffect(() => {
    if (!instance) return;

    function handleImageTemplateFreed({ template }: { template: Konva.Group }) {
      setMovingImageTemplate(template as Konva.Group);
    }

    function handleImageTemplateLocked({
      template,
    }: {
      template: Konva.Group;
    }) {
      if (
        movingImageTemplate?.getAttrs()?.id === (template.getAttrs().id ?? "")
      ) {
        setMovingImageTemplate(null);
      }
    }

    instance.addEventListener("onImageTemplateFreed", handleImageTemplateFreed);
    instance.addEventListener(
      "onImageTemplateLocked",
      handleImageTemplateLocked,
    );

    return () => {
      instance.removeEventListener(
        "onImageTemplateFreed",
        handleImageTemplateFreed,
      );
      instance.removeEventListener(
        "onImageTemplateLocked",
        handleImageTemplateLocked,
      );
    };
  }, [instance, movingImageTemplate]);

  const mutationRemoveBackground = useMutation({
    mutationFn: async ({
      userId,
      clientId,
      imageId,
      image,
    }: {
      userId: string;
      clientId: string;
      imageId: string;
      image: { dataBase64: string; contentType: string };
    }) => {
      return await postRemoveBackground(
        userId,
        clientId,
        room ?? "",
        imageId,
        image,
      );
    },
  });

  const mutationNegate = useMutation({
    mutationFn: async ({
      userId,
      clientId,
      imageId,
      image,
    }: {
      userId: string;
      clientId: string;
      imageId: string;
      image: { dataBase64: string; contentType: string };
    }) => {
      return await postNegateImage(
        userId,
        clientId,
        room ?? "",
        imageId,
        image,
      );
    },
  });

  const mutationFlip = useMutation({
    mutationFn: async ({
      userId,
      clientId,
      imageId,
      image,
      orientation,
    }: {
      userId: string;
      clientId: string;
      imageId: string;
      image: { dataBase64: string; contentType: string };
      orientation: "horizontal" | "vertical";
    }) => {
      return await postFlipImage(
        userId,
        clientId,
        room ?? "",
        imageId,
        orientation,
        image,
      );
    },
  });

  const mutationGrayscale = useMutation({
    mutationFn: async ({
      userId,
      clientId,
      imageId,
      image,
    }: {
      userId: string;
      clientId: string;
      imageId: string;
      image: { dataBase64: string; contentType: string };
    }) => {
      return await postGrayscaleImage(
        userId,
        clientId,
        room ?? "",
        imageId,
        image,
      );
    },
  });

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
  );

  const actualNode = React.useMemo(() => {
    if (!node && actualAction && nodePropertiesAction === "create") {
      return {
        key: "creating",
        type: "undefined",
        props: {
          ...nodeCreateProps,
        },
      };
    }
    if (node && nodePropertiesAction === "update") {
      return node;
    }
    return undefined;
  }, [actualAction, node, nodePropertiesAction, nodeCreateProps]);

  React.useEffect(() => {
    if (actualNode?.key !== actualNodeRef.current?.key) {
      actualNodeRef.current = actualNode;
      setActualMenusOpen([]);
    }
    if (typeof actualNode === "undefined") {
      actualNodeRef.current = undefined;
      setActualMenusOpen([]);
    }
  }, [actualNode]);

  const isSingleNodeSelected = React.useMemo(() => {
    return nodes.length === 1;
  }, [nodes]);

  const isMultiNodesSelected = React.useMemo(() => {
    return nodes.length > 1;
  }, [nodes]);

  const isGroup = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "group",
    [actualNode],
  );

  const isVideoNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "video",
    [actualNode],
  );

  React.useEffect(() => {
    if (!instance) return;

    function onPlayVideoHandler({ nodeId }: { nodeId: string }) {
      if (nodeId === actualNode?.key) {
        setIsVideoPlaying(true);
      } else {
        setIsVideoPlaying(false);
      }
    }

    function onPauseVideoHandler({ nodeId }: { nodeId: string }) {
      if (nodeId === actualNode?.key) {
        setIsVideoPlaying(false);
        setIsVideoPaused(true);
      } else {
        setIsVideoPaused(false);
      }
    }

    function onStopVideoHandler({ nodeId }: { nodeId: string }) {
      if (nodeId === actualNode?.key) {
        setIsVideoPlaying(false);
      } else {
        setIsVideoPlaying(false);
      }
    }

    instance.addEventListener("onVideoPlay", onPlayVideoHandler);
    instance.addEventListener("onVideoPause", onPauseVideoHandler);
    instance.addEventListener("onVideoStop", onStopVideoHandler);

    return () => {
      if (!instance) return;

      instance.removeEventListener("onVideoPlay", onPlayVideoHandler);
      instance.removeEventListener("onVideoPause", onPauseVideoHandler);
      instance.removeEventListener("onVideoStop", onStopVideoHandler);
    };
  }, [instance, actualNode]);

  const isTextNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "text",
    [actualNode],
  );

  const isMeasureNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "measure",
    [actualNode],
  );

  const isImage = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "image",
    [actualNode],
  );

  const isImageTemplate = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "image-template",
    [actualNode],
  );

  const imageTemplateFit = React.useMemo(() => {
    if (!isImageTemplate || !actualNode) {
      return undefined;
    }

    return actualNode.props.fit;
  }, [isImageTemplate, actualNode]);

  if (dontRender) {
    return null;
  }

  if (!roomLoaded) {
    return null;
  }

  if (isSelecting) {
    return null;
  }

  if (nodes.length === 0 || imageCroppingEnabled) {
    return null;
  }

  return (
    <div
      className={cn("pointer-events-none", {
        ["absolute top-[8px] left-[8px] right-[8px] flex gap-2 justify-center items-center"]:
          breakpoint === "2xl",
        ["absolute top-0 left-0 right-0 bottom-0"]: breakpoint !== "2xl",
        ["!top-[62px]"]: viewType === "floating",
        ["!top-[8px]"]: viewType === "fixed",
      })}
    >
      <div
        className={cn(
          "pointer-events-none flex gap-[16px] justify-center items-center  pointer-events-auto",
          {
            ["relative flex"]: breakpoint === "2xl",
          },
        )}
      >
        {(isImage ||
          isVideoNode ||
          isMeasureNode ||
          isImageTemplate ||
          (isTextNode &&
            actualNode?.props.layout === TEXT_LAYOUT.SMART &&
            ((actualNode?.props.smartFixedWidth ?? false) ||
              (actualNode?.props.smartFixedHeight ?? false)))) && (
          <div className="flex gap-0 justify-center items-center bg-white border rounded-none border-zinc-200 drop-shadow">
            <div className="flex gap-[2px] h-[40px] justify-end items-center px-1 my-1">
              {isVideoNode && (
                <>
                  {!isVideoPlaying && (
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={<Play className="px-0" size={20} strokeWidth={1} />}
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      active={actualMenusOpen.includes("nodeStyle")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!instance || !actualNode) return;

                        const nodeVideo = instance
                          .getMainLayer()
                          ?.findOne(`#${actualNode?.key}`);

                        const nodeHandler =
                          instance.getNodeHandler<WeaveVideoNode>("video");

                        if (nodeVideo && nodeHandler) {
                          nodeHandler.play(actualNode?.key);
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Play video</p>
                        </div>
                      }
                      tooltipSide="top"
                      tooltipAlign="center"
                    />
                  )}
                  {isVideoPlaying && (
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={
                        <Pause className="px-0" size={20} strokeWidth={1} />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      active={actualMenusOpen.includes("nodeStyle")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!instance || !actualNode) return;

                        const nodeVideo = instance
                          .getMainLayer()
                          ?.findOne(`#${actualNode?.key}`);

                        const nodeHandler =
                          instance.getNodeHandler<WeaveVideoNode>("video");

                        if (nodeVideo && nodeHandler) {
                          nodeHandler.pause(actualNode?.key);
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Pause video</p>
                        </div>
                      }
                      tooltipSide="top"
                      tooltipAlign="center"
                    />
                  )}
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={
                      <RotateCcw className="px-0" size={20} strokeWidth={1} />
                    }
                    disabled={!isVideoPlaying && !isVideoPaused}
                    active={actualMenusOpen.includes("nodeStyle")}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!instance || !actualNode) return;

                      const nodeVideo = instance
                        .getMainLayer()
                        ?.findOne(`#${actualNode?.key}`);

                      const nodeHandler =
                        instance.getNodeHandler<WeaveVideoNode>("video");

                      if (nodeVideo && nodeHandler) {
                        nodeHandler.stop(actualNode?.key);
                        setIsVideoPaused(false);
                        setIsVideoPlaying(false);
                      }
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Reset video</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                </>
              )}
              {isMeasureNode && (
                <>
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={
                      <FlipVertical2
                        className="px-0"
                        size={20}
                        strokeWidth={1}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={() => {
                      if (!instance) {
                        return;
                      }

                      const nodeInstance = instance
                        .getStage()
                        .findOne(`#${node?.key}`);

                      const measureHandler =
                        instance.getNodeHandler<WeaveMeasureNode>("measure");
                      if (nodeInstance && measureHandler) {
                        measureHandler.flipOrientation(
                          nodeInstance as Konva.Group,
                        );
                      }
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Flip</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={<Ruler className="px-0" size={20} strokeWidth={1} />}
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={() => {
                      if (!instance) {
                        return;
                      }

                      const nodeInstance = instance
                        .getStage()
                        .findOne(`#${node?.key}`);

                      const measureHandler =
                        instance.getNodeHandler<WeaveMeasureNode>("measure");
                      if (nodeInstance && measureHandler) {
                        const distanceInPixels =
                          measureHandler.getNormalizedDistance(
                            nodeInstance as Konva.Group,
                          );

                        const actualSavedConfig = JSON.parse(
                          sessionStorage.getItem(
                            `weave_measurement_config_${room}`,
                          ) || "{}",
                        );

                        const updatedConfig = {
                          referenceMeasurePixels: distanceInPixels,
                        };

                        const finalConfiguration = merge(
                          actualSavedConfig,
                          updatedConfig,
                        );

                        sessionStorage.setItem(
                          `weave_measurement_config_${room}`,
                          JSON.stringify(finalConfiguration),
                        );

                        setReferenceMeasurePixels(distanceInPixels);

                        const scale =
                          distanceInPixels /
                          (actualSavedConfig?.referenceMeasureUnits ?? "10");

                        instance.emitEvent("onMeasureReferenceChange", {
                          unit: finalConfiguration.units ?? "cms",
                          unitPerPixel: scale,
                        });
                      }
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Set as reference measure</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                </>
              )}
              {isImageTemplate && (
                <>
                  {!actualNode?.props.isUsed && (
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={<Link className="px-0" size={20} strokeWidth={1} />}
                      disabled={
                        !linkedNode ||
                        weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={async () => {
                        if (!instance) {
                          return;
                        }

                        const handler =
                          instance.getNodeHandler<ImageTemplateNode>(
                            "image-template",
                          );

                        const stage = instance.getStage();
                        const nodeInstance = stage.findOne(
                          `#${actualNode?.key ?? ""}`,
                        );

                        if (!handler || !nodeInstance || !linkedNode) {
                          return;
                        }

                        handler.setImage(
                          nodeInstance as WeaveElementInstance,
                          linkedNode as WeaveElementInstance,
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>link image</p>
                        </div>
                      }
                      tooltipSide="top"
                      tooltipAlign="center"
                    />
                  )}
                  {actualNode?.props.isUsed && (
                    <>
                      <DropdownMenu
                        modal={false}
                        open={actualMenusOpen.includes("templateFit")}
                      >
                        <DropdownMenuTrigger
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          className={cn(
                            "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                            {
                              ["disabled:cursor-default disabled:opacity-50"]:
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                            },
                          )}
                          asChild
                        >
                          <ToolbarButton
                            className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                            icon={
                              <ImageUpscale
                                className="px-0"
                                size={20}
                                strokeWidth={1}
                              />
                            }
                            disabled={
                              weaveConnectionStatus !==
                              WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                            }
                            active={actualMenusOpen.includes("templateFit")}
                            onClick={(e) => {
                              e.preventDefault();
                              setActualMenusOpen((prev) =>
                                prev.length > 0 ? [] : ["templateFit"],
                              );
                            }}
                            label={
                              <div className="flex gap-3 justify-start items-center">
                                <p>Template fit</p>
                              </div>
                            }
                            tooltipSide="top"
                            tooltipAlign="center"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          onCloseAutoFocus={(e) => {
                            e.preventDefault();
                          }}
                          align="start"
                          side="left"
                          alignOffset={0}
                          sideOffset={8}
                          className="min-w-auto !p-0 font-inter rounded-2xl !border-zinc-200 shadow-none flex flex-row"
                        >
                          <div className="grid grid-cols-1 gap-1justify-start items-center py-1 px-1">
                            <button
                              onClick={() => {
                                setActualMenusOpen([]);

                                if (!instance || !node) {
                                  return;
                                }

                                const templateHandler =
                                  instance?.getNodeHandler<ImageTemplateNode>(
                                    "image-template",
                                  );

                                if (!templateHandler) {
                                  return;
                                }

                                const nodeInstance = instance
                                  .getStage()
                                  .findOne(`#${node?.key ?? ""}`);

                                if (!nodeInstance) {
                                  return;
                                }

                                templateHandler.changeFit(
                                  nodeInstance as WeaveElementInstance,
                                  IMAGE_TEMPLATE_FIT.FILL,
                                );
                              }}
                              className={cn(
                                "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-t-lg",
                                {
                                  ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                    imageTemplateFit ===
                                    IMAGE_TEMPLATE_FIT.FILL,
                                },
                              )}
                            >
                              Fill
                            </button>
                            <button
                              onClick={() => {
                                setActualMenusOpen([]);

                                if (!instance || !node) {
                                  return;
                                }

                                const templateHandler =
                                  instance?.getNodeHandler<ImageTemplateNode>(
                                    "image-template",
                                  );

                                if (!templateHandler) {
                                  return;
                                }

                                const nodeInstance = instance
                                  .getStage()
                                  .findOne(`#${node?.key ?? ""}`);

                                if (!nodeInstance) {
                                  return;
                                }

                                templateHandler.changeFit(
                                  nodeInstance as WeaveElementInstance,
                                  IMAGE_TEMPLATE_FIT.CONTAIN,
                                );
                              }}
                              className={cn(
                                "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                                {
                                  ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                    imageTemplateFit ===
                                    IMAGE_TEMPLATE_FIT.CONTAIN,
                                },
                              )}
                            >
                              Contain
                            </button>
                            <button
                              onClick={() => {
                                setActualMenusOpen([]);

                                if (!instance || !node) {
                                  return;
                                }

                                const templateHandler =
                                  instance?.getNodeHandler<ImageTemplateNode>(
                                    "image-template",
                                  );

                                if (!templateHandler) {
                                  return;
                                }

                                const nodeInstance = instance
                                  .getStage()
                                  .findOne(`#${node?.key ?? ""}`);

                                if (!nodeInstance) {
                                  return;
                                }

                                templateHandler.changeFit(
                                  nodeInstance as WeaveElementInstance,
                                  IMAGE_TEMPLATE_FIT.COVER,
                                );
                              }}
                              className={cn(
                                "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                                {
                                  ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                    imageTemplateFit ===
                                    IMAGE_TEMPLATE_FIT.COVER,
                                },
                              )}
                            >
                              Cover
                            </button>
                            <button
                              onClick={() => {
                                setActualMenusOpen([]);

                                if (!instance || !node) {
                                  return;
                                }

                                const templateHandler =
                                  instance?.getNodeHandler<ImageTemplateNode>(
                                    "image-template",
                                  );

                                if (!templateHandler) {
                                  return;
                                }

                                const nodeInstance = instance
                                  .getStage()
                                  .findOne(`#${node?.key ?? ""}`);

                                if (!nodeInstance) {
                                  return;
                                }

                                templateHandler.changeFit(
                                  nodeInstance as WeaveElementInstance,
                                  IMAGE_TEMPLATE_FIT.FREE,
                                );
                              }}
                              className={cn(
                                "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-b-lg",
                                {
                                  ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                    imageTemplateFit ===
                                    IMAGE_TEMPLATE_FIT.FREE,
                                },
                              )}
                            >
                              Free
                            </button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ToolbarButton
                        className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                        icon={
                          <Unlink className="px-0" size={20} strokeWidth={1} />
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={async () => {
                          if (!instance) {
                            return;
                          }

                          const handler =
                            instance.getNodeHandler<ImageTemplateNode>(
                              "image-template",
                            );

                          const stage = instance.getStage();
                          const nodeInstance = stage.findOne(
                            `#${actualNode?.key ?? ""}`,
                          );

                          if (!handler || !nodeInstance) {
                            return;
                          }

                          handler.unlink(nodeInstance as WeaveElementInstance);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>unlink image</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="center"
                      />
                    </>
                  )}
                </>
              )}
              {isImage && (
                <>
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={
                      <Paperclip className="px-0" size={20} strokeWidth={1} />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={async () => {
                      if (!instance) {
                        return;
                      }

                      const id = toast.loading("Generating attachment...");

                      const selectionImage = (await instance.exportNodes(
                        nodes.map((n) => n.instance),
                        (nodes: Konva.Node[]) => nodes,
                        {
                          format: "image/png",
                          padding: 0,
                          backgroundColor: "transparent",
                          pixelRatio: 1,
                        },
                        WEAVE_EXPORT_RETURN_FORMAT.BLOB,
                      )) as Blob;

                      const file = new File([selectionImage], "image.png", {
                        type: "image/png",
                      });

                      promptInputAttachmentsController.add([file]);

                      toast.dismiss(id);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Set as prompt attachment</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={<Link className="px-0" size={20} strokeWidth={1} />}
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={async () => {
                      if (!instance) {
                        return;
                      }

                      const stage = instance.getStage();
                      const nodeInstance = stage.findOne(
                        `#${actualNode?.key ?? ""}`,
                      );

                      setLinkedNode(nodeInstance || null);
                      toast.success("Image set as template link.");
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Set as template link</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                  <ToolbarDivider orientation="vertical" />
                  {workloadsEnabled && (
                    <>
                      <DropdownMenu
                        modal={false}
                        open={actualMenusOpen.includes("image-manipulation")}
                      >
                        <DropdownMenuTrigger
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          className={cn(
                            "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                            {
                              ["disabled:cursor-default disabled:opacity-50"]:
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                            },
                          )}
                          asChild
                        >
                          <ToolbarButton
                            className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                            icon={
                              <Settings
                                className="px-0"
                                size={20}
                                strokeWidth={1}
                              />
                            }
                            disabled={
                              weaveConnectionStatus !==
                              WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                            }
                            active={actualMenusOpen.includes(
                              "image-manipulation",
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              setActualMenusOpen((prev) =>
                                prev.length > 0 ? [] : ["image-manipulation"],
                              );
                            }}
                            label={
                              <div className="flex gap-3 justify-start items-center">
                                <p>Image manipulation</p>
                              </div>
                            }
                            tooltipSide="bottom"
                            tooltipAlign="center"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          onCloseAutoFocus={(e) => {
                            e.preventDefault();
                          }}
                          align="center"
                          side="top"
                          alignOffset={-4}
                          sideOffset={8}
                          className="min-w-auto !p-0 font-inter rounded-none drop-shadow !border-zinc-200 shadow-none flex flex-row"
                        >
                          <div className="flex gap-0 justify-center items-center py-1 px-1">
                            <ToolbarButton
                              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                              icon={
                                <BrushCleaning
                                  className="px-0"
                                  size={20}
                                  strokeWidth={1}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              onClick={async () => {
                                setActualMenusOpen([]);

                                if (!instance) {
                                  return;
                                }

                                const nodeImage = nodes[0].instance as
                                  | Konva.Group
                                  | undefined;

                                if (nodeImage) {
                                  nodeImage.closeCrop(
                                    WEAVE_IMAGE_CROP_END_TYPE.CANCEL,
                                  );

                                  try {
                                    if (
                                      viewType === "floating" &&
                                      !showRightSidebarFloating
                                    ) {
                                      setShowRightSidebarFloating(true);
                                    }

                                    sidebarToggle(SIDEBAR_ELEMENTS.images);

                                    const toastId = toast.loading(
                                      "Requesting image background removal operation...",
                                      {
                                        duration: Infinity,
                                      },
                                    );

                                    const url = (await instance.exportNodes(
                                      nodes.map((n) => n.instance),
                                      (nodes: Konva.Node[]) => nodes,
                                      {
                                        format: "image/png",
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        pixelRatio: 1,
                                      },
                                      WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
                                    )) as string;

                                    const dataBase64 = url.split(",")[1];

                                    mutationRemoveBackground.mutate(
                                      {
                                        userId: session?.user.id ?? "",
                                        clientId: clientId ?? "",
                                        imageId: uuidv4(),
                                        image: {
                                          dataBase64,
                                          contentType: "image/png",
                                        },
                                      },
                                      {
                                        onError: () => {
                                          toast.error(
                                            "Error requesting image background removal.",
                                          );
                                        },
                                        onSettled: () => {
                                          toast.dismiss(toastId);
                                        },
                                      },
                                    );
                                  } catch (error) {
                                    console.error(error);
                                    toast.error(
                                      "Error transforming the image.",
                                    );
                                  }
                                }
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Remove background</p>
                                </div>
                              }
                              tooltipSide="top"
                              tooltipAlign="center"
                            />
                            <ToolbarButton
                              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                              icon={
                                <Minus
                                  className="px-0"
                                  size={20}
                                  strokeWidth={1}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              onClick={async () => {
                                setActualMenusOpen([]);

                                if (!instance) {
                                  return;
                                }

                                const nodeImage = nodes[0].instance as
                                  | Konva.Group
                                  | undefined;

                                if (nodeImage) {
                                  nodeImage.closeCrop(
                                    WEAVE_IMAGE_CROP_END_TYPE.CANCEL,
                                  );

                                  try {
                                    if (
                                      viewType === "floating" &&
                                      !showRightSidebarFloating
                                    ) {
                                      setShowRightSidebarFloating(true);
                                    }

                                    sidebarToggle(SIDEBAR_ELEMENTS.images);

                                    const toastId = toast.loading(
                                      "Requesting image negation operation...",
                                      {
                                        duration: Infinity,
                                      },
                                    );

                                    const url = (await instance.exportNodes(
                                      nodes.map((n) => n.instance),
                                      (nodes: Konva.Node[]) => nodes,
                                      {
                                        format: "image/png",
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        pixelRatio: 1,
                                      },
                                      WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
                                    )) as string;

                                    const dataBase64 = url.split(",")[1];

                                    mutationNegate.mutate(
                                      {
                                        userId: session?.user.id ?? "",
                                        clientId: clientId ?? "",
                                        imageId: uuidv4(),
                                        image: {
                                          dataBase64,
                                          contentType: "image/png",
                                        },
                                      },
                                      {
                                        onError: () => {
                                          toast.error(
                                            "Error requesting image negation.",
                                          );
                                        },
                                        onSettled: () => {
                                          toast.dismiss(toastId);
                                        },
                                      },
                                    );
                                  } catch (error) {
                                    console.error(error);
                                    toast.error(
                                      "Error transforming the image.",
                                    );
                                  }
                                }
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Negate</p>
                                </div>
                              }
                              tooltipSide="top"
                              tooltipAlign="center"
                            />
                            <ToolbarButton
                              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                              icon={
                                <FlipHorizontal
                                  className="px-0"
                                  size={20}
                                  strokeWidth={1}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              onClick={async () => {
                                setActualMenusOpen([]);

                                if (!instance) {
                                  return;
                                }

                                const nodeImage = nodes[0].instance as
                                  | Konva.Group
                                  | undefined;

                                if (nodeImage) {
                                  nodeImage.closeCrop(
                                    WEAVE_IMAGE_CROP_END_TYPE.CANCEL,
                                  );

                                  try {
                                    if (
                                      viewType === "floating" &&
                                      !showRightSidebarFloating
                                    ) {
                                      setShowRightSidebarFloating(true);
                                    }

                                    sidebarToggle(SIDEBAR_ELEMENTS.images);

                                    const toastId = toast.loading(
                                      "Requesting image horizontal flip operation...",
                                      {
                                        duration: Infinity,
                                      },
                                    );

                                    const url = (await instance.exportNodes(
                                      nodes.map((n) => n.instance),
                                      (nodes: Konva.Node[]) => nodes,
                                      {
                                        format: "image/png",
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        pixelRatio: 1,
                                      },
                                      WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
                                    )) as string;

                                    const dataBase64 = url.split(",")[1];

                                    mutationFlip.mutate(
                                      {
                                        userId: session?.user.id ?? "",
                                        clientId: clientId ?? "",
                                        imageId: uuidv4(),
                                        orientation: "horizontal",
                                        image: {
                                          dataBase64,
                                          contentType: "image/png",
                                        },
                                      },
                                      {
                                        onError: () => {
                                          toast.error(
                                            "Error requesting image horizontal flip",
                                          );
                                        },
                                        onSettled: () => {
                                          toast.dismiss(toastId);
                                        },
                                      },
                                    );
                                  } catch (error) {
                                    console.error(error);
                                    toast.error(
                                      "Error transforming the image.",
                                    );
                                  }
                                }
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Flip horizontally</p>
                                </div>
                              }
                              tooltipSide="top"
                              tooltipAlign="center"
                            />
                            <ToolbarButton
                              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                              icon={
                                <FlipVertical
                                  className="px-0"
                                  size={20}
                                  strokeWidth={1}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              onClick={async () => {
                                setActualMenusOpen([]);

                                if (!instance) {
                                  return;
                                }

                                const nodeImage = nodes[0].instance as
                                  | Konva.Group
                                  | undefined;

                                if (nodeImage) {
                                  nodeImage.closeCrop(
                                    WEAVE_IMAGE_CROP_END_TYPE.CANCEL,
                                  );

                                  try {
                                    if (
                                      viewType === "floating" &&
                                      !showRightSidebarFloating
                                    ) {
                                      setShowRightSidebarFloating(true);
                                    }

                                    sidebarToggle(SIDEBAR_ELEMENTS.images);

                                    const toastId = toast.loading(
                                      "Requesting image vertical flip operation...",
                                      {
                                        duration: Infinity,
                                      },
                                    );

                                    const url = (await instance.exportNodes(
                                      nodes.map((n) => n.instance),
                                      (nodes: Konva.Node[]) => nodes,
                                      {
                                        format: "image/png",
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        pixelRatio: 1,
                                      },
                                      WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
                                    )) as string;

                                    const dataBase64 = url.split(",")[1];

                                    mutationFlip.mutate(
                                      {
                                        userId: session?.user.id ?? "",
                                        clientId: clientId ?? "",
                                        imageId: uuidv4(),
                                        orientation: "vertical",
                                        image: {
                                          dataBase64,
                                          contentType: "image/png",
                                        },
                                      },
                                      {
                                        onError: () => {
                                          toast.error(
                                            "Error requesting image vertical flip.",
                                          );
                                        },
                                        onSettled: () => {
                                          toast.dismiss(toastId);
                                        },
                                      },
                                    );
                                  } catch (error) {
                                    console.error(error);
                                    toast.error(
                                      "Error transforming the image.",
                                    );
                                  }
                                }
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Flip vertically</p>
                                </div>
                              }
                              tooltipSide="top"
                              tooltipAlign="center"
                            />
                            <ToolbarButton
                              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                              icon={
                                <PaintRoller
                                  className="px-0"
                                  size={20}
                                  strokeWidth={1}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              onClick={async () => {
                                setActualMenusOpen([]);

                                if (!instance) {
                                  return;
                                }

                                const nodeImage = nodes[0].instance as
                                  | Konva.Group
                                  | undefined;

                                if (nodeImage) {
                                  nodeImage.closeCrop(
                                    WEAVE_IMAGE_CROP_END_TYPE.CANCEL,
                                  );

                                  try {
                                    if (
                                      viewType === "floating" &&
                                      !showRightSidebarFloating
                                    ) {
                                      setShowRightSidebarFloating(true);
                                    }

                                    sidebarToggle(SIDEBAR_ELEMENTS.images);

                                    const toastId = toast.loading(
                                      "Requesting image grayscale operation...",
                                      {
                                        duration: Infinity,
                                      },
                                    );

                                    const url = (await instance.exportNodes(
                                      nodes.map((n) => n.instance),
                                      (nodes: Konva.Node[]) => nodes,
                                      {
                                        format: "image/png",
                                        padding: 0,
                                        backgroundColor: "#ffffff",
                                        pixelRatio: 1,
                                      },
                                      WEAVE_EXPORT_RETURN_FORMAT.DATA_URL,
                                    )) as string;

                                    const dataBase64 = url.split(",")[1];

                                    mutationGrayscale.mutate(
                                      {
                                        userId: session?.user.id ?? "",
                                        clientId: clientId ?? "",
                                        imageId: uuidv4(),
                                        image: {
                                          dataBase64,
                                          contentType: "image/png",
                                        },
                                      },
                                      {
                                        onError: () => {
                                          toast.error(
                                            "Error requesting image grayscale.",
                                          );
                                        },
                                        onSettled: () => {
                                          toast.dismiss(toastId);
                                        },
                                      },
                                    );
                                  } catch (error) {
                                    console.error(error);
                                    toast.error(
                                      "Error transforming the image.",
                                    );
                                  }
                                }
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Graycale</p>
                                </div>
                              }
                              tooltipSide="top"
                              tooltipAlign="center"
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ToolbarDivider orientation="vertical" />
                    </>
                  )}
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={<Crop className="px-0" size={20} strokeWidth={1} />}
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={() => {
                      if (!instance || !node) {
                        return;
                      }

                      const nodeInstance = instance
                        .getStage()
                        .findOne(`#${node.key}`) as Konva.Group | undefined;

                      if (nodeInstance) {
                        nodeInstance.triggerCrop();
                      }
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Crop</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={
                      <RotateCcw className="px-0" size={20} strokeWidth={1} />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={() => {
                      if (!instance || !node) {
                        return;
                      }

                      const nodeInstance = instance
                        .getStage()
                        .findOne(`#${node.key}`) as Konva.Group | undefined;

                      if (nodeInstance) {
                        nodeInstance.resetCrop();
                      }
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Reset crop</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                </>
              )}
              {isMultiNodesSelected && (
                <>
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={
                      <WandSparkles
                        className="px-0"
                        size={20}
                        strokeWidth={1}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={async () => {
                      if (!instance || !sendMessage) {
                        return;
                      }

                      const id = toast.loading("Processing...");

                      const blob = (await instance.exportNodes(
                        nodes.map((n) => n.instance),
                        (nodes: Konva.Node[]) => nodes,
                        {
                          format: "image/png",
                          padding: 0,
                          backgroundColor: "#ffffff",
                          pixelRatio: 1,
                        },
                        WEAVE_EXPORT_RETURN_FORMAT.BLOB,
                      )) as Blob;

                      const file = new File([blob], "selection.png", {
                        type: "image/png",
                      });
                      const dataURL = await fileToDataURL(file);

                      // promptInputAttachmentsController.add([file]);

                      sendMessage(
                        {
                          text: "Follow the instructions on the image and generate the result, don't change anything else.",
                          files: [
                            {
                              type: "file",
                              mediaType: "image/png",
                              filename: "selection.png",
                              url: dataURL,
                            },
                          ],
                        },
                        {
                          body: {
                            imageOption: {
                              model: imageModel,
                              samples: imageSamples,
                              aspectRatio: imageAspectRatio,
                              quality: imageQuality,
                              size: imageSize,
                            },
                          },
                        },
                      );
                      setAiView("chat");
                      setSidebarActive(SIDEBAR_ELEMENTS.aiChat);

                      toast.dismiss(id);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Magic image</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                  <ToolbarDivider orientation="vertical" />
                  <DropdownMenu
                    modal={false}
                    open={actualMenusOpen.includes("nodesAlignmentHorizontal")}
                  >
                    <DropdownMenuTrigger
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      className={cn(
                        "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                        {
                          ["disabled:cursor-default disabled:opacity-50"]:
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                        },
                      )}
                      asChild
                    >
                      <ToolbarButton
                        className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                        icon={
                          <UnfoldHorizontal
                            className="px-0"
                            size={20}
                            strokeWidth={1}
                          />
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        active={actualMenusOpen.includes(
                          "nodesAlignmentHorizontal",
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          setActualMenusOpen(["nodesAlignmentHorizontal"]);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>Align Horizontal</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="center"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                      }}
                      align="start"
                      side="left"
                      alignOffset={-4}
                      sideOffset={8}
                      className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-none"
                    >
                      <div className="flex gap-1">
                        <ToolbarButton
                          className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                          icon={
                            <AlignHorizontalJustifyStart
                              className="px-0"
                              size={20}
                              strokeWidth={1}
                            />
                          }
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          onClick={() => {
                            setActualMenusOpen([]);

                            if (!instance) {
                              return;
                            }

                            instance.triggerAction<
                              WeaveAlignNodesToolActionTriggerParams,
                              void
                            >("alignNodesTool", {
                              alignTo: "left-horizontal",
                            });
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Align to left</p>
                            </div>
                          }
                          tooltipSide="top"
                          tooltipAlign="end"
                        />
                        <ToolbarButton
                          className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                          icon={
                            <AlignHorizontalJustifyCenter
                              className="px-0"
                              size={20}
                              strokeWidth={1}
                            />
                          }
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          onClick={() => {
                            setActualMenusOpen([]);

                            if (!instance) {
                              return;
                            }

                            instance.triggerAction<
                              WeaveAlignNodesToolActionTriggerParams,
                              void
                            >("alignNodesTool", {
                              alignTo: "right-horizontal",
                            });
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Align center</p>
                            </div>
                          }
                          tooltipSide="top"
                          tooltipAlign="end"
                        />
                        <ToolbarButton
                          className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                          icon={
                            <AlignHorizontalJustifyEnd
                              className="px-0"
                              size={20}
                              strokeWidth={1}
                            />
                          }
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          onClick={() => {
                            setActualMenusOpen([]);

                            if (!instance) {
                              return;
                            }

                            instance.triggerAction<
                              WeaveAlignNodesToolActionTriggerParams,
                              void
                            >("alignNodesTool", {
                              alignTo: "right-horizontal",
                            });
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Align end</p>
                            </div>
                          }
                          tooltipSide="top"
                          tooltipAlign="end"
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu
                    modal={false}
                    open={actualMenusOpen.includes("nodesAlignmentVertical")}
                  >
                    <DropdownMenuTrigger
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      className={cn(
                        "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                        {
                          ["disabled:cursor-default disabled:opacity-50"]:
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                        },
                      )}
                      asChild
                    >
                      <ToolbarButton
                        className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                        icon={
                          <UnfoldVertical
                            className="px-0"
                            size={20}
                            strokeWidth={1}
                          />
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        active={actualMenusOpen.includes(
                          "nodesAlignmentVertical",
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          setActualMenusOpen(["nodesAlignmentVertical"]);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>Align Vertical</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="center"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                      }}
                      align="start"
                      side="left"
                      alignOffset={-4}
                      sideOffset={8}
                      className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-none"
                    >
                      <div className="flex gap-1">
                        <ToolbarButton
                          className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                          icon={
                            <AlignVerticalJustifyStart
                              className="px-0"
                              size={20}
                              strokeWidth={1}
                            />
                          }
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          onClick={() => {
                            setActualMenusOpen([]);

                            if (!instance) {
                              return;
                            }

                            instance.triggerAction<
                              WeaveAlignNodesToolActionTriggerParams,
                              void
                            >("alignNodesTool", {
                              alignTo: "top-vertical",
                            });
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Align to left</p>
                            </div>
                          }
                          tooltipSide="top"
                          tooltipAlign="end"
                        />
                        <ToolbarButton
                          className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                          icon={
                            <AlignVerticalJustifyCenter
                              className="px-0"
                              size={20}
                              strokeWidth={1}
                            />
                          }
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          onClick={() => {
                            setActualMenusOpen([]);

                            if (!instance) {
                              return;
                            }

                            instance.triggerAction<
                              WeaveAlignNodesToolActionTriggerParams,
                              void
                            >("alignNodesTool", {
                              alignTo: "center-vertical",
                            });
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Align center</p>
                            </div>
                          }
                          tooltipSide="top"
                          tooltipAlign="end"
                        />
                        <ToolbarButton
                          className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                          icon={
                            <AlignVerticalJustifyEnd
                              className="px-0"
                              size={20}
                              strokeWidth={1}
                            />
                          }
                          disabled={
                            weaveConnectionStatus !==
                            WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                          }
                          onClick={() => {
                            setActualMenusOpen([]);

                            if (!instance) {
                              return;
                            }

                            instance.triggerAction<
                              WeaveAlignNodesToolActionTriggerParams,
                              void
                            >("alignNodesTool", {
                              alignTo: "bottom-vertical",
                            });
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Align end</p>
                            </div>
                          }
                          tooltipSide="top"
                          tooltipAlign="end"
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              {isTextNode &&
                actualNode?.props.layout === TEXT_LAYOUT.SMART &&
                ((actualNode?.props.smartFixedWidth ?? false) ||
                  (actualNode?.props.smartFixedHeight ?? false)) && (
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={
                      <RotateCcw className="px-0" size={20} strokeWidth={1} />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    onClick={() => {
                      setActualMenusOpen([]);

                      if (!instance) {
                        return;
                      }

                      const nodeHandler =
                        instance.getNodeHandler<WeaveTextNode>("text");

                      if (!nodeHandler) {
                        return;
                      }

                      const stage = instance.getStage();
                      const nodeInstance = stage.findOne(
                        `#${actualNode?.key ?? ""}`,
                      );

                      if (!nodeInstance) {
                        return;
                      }

                      nodeHandler.resetSmartLayout(nodeInstance as Konva.Text);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Reset</p>
                      </div>
                    }
                    tooltipSide="top"
                    tooltipAlign="center"
                  />
                )}
            </div>
          </div>
        )}
      </div>
      <div
        className={cn(
          "pointer-events-none px-0 py-0 flex gap-[16px] justify-center items-center",
          {
            ["absolute left-[8px] top-[8px] right-[8px] "]:
              breakpoint !== "2xl",
            ["block"]: breakpoint === "2xl",
          },
        )}
      >
        <div className="flex gap-0 justify-center items-center bg-white border rounded-none border-zinc-200 drop-shadow">
          <div className="flex gap-[2px] h-[40px] justify-end items-center px-1 my-1">
            {!["measure"].includes(actualNode?.type as string) && (
              <DropdownMenu
                modal={false}
                open={actualMenusOpen.includes("layering")}
              >
                <DropdownMenuTrigger
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  className={cn(
                    "relative rounded-none cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                    {
                      ["disabled:cursor-default disabled:opacity-50"]:
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                    },
                  )}
                  asChild
                >
                  <ToolbarButton
                    className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                    icon={<Layers className="px-0" size={20} strokeWidth={1} />}
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={actualMenusOpen.includes("layering")}
                    onClick={(e) => {
                      e.preventDefault();
                      setActualMenusOpen((prev) =>
                        prev.length > 0 ? [] : ["layering"],
                      );
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Layering</p>
                      </div>
                    }
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onCloseAutoFocus={(e) => {
                    e.preventDefault();
                  }}
                  align="start"
                  side="bottom"
                  alignOffset={-4}
                  sideOffset={8}
                  className="min-w-auto !p-0 font-inter rounded-none drop-shadow !border-zinc-200 shadow-none flex flex-row"
                >
                  <div className="flex gap-0 justify-center items-center py-1 px-1">
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={
                        <BringToFront
                          className="px-0"
                          size={20}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!instance) {
                          return;
                        }

                        const nodeInstance = instance
                          .getStage()
                          .findOne(`#${node?.key}`);

                        if (!nodeInstance) {
                          return;
                        }

                        instance.bringToFront(
                          nodeInstance as WeaveElementInstance,
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Bring to front</p>
                          <ShortcutElement
                            shortcuts={{
                              [SYSTEM_OS.MAC]: "]",
                              [SYSTEM_OS.OTHER]: "]",
                            }}
                          />
                        </div>
                      }
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={
                        <ArrowUp className="px-0" size={20} strokeWidth={1} />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!instance) {
                          return;
                        }

                        const nodeInstance = instance
                          .getStage()
                          .findOne(`#${node?.key}`);

                        if (!nodeInstance) {
                          return;
                        }

                        instance.moveUp(nodeInstance as WeaveElementInstance);
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Move up</p>
                          <ShortcutElement
                            shortcuts={{
                              [SYSTEM_OS.MAC]: "⌘ ]",
                              [SYSTEM_OS.OTHER]: "Ctrl ]",
                            }}
                          />
                        </div>
                      }
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={
                        <ArrowDown className="px-0" size={20} strokeWidth={1} />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!instance) {
                          return;
                        }

                        const nodeInstance = instance
                          .getStage()
                          .findOne(`#${node?.key}`);

                        if (!nodeInstance) {
                          return;
                        }

                        instance.moveDown(nodeInstance as WeaveElementInstance);
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Move down</p>
                          <ShortcutElement
                            shortcuts={{
                              [SYSTEM_OS.MAC]: "⌘ [",
                              [SYSTEM_OS.OTHER]: "Ctrl [",
                            }}
                          />
                        </div>
                      }
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                      icon={
                        <SendToBack
                          className="px-0"
                          size={20}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!instance) {
                          return;
                        }

                        const nodeInstance = instance
                          .getStage()
                          .findOne(`#${node?.key}`);

                        if (!nodeInstance) {
                          return;
                        }

                        instance.sendToBack(
                          nodeInstance as WeaveElementInstance,
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Move down</p>
                          <ShortcutElement
                            shortcuts={{
                              [SYSTEM_OS.MAC]: "[",
                              [SYSTEM_OS.OTHER]: "[",
                            }}
                          />
                        </div>
                      }
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ToolbarDivider orientation="vertical" />
            {isMultiNodesSelected && (
              <ToolbarButton
                className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                icon={<Group className="px-0" size={20} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={async () => {
                  if (!instance) {
                    return;
                  }

                  instance.group(
                    nodes
                      .map((n) => n?.node)
                      .filter((node) => typeof node !== "undefined"),
                  );
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Group</p>
                    <ShortcutElement
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⇧ ⌘ G",
                        [SYSTEM_OS.OTHER]: "⇧ Ctrl G",
                      }}
                    />
                  </div>
                }
                tooltipSide="bottom"
                tooltipAlign="center"
              />
            )}
            {isGroup && (
              <ToolbarButton
                className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
                icon={<Ungroup className="px-0" size={20} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                onClick={async () => {
                  if (!instance) {
                    return;
                  }

                  if (nodes[0].node) {
                    instance.unGroup(nodes[0].node);
                  }
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Un-group</p>
                    <ShortcutElement
                      shortcuts={{
                        [SYSTEM_OS.MAC]: "⇧ ⌘ U",
                        [SYSTEM_OS.OTHER]: "⇧ Ctrl U",
                      }}
                    />
                  </div>
                }
                tooltipSide="bottom"
                tooltipAlign="center"
              />
            )}
            <ToolbarButton
              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
              icon={<Lock className="px-0" size={20} strokeWidth={1} />}
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              onClick={() => {
                setActualMenusOpen([]);

                if (!instance) {
                  return;
                }

                const nodeInstance = instance
                  .getStage()
                  .findOne(`#${node?.key}`);

                if (!nodeInstance) {
                  return;
                }

                if (isSingleNodeSelected) {
                  instance.lockNode(nodeInstance as WeaveElementInstance);
                }
                if (isMultiNodesSelected) {
                  for (const node of nodes) {
                    const isLocked = instance.allNodesLocked([node.instance]);

                    if (!isLocked) {
                      instance.lockNode(node.instance);
                      continue;
                    }
                    if (isLocked) {
                      instance.unlockNode(node.instance);
                    }
                  }
                }
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Lock</p>
                </div>
              }
              tooltipSide="bottom"
              tooltipAlign="center"
            />
            <ToolbarButton
              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
              icon={<EyeOff className="px-0" size={20} strokeWidth={1} />}
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              onClick={() => {
                setActualMenusOpen([]);

                if (!instance) {
                  return;
                }

                if (isSingleNodeSelected) {
                  const nodeInstance = instance
                    .getStage()
                    .findOne(`#${node?.key}`);

                  if (!nodeInstance) {
                    return;
                  }

                  instance.hideNode(nodeInstance as WeaveElementInstance);
                }
                if (isMultiNodesSelected) {
                  for (const node of nodes) {
                    const isVisible = instance.allNodesVisible([node.instance]);

                    if (!isVisible) {
                      instance.showNode(node.instance);
                      continue;
                    }
                    if (isVisible) {
                      instance.hideNode(node.instance);
                    }
                  }
                }
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Hide</p>
                </div>
              }
              tooltipSide="bottom"
              tooltipAlign="center"
            />
            <ToolbarButton
              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
              icon={<Copy className="px-0" size={20} strokeWidth={1} />}
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              onClick={async () => {
                setActualMenusOpen([]);

                if (!instance) {
                  return;
                }

                const weaveCopyPasteNodesPlugin =
                  instance.getPlugin<WeaveCopyPasteNodesPlugin>(
                    "copyPasteNodes",
                  );
                if (weaveCopyPasteNodesPlugin) {
                  await weaveCopyPasteNodesPlugin.copy();
                }
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Copy</p>
                  <ShortcutElement
                    shortcuts={{
                      [SYSTEM_OS.MAC]: "⌘ C",
                      [SYSTEM_OS.OTHER]: "Ctrl C",
                    }}
                  />
                </div>
              }
              tooltipSide="bottom"
              tooltipAlign="center"
            />
            <ToolbarButton
              className="rounded-none !min-w-[40px] !w-[40px] !h-[40px]"
              icon={<Trash className="px-0" size={20} strokeWidth={1} />}
              disabled={
                weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
              }
              onClick={() => {
                setActualMenusOpen([]);

                if (!instance) {
                  return;
                }

                if (actualNode) {
                  instance.removeNode(actualNode);
                  return;
                }

                if (!actualNode && nodes.length > 1) {
                  for (const node of nodes) {
                    if (node.node) {
                      instance.removeNode(node.node);
                    }
                  }
                }
              }}
              label={
                <div className="flex gap-3 justify-start items-center">
                  <p>Remove</p>
                  <ShortcutElement
                    shortcuts={{
                      [SYSTEM_OS.MAC]: "Del",
                      [SYSTEM_OS.OTHER]: "Del",
                    }}
                  />
                </div>
              }
              tooltipSide="bottom"
              tooltipAlign="center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
