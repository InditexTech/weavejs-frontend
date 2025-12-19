// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useWeave } from "@inditextech/weave-react";
import React from "react";
import Konva from "konva";
import {
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveElementInstance,
  WeaveStateElement,
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
  X,
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
  Settings,
  Paintbrush,
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
  RectangleCircle,
  Unlink,
  Link,
  ImageUpscale,
  WandSparkles,
  FlipVertical2,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Spline,
  Ruler,
} from "lucide-react";
import { ShortcutElement } from "../help/shortcut-element";
import { cn, SYSTEM_OS } from "@/lib/utils";
import {
  WEAVE_IMAGE_CROP_END_TYPE,
  WeaveCopyPasteNodesPlugin,
  WeaveAlignNodesToolActionTriggerParams,
  WeaveVideoNode,
  WeaveMeasureNode,
  WEAVE_CONNECTOR_NODE_LINE_TYPE,
  WeaveConnectorNode,
  WEAVE_CONNECTOR_NODE_LINE_ORIGIN,
  WEAVE_CONNECTOR_NODE_DECORATOR_TYPE,
} from "@inditextech/weave-sdk";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ColorPickerInput } from "../inputs/color-picker";
import { Button } from "@/components/ui/button";
import { fileToDataURL, getImageBase64 } from "@/components/utils/images";
import { postNegateImage } from "@/api/post-negate-image";
import { postFlipImage } from "@/api/post-flip-image";
import { postGrayscaleImage } from "@/api/post-grayscale-image";
import { merge } from "lodash";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { IMAGE_TEMPLATE_FIT } from "@/components/nodes/image-template/constants";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";
import { useIAChat } from "@/store/ia-chat";
import { useNodeActionName } from "./hooks/use-node-action-name";

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

  const user = useCollaborationRoom((state) => state.user);
  const clientId = useCollaborationRoom((state) => state.clientId);
  const room = useCollaborationRoom((state) => state.room);
  const nodePropertiesAction: "create" | "update" | undefined =
    useCollaborationRoom((state) => state.nodeProperties.action);
  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const setTransformingImage = useCollaborationRoom(
    (state) => state.setTransformingImage
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
  );
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled
  );
  const setReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.setReferenceMeasurePixels
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

  const updateElement = React.useCallback(
    (updatedNode: WeaveStateElement) => {
      if (!instance) return;
      if (actualAction && nodePropertiesAction === "create") {
        instance.updatePropsAction(actualAction, updatedNode.props);
      }
      if (nodePropertiesAction === "update") {
        instance.updateNode(updatedNode);
      }
    },
    [instance, actualAction, nodePropertiesAction]
  );

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
      handleOnEnterTextEditMode
    );
    instance.addEventListener(
      "onExitTextNodeEditMode",
      handleOnExitTextEditMode
    );

    return () => {
      instance.removeEventListener(
        "onEnterTextNodeEditMode",
        handleOnEnterTextEditMode
      );
      instance.removeEventListener(
        "onExitTextNodeEditMode",
        handleOnExitTextEditMode
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
      handleImageTemplateLocked
    );

    return () => {
      instance.removeEventListener(
        "onImageTemplateFreed",
        handleImageTemplateFreed
      );
      instance.removeEventListener(
        "onImageTemplateLocked",
        handleImageTemplateLocked
      );
    };
  }, [instance, movingImageTemplate]);

  const title = useNodeActionName();

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
        image
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
        image
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
        image
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
        image
      );
    },
  });

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
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

  const nodeDashBackground = React.useMemo(() => {
    if (!actualNode) {
      return "transparent";
    }

    switch ((actualNode.props.dash ?? []).join(",")) {
      case "":
        return actualNode.props.stroke;
      case "4,2":
        return `repeating-linear-gradient(90deg, ${actualNode.props.stroke} 0px, ${actualNode.props.stroke} 2px, transparent 2px, transparent 4px)`;
      case "8,4":
        return `repeating-linear-gradient(90deg, ${actualNode.props.stroke} 0px, ${actualNode.props.stroke} 4px, transparent 4px, transparent 8px)`;

      default:
        break;
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
    [actualNode]
  );

  const isVideoNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "video",
    [actualNode]
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

  const isFrameNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "frame",
    [actualNode]
  );

  const isTextNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "text",
    [actualNode]
  );

  const isColorTokenNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "color-token",
    [actualNode]
  );

  const isMeasureNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "measure",
    [actualNode]
  );

  const isConnectorNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "connector",
    [actualNode]
  );

  const connectorNodeType = React.useMemo(() => {
    if (!isConnectorNode || !actualNode) {
      return undefined;
    }

    return actualNode.props.lineType;
  }, [isConnectorNode, actualNode]);

  const connectorStartDecoratorType = React.useMemo(() => {
    if (!isConnectorNode || !actualNode) {
      return undefined;
    }

    return actualNode.props.startNodeDecoratorType;
  }, [isConnectorNode, actualNode]);

  const connectorEndDecoratorType = React.useMemo(() => {
    if (!isConnectorNode || !actualNode) {
      return undefined;
    }

    return actualNode.props.endNodeDecoratorType;
  }, [isConnectorNode, actualNode]);

  const isImage = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "image",
    [actualNode]
  );

  const isImageTemplate = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "image-template",
    [actualNode]
  );

  const imageTemplateFit = React.useMemo(() => {
    if (!isImageTemplate || !actualNode) {
      return undefined;
    }

    return actualNode.props.fit;
  }, [isImageTemplate, actualNode]);

  const canSetNodeStyling = React.useMemo(() => {
    return (
      isSingleNodeSelected &&
      actualNode &&
      ![
        "mask",
        "measure",
        "fuzzy-mask",
        "image",
        "video",
        "color-token",
        "image-template",
      ].includes(actualNode.type as string)
    );
  }, [isSingleNodeSelected, actualNode]);

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
    <>
      <div className="pointer-events-none absolute px-0 py-0 top-[16px] right-[82px] flex flex-col gap-0 justify-center items-center bg-white px-3 py-2 text-lg font-inter font-light border border-r-0 border-[#c9c9c9]">
        {title.toUpperCase()}
      </div>
      <div className="pointer-events-none absolute px-0 py-0 top-[16px] bottom-[16px] right-[16px] flex flex-col gap-0 justify-start items-center">
        <div className="flex flex-col gap-0 justify-start items-center bg-white border rounded-none border-zinc-200">
          <div className="flex flex-col gap-[2px] justify-end items-center px-1 my-1">
            {!isGroup && isColorTokenNode && (
              <DropdownMenu
                modal={false}
                open={actualMenusOpen.includes("colorTokenColor")}
              >
                <DropdownMenuTrigger
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  className={cn(
                    "relative rounded-full cursor-pointer h-[32px] hover:text-[#666666] focus:outline-none",
                    {
                      ["disabled:cursor-default disabled:opacity-50"]:
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                    }
                  )}
                  asChild
                >
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
                    icon={
                      <div
                        className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                        style={{
                          background: actualNode?.props.colorToken,
                        }}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={actualMenusOpen.includes("nodeFill")}
                    onClick={(e) => {
                      e.preventDefault();
                      setActualMenusOpen((prev) =>
                        prev.length > 0 ? [] : ["colorTokenColor"]
                      );
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Color</p>
                      </div>
                    }
                    tooltipSide="left"
                    tooltipAlign="center"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="left"
                  alignOffset={0}
                  sideOffset={8}
                  className="min-w-auto font-inter rounded-none shadow-none flex flex-row"
                  asChild
                >
                  <div
                    className="flex !flex-col gap-0 w-[300px] p-4"
                    onClick={(e) => e.preventDefault()}
                  >
                    <ColorPickerInput
                      value={actualNode?.props.colorToken ?? "#ffffff"}
                      onChange={(color) => {
                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            colorToken: color,
                          },
                        };

                        updateElement(updatedNode);
                      }}
                    />
                    <Button
                      onClick={() => {
                        setActualMenusOpen([]);
                      }}
                      className="cursor-pointer font-inter font-light rounded-none w-full mt-1"
                    >
                      CLOSE
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isVideoNode && (
              <>
                {!isVideoPlaying && (
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
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
                    tooltipSide="left"
                    tooltipAlign="center"
                  />
                )}
                {isVideoPlaying && (
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
                    icon={<Pause className="px-0" size={20} strokeWidth={1} />}
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
                    tooltipSide="left"
                    tooltipAlign="center"
                  />
                )}
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
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
                  tooltipSide="left"
                  tooltipAlign="center"
                />
                <ToolbarDivider
                  orientation="horizontal"
                  className="!h-[28px]"
                />
              </>
            )}
            {isConnectorNode && (
              <>
                <DropdownMenu
                  modal={false}
                  open={actualMenusOpen.includes("connectorStartDecorator")}
                >
                  <DropdownMenuTrigger
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className={cn(
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
                      icon={
                        <ArrowLeftFromLine
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
                        "connectorStartDecorator"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        setActualMenusOpen((prev) =>
                          prev.length > 0 ? [] : ["connectorStartDecorator"]
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Connector start decorator</p>
                        </div>
                      }
                      tooltipSide="left"
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

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorDecorator(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_ORIGIN.START,
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-t-lg",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorStartDecoratorType ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE,
                          }
                        )}
                      >
                        None
                      </button>
                      <button
                        onClick={() => {
                          setActualMenusOpen([]);

                          if (!instance || !node) {
                            return;
                          }

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorDecorator(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_ORIGIN.START,
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorStartDecoratorType ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT,
                          }
                        )}
                      >
                        Dot
                      </button>
                      <button
                        onClick={() => {
                          setActualMenusOpen([]);

                          if (!instance || !node) {
                            return;
                          }

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorDecorator(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_ORIGIN.START,
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-b-lg",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorStartDecoratorType ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW,
                          }
                        )}
                      >
                        Arrow
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu
                  modal={false}
                  open={actualMenusOpen.includes("connectorStartDecoratorSize")}
                >
                  <DropdownMenuTrigger
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className={cn(
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
                      icon={
                        <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                          {(actualNode?.props?.["startNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE ||
                            typeof actualNode?.props?.[
                              "startNodeDecoratorType"
                            ] === "undefined") &&
                            "-"}
                          {actualNode?.props?.["startNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT &&
                            `${
                              actualNode?.props["startNodeDecorator-radius"] ??
                              "4"
                            }px`}
                          {actualNode?.props?.["startNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                            `${
                              actualNode?.props["startNodeDecorator-size"] ??
                              "10"
                            }px`}
                        </div>
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      active={actualMenusOpen.includes(
                        "connectorStartDecoratorSize"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          actualNode?.props?.["startNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE ||
                          typeof actualNode?.props?.[
                            "startNodeDecoratorType"
                          ] === "undefined"
                        ) {
                          return;
                        }
                        setActualMenusOpen((prev) =>
                          prev.length > 0 ? [] : ["connectorStartDecoratorSize"]
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Start decorator size</p>
                        </div>
                      }
                      tooltipSide="left"
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
                    className="min-w-auto font-inter shadow-none flex flex-row rounded-full rounded-x-none"
                  >
                    <div className="flex flex-row-reverse gap-1">
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
                        icon={
                          <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                            {actualNode?.props?.["startNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && "8px"}
                            {actualNode?.props?.["startNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                              "20px"}
                          </div>
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={() => {
                          if (!actualNode) {
                            return;
                          }

                          const updatedNode: WeaveStateElement = {
                            ...actualNode,
                            props: {
                              ...actualNode.props,
                              ...(actualNode?.props?.[
                                "startNodeDecoratorType"
                              ] === WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && {
                                ["startNodeDecorator-size"]: undefined,
                                ["startNodeDecorator-radius"]: 8,
                              }),
                              ...(actualNode?.props?.[
                                "startNodeDecoratorType"
                              ] ===
                                WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW && {
                                ["startNodeDecorator-radius"]: undefined,
                                ["startNodeDecorator-size"]: 20,
                              }),
                            },
                          };

                          updateElement(updatedNode);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>20px</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
                        icon={
                          <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                            {actualNode?.props?.["startNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && "4px"}
                            {actualNode?.props?.["startNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                              "10px"}
                          </div>
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={() => {
                          if (!actualNode) {
                            return;
                          }

                          const updatedNode: WeaveStateElement = {
                            ...actualNode,
                            props: {
                              ...actualNode.props,
                              ...(actualNode?.props?.[
                                "startNodeDecoratorType"
                              ] === WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && {
                                ["startNodeDecorator-size"]: undefined,
                                ["startNodeDecorator-radius"]: 4,
                              }),
                              ...(actualNode?.props?.[
                                "startNodeDecoratorType"
                              ] ===
                                WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW && {
                                ["startNodeDecorator-radius"]: undefined,
                                ["startNodeDecorator-size"]: 10,
                              }),
                            },
                          };

                          updateElement(updatedNode);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>10px</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
                        icon={
                          <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                            {actualNode?.props?.["startNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && "2px"}
                            {actualNode?.props?.["startNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                              "5px"}
                          </div>
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={() => {
                          if (!actualNode) {
                            return;
                          }

                          const updatedNode: WeaveStateElement = {
                            ...actualNode,
                            props: {
                              ...actualNode.props,
                              ...(actualNode?.props?.[
                                "startNodeDecoratorType"
                              ] === WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && {
                                ["startNodeDecorator-size"]: undefined,
                                ["startNodeDecorator-radius"]: 2,
                              }),
                              ...(actualNode?.props?.[
                                "startNodeDecoratorType"
                              ] ===
                                WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW && {
                                ["startNodeDecorator-radius"]: undefined,
                                ["startNodeDecorator-size"]: 5,
                              }),
                            },
                          };

                          updateElement(updatedNode);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>5px</p>
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
                  open={actualMenusOpen.includes("connectorEndDecorator")}
                >
                  <DropdownMenuTrigger
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className={cn(
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
                      icon={
                        <ArrowRightFromLine
                          className="px-0"
                          size={20}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      active={actualMenusOpen.includes("connectorEndDecorator")}
                      onClick={(e) => {
                        e.preventDefault();
                        setActualMenusOpen((prev) =>
                          prev.length > 0 ? [] : ["connectorEndDecorator"]
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Connector end decorator</p>
                        </div>
                      }
                      tooltipSide="left"
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

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorDecorator(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_ORIGIN.END,
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-t-lg",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorEndDecoratorType ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE,
                          }
                        )}
                      >
                        None
                      </button>
                      <button
                        onClick={() => {
                          setActualMenusOpen([]);

                          if (!instance || !node) {
                            return;
                          }

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorDecorator(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_ORIGIN.END,
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorEndDecoratorType ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT,
                          }
                        )}
                      >
                        Dot
                      </button>
                      <button
                        onClick={() => {
                          setActualMenusOpen([]);

                          if (!instance || !node) {
                            return;
                          }

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorDecorator(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_ORIGIN.END,
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-b-lg",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorEndDecoratorType ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW,
                          }
                        )}
                      >
                        Arrow
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu
                  modal={false}
                  open={actualMenusOpen.includes("connectorEndDecoratorSize")}
                >
                  <DropdownMenuTrigger
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className={cn(
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
                      icon={
                        <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                          {(actualNode?.props?.["endNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE ||
                            typeof actualNode?.props?.[
                              "endNodeDecoratorType"
                            ] === "undefined") &&
                            "-"}
                          {actualNode?.props?.["endNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT &&
                            `${
                              actualNode?.props["endNodeDecorator-radius"] ??
                              "4"
                            }px`}
                          {actualNode?.props?.["endNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                            `${
                              actualNode?.props["endNodeDecorator-size"] ?? "10"
                            }px`}
                        </div>
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      active={actualMenusOpen.includes(
                        "connectorEndDecoratorSize"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          actualNode?.props?.["endNodeDecoratorType"] ===
                            WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.NONE ||
                          typeof actualNode?.props?.["endNodeDecoratorType"] ===
                            "undefined"
                        ) {
                          return;
                        }
                        setActualMenusOpen((prev) =>
                          prev.length > 0 ? [] : ["connectorEndDecoratorSize"]
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>End decorator size</p>
                        </div>
                      }
                      tooltipSide="left"
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
                    className="min-w-auto font-inter shadow-none flex flex-row rounded-full rounded-x-none"
                  >
                    <div className="flex flex-row-reverse gap-1">
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
                        icon={
                          <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                            {actualNode?.props?.["endNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && "8px"}
                            {actualNode?.props?.["endNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                              "20px"}
                          </div>
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={() => {
                          if (!actualNode) {
                            return;
                          }

                          const updatedNode: WeaveStateElement = {
                            ...actualNode,
                            props: {
                              ...actualNode.props,
                              ...(actualNode?.props?.[
                                "endNodeDecoratorType"
                              ] === WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && {
                                ["endNodeDecorator-radius"]: 20,
                              }),
                              ...(actualNode?.props?.[
                                "endNodeDecoratorType"
                              ] ===
                                WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW && {
                                ["endNodeDecorator-size"]: 20,
                              }),
                            },
                          };

                          updateElement(updatedNode);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>20px</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
                        icon={
                          <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                            {actualNode?.props?.["endNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && "4px"}
                            {actualNode?.props?.["endNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                              "10px"}
                          </div>
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={() => {
                          if (!actualNode) {
                            return;
                          }

                          const updatedNode: WeaveStateElement = {
                            ...actualNode,
                            props: {
                              ...actualNode.props,
                              ...(actualNode?.props?.[
                                "endNodeDecoratorType"
                              ] === WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && {
                                ["endNodeDecorator-radius"]: 10,
                              }),
                              ...(actualNode?.props?.[
                                "endNodeDecoratorType"
                              ] ===
                                WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW && {
                                ["endNodeDecorator-size"]: 10,
                              }),
                            },
                          };

                          updateElement(updatedNode);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>10px</p>
                          </div>
                        }
                        tooltipSide="top"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
                        icon={
                          <div className="w-[20px] h-[20px] rounded-full text-[9px] flex justify-center items-center">
                            {actualNode?.props?.["endNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && "2px"}
                            {actualNode?.props?.["endNodeDecoratorType"] ===
                              WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW &&
                              "5px"}
                          </div>
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        onClick={() => {
                          if (!actualNode) {
                            return;
                          }

                          const updatedNode: WeaveStateElement = {
                            ...actualNode,
                            props: {
                              ...actualNode.props,
                              ...(actualNode?.props?.[
                                "endNodeDecoratorType"
                              ] === WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.DOT && {
                                ["endNodeDecorator-radius"]: 5,
                              }),
                              ...(actualNode?.props?.[
                                "endNodeDecoratorType"
                              ] ===
                                WEAVE_CONNECTOR_NODE_DECORATOR_TYPE.ARROW && {
                                ["endNodeDecorator-size"]: 5,
                              }),
                            },
                          };

                          updateElement(updatedNode);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>5px</p>
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
                  open={actualMenusOpen.includes("connectorType")}
                >
                  <DropdownMenuTrigger
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    className={cn(
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
                      icon={
                        <Spline className="px-0" size={20} strokeWidth={1} />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      active={actualMenusOpen.includes("connectorType")}
                      onClick={(e) => {
                        e.preventDefault();
                        setActualMenusOpen((prev) =>
                          prev.length > 0 ? [] : ["connectorType"]
                        );
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Connector type</p>
                        </div>
                      }
                      tooltipSide="left"
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

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorType(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_TYPE.STRAIGHT
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-t-lg",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorNodeType ===
                              WEAVE_CONNECTOR_NODE_LINE_TYPE.STRAIGHT,
                          }
                        )}
                      >
                        Straight
                      </button>
                      <button
                        onClick={() => {
                          setActualMenusOpen([]);

                          if (!instance || !node) {
                            return;
                          }

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorType(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_TYPE.ELBOW
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorNodeType ===
                              WEAVE_CONNECTOR_NODE_LINE_TYPE.ELBOW,
                          }
                        )}
                      >
                        Elbow
                      </button>
                      <button
                        onClick={() => {
                          setActualMenusOpen([]);

                          if (!instance || !node) {
                            return;
                          }

                          const connectorHandler =
                            instance?.getNodeHandler<WeaveConnectorNode>(
                              "connector"
                            );

                          if (!connectorHandler) {
                            return;
                          }

                          const nodeInstance = instance
                            .getStage()
                            .findOne(`#${node?.key ?? ""}`);

                          if (!nodeInstance) {
                            return;
                          }

                          connectorHandler.changeConnectorType(
                            nodeInstance as Konva.Group,
                            WEAVE_CONNECTOR_NODE_LINE_TYPE.CURVED
                          );
                        }}
                        className={cn(
                          "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-b-lg",
                          {
                            ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                              connectorNodeType ===
                              WEAVE_CONNECTOR_NODE_LINE_TYPE.CURVED,
                          }
                        )}
                      >
                        Curved
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {isMeasureNode && (
              <>
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
                  icon={
                    <FlipVertical2 className="px-0" size={20} strokeWidth={1} />
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
                        nodeInstance as Konva.Group
                      );
                    }
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Flip</p>
                    </div>
                  }
                  tooltipSide="left"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
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
                          nodeInstance as Konva.Group
                        );

                      const actualSavedConfig = JSON.parse(
                        sessionStorage.getItem(
                          `weave_measurement_config_${room}`
                        ) || "{}"
                      );

                      const updatedConfig = {
                        referenceMeasurePixels: distanceInPixels,
                      };

                      const finalConfiguration = merge(
                        actualSavedConfig,
                        updatedConfig
                      );

                      sessionStorage.setItem(
                        `weave_measurement_config_${room}`,
                        JSON.stringify(finalConfiguration)
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
                  tooltipSide="left"
                  tooltipAlign="center"
                />
              </>
            )}
            {isImageTemplate && (
              <>
                {!actualNode?.props.isUsed && (
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
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
                          "image-template"
                        );

                      const stage = instance.getStage();
                      const nodeInstance = stage.findOne(
                        `#${actualNode?.key ?? ""}`
                      );

                      if (!handler || !nodeInstance || !linkedNode) {
                        return;
                      }

                      if (!linkedNode) {
                      }

                      handler.setImage(
                        nodeInstance as WeaveElementInstance,
                        linkedNode as WeaveElementInstance
                      );
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>link image</p>
                      </div>
                    }
                    tooltipSide="left"
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
                          "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                          {
                            ["disabled:cursor-default disabled:opacity-50"]:
                              weaveConnectionStatus !==
                              WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                          }
                        )}
                        asChild
                      >
                        <ToolbarButton
                          className="rounded-full !w-[40px] !h-[40px]"
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
                              prev.length > 0 ? [] : ["templateFit"]
                            );
                          }}
                          label={
                            <div className="flex gap-3 justify-start items-center">
                              <p>Template fit</p>
                            </div>
                          }
                          tooltipSide="left"
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
                                  "image-template"
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
                                IMAGE_TEMPLATE_FIT.FILL
                              );
                            }}
                            className={cn(
                              "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-t-lg",
                              {
                                ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                  imageTemplateFit === IMAGE_TEMPLATE_FIT.FILL,
                              }
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
                                  "image-template"
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
                                IMAGE_TEMPLATE_FIT.CONTAIN
                              );
                            }}
                            className={cn(
                              "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                              {
                                ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                  imageTemplateFit ===
                                  IMAGE_TEMPLATE_FIT.CONTAIN,
                              }
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
                                  "image-template"
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
                                IMAGE_TEMPLATE_FIT.COVER
                              );
                            }}
                            className={cn(
                              "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                              {
                                ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                  imageTemplateFit === IMAGE_TEMPLATE_FIT.COVER,
                              }
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
                                  "image-template"
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
                                IMAGE_TEMPLATE_FIT.FREE
                              );
                            }}
                            className={cn(
                              "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3 rounded-b-lg",
                              {
                                ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                  imageTemplateFit === IMAGE_TEMPLATE_FIT.FREE,
                              }
                            )}
                          >
                            Free
                          </button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                            "image-template"
                          );

                        const stage = instance.getStage();
                        const nodeInstance = stage.findOne(
                          `#${actualNode?.key ?? ""}`
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
                      tooltipSide="left"
                      tooltipAlign="center"
                    />
                  </>
                )}
                <ToolbarDivider
                  orientation="horizontal"
                  className="!h-[28px]"
                />
              </>
            )}
            {!isGroup && canSetNodeStyling && (
              <DropdownMenu
                modal={false}
                open={actualMenusOpen.includes("nodeStyle")}
              >
                <DropdownMenuTrigger
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  className={cn(
                    "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                    {
                      ["disabled:cursor-default disabled:opacity-50"]:
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                    }
                  )}
                  asChild
                >
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
                    icon={
                      <Paintbrush className="px-0" size={20} strokeWidth={1} />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={actualMenusOpen.includes("nodeStyle")}
                    onClick={(e) => {
                      e.preventDefault();
                      setActualMenusOpen((prev) =>
                        prev.length > 0 ? [] : ["nodeStyle"]
                      );
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Styling</p>
                      </div>
                    }
                    tooltipSide="left"
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
                  <div className="grid grid-cols-[auto_auto] gap-1justify-start items-center py-1 px-1">
                    {isTextNode && (
                      <>
                        <div className="w-full flex justify-end items-center py-1">
                          <DropdownMenu
                            modal={false}
                            open={actualMenusOpen.includes("nodeTextColor")}
                          >
                            <DropdownMenuTrigger
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              className={cn(
                                "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                                {
                                  ["disabled:cursor-default disabled:opacity-50"]:
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                                }
                              )}
                              asChild
                            >
                              <ToolbarButton
                                className="rounded-full min-w-[32px] !w-[40px] !h-[40px]"
                                icon={
                                  <div
                                    className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                                    style={{
                                      background: actualNode?.props.fill,
                                    }}
                                  />
                                }
                                disabled={
                                  weaveConnectionStatus !==
                                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                }
                                active={actualMenusOpen.includes(
                                  "nodeTextColor"
                                )}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActualMenusOpen((prev) => [
                                    ...prev,
                                    "nodeTextColor",
                                  ]);
                                }}
                                label={
                                  <div className="flex gap-3 justify-start items-center">
                                    <p>Font color</p>
                                  </div>
                                }
                                tooltipSide="left"
                                tooltipAlign="center"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              side="left"
                              alignOffset={0}
                              sideOffset={8}
                              className="min-w-auto font-inter rounded-none shadow-none flex flex-row"
                            >
                              <div
                                className="flex !flex-col gap-0 w-[300px] p-4"
                                onClick={(e) => e.preventDefault()}
                              >
                                <ColorPickerInput
                                  value={
                                    actualNode?.props.colorToken ?? "#ffffff"
                                  }
                                  onChange={(color) => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        fill: color,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                />
                                <Button
                                  onClick={() => {
                                    setActualMenusOpen([]);
                                  }}
                                  className="cursor-pointer font-inter font-light rounded-none w-full"
                                >
                                  CLOSE
                                </Button>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-[10px] font-inter uppercase px-3">
                          Font color
                        </div>
                      </>
                    )}
                    {isFrameNode && (
                      <>
                        <div className="w-full flex justify-end items-center py-1">
                          <DropdownMenu
                            modal={false}
                            open={actualMenusOpen.includes("nodeFill")}
                          >
                            <DropdownMenuTrigger
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              className={cn(
                                "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                                {
                                  ["disabled:cursor-default disabled:opacity-50"]:
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                                }
                              )}
                              asChild
                            >
                              <ToolbarButton
                                className="rounded-full min-w-[32px] !w-[40px] !h-[40px]"
                                icon={
                                  <div
                                    className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                                    style={{
                                      background:
                                        actualNode?.props.frameBackground ??
                                        "#ffffffff",
                                    }}
                                  />
                                }
                                disabled={
                                  weaveConnectionStatus !==
                                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                }
                                active={actualMenusOpen.includes("nodeFill")}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActualMenusOpen((prev) => [
                                    ...prev,
                                    "nodeFill",
                                  ]);
                                }}
                                label={
                                  <div className="flex gap-3 justify-start items-center">
                                    <p>Background color</p>
                                  </div>
                                }
                                tooltipSide="left"
                                tooltipAlign="center"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              side="left"
                              alignOffset={0}
                              sideOffset={8}
                              className="min-w-auto font-inter rounded-none shadow-none flex flex-row"
                            >
                              <div
                                className="flex !flex-col gap-0 w-[300px] p-4"
                                onClick={(e) => e.preventDefault()}
                              >
                                <ColorPickerInput
                                  value={
                                    actualNode?.props.frameBackground ??
                                    "#ffffff"
                                  }
                                  onChange={(color: string) => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        frameBackground: color,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                />
                                <Button
                                  onClick={() => {
                                    setActualMenusOpen([]);
                                  }}
                                  className="cursor-pointer font-inter font-light rounded-none w-full"
                                >
                                  CLOSE
                                </Button>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-[10px] font-inter uppercase px-3">
                          Background color
                        </div>
                      </>
                    )}
                    {!(
                      isFrameNode ||
                      isVideoNode ||
                      isTextNode ||
                      isColorTokenNode
                    ) && (
                      <>
                        {!["stroke", "line", "connector"].includes(
                          actualNode.type
                        ) && (
                          <>
                            <div className="w-full flex justify-end items-center py-1">
                              <DropdownMenu
                                modal={false}
                                open={actualMenusOpen.includes("nodeFill")}
                              >
                                <DropdownMenuTrigger
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  className={cn(
                                    "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                                    {
                                      ["disabled:cursor-default disabled:opacity-50"]:
                                        weaveConnectionStatus !==
                                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                                    }
                                  )}
                                  asChild
                                >
                                  <ToolbarButton
                                    className="rounded-full min-w-[32px] !w-[40px] !h-[40px]"
                                    icon={
                                      <div
                                        className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                                        style={{
                                          background: actualNode?.props.fill,
                                        }}
                                      />
                                    }
                                    disabled={
                                      weaveConnectionStatus !==
                                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                    }
                                    active={actualMenusOpen.includes(
                                      "nodeFill"
                                    )}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setActualMenusOpen((prev) => [
                                        ...prev.filter(
                                          (m) => m === "nodeStyle"
                                        ),
                                        "nodeFill",
                                      ]);
                                    }}
                                    label={
                                      <div className="flex gap-3 justify-start items-center">
                                        <p>Fill color</p>
                                      </div>
                                    }
                                    tooltipSide="left"
                                    tooltipAlign="center"
                                  />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  side="left"
                                  alignOffset={0}
                                  sideOffset={8}
                                  className="min-w-auto font-inter rounded-none shadow-none flex flex-row"
                                >
                                  <div
                                    className="flex !flex-col gap-0 w-[300px] p-4"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <ColorPickerInput
                                      value={
                                        actualNode?.props.fill ?? "#ffffff"
                                      }
                                      onChange={(color: string) => {
                                        if (!actualNode) {
                                          return;
                                        }

                                        const updatedNode: WeaveStateElement = {
                                          ...actualNode,
                                          props: {
                                            ...actualNode.props,
                                            fill: color,
                                          },
                                        };

                                        updateElement(updatedNode);
                                      }}
                                    />
                                    <Button
                                      onClick={() => {
                                        setActualMenusOpen([]);
                                      }}
                                      className="cursor-pointer font-inter font-light rounded-none w-full"
                                    >
                                      CLOSE
                                    </Button>
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="text-[10px] font-inter uppercase px-3">
                              Fill color
                            </div>
                            <div className="col-span-2 w-full !h-[1px] bg-zinc-200"></div>
                          </>
                        )}
                        <div className="w-full flex justify-end items-center py-1">
                          <DropdownMenu
                            modal={false}
                            open={actualMenusOpen.includes("nodeStroke")}
                          >
                            <DropdownMenuTrigger
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              className={cn(
                                "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                                {
                                  ["disabled:cursor-default disabled:opacity-50"]:
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                                }
                              )}
                              asChild
                            >
                              <ToolbarButton
                                className="rounded-full min-w-[32px] !w-[40px] !h-[40px]"
                                icon={
                                  <div
                                    className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                                    style={{
                                      background: actualNode?.props.stroke,
                                    }}
                                  />
                                }
                                disabled={
                                  weaveConnectionStatus !==
                                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                }
                                active={actualMenusOpen.includes("nodeStroke")}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActualMenusOpen((prev) => [
                                    ...prev.filter((m) => m === "nodeStyle"),
                                    "nodeStroke",
                                  ]);
                                }}
                                label={
                                  <div className="flex gap-3 justify-start items-center">
                                    <p>Stroke color</p>
                                  </div>
                                }
                                tooltipSide="left"
                                tooltipAlign="center"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              side="left"
                              alignOffset={0}
                              sideOffset={8}
                              className="min-w-auto font-inter rounded-none shadow-none flex flex-row"
                            >
                              <div
                                className="flex !flex-col gap-0 w-[300px] p-4"
                                onClick={(e) => e.preventDefault()}
                              >
                                <ColorPickerInput
                                  value={actualNode?.props.stroke ?? "#ffffff"}
                                  onChange={(color) => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        stroke: color,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                />
                                <Button
                                  onClick={() => {
                                    setActualMenusOpen([]);
                                  }}
                                  className="cursor-pointer font-inter font-light rounded-none w-full"
                                >
                                  CLOSE
                                </Button>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-[10px] font-inter uppercase px-3">
                          Stroke color
                        </div>
                        <div className="col-span-2 w-full !h-[1px] bg-zinc-200"></div>
                        <div className="w-full flex justify-end items-center py-1">
                          <DropdownMenu
                            modal={false}
                            open={actualMenusOpen.includes("nodeStrokeWidth")}
                          >
                            <DropdownMenuTrigger
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              className={cn(
                                "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                                {
                                  ["disabled:cursor-default disabled:opacity-50"]:
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                                }
                              )}
                              asChild
                            >
                              <ToolbarButton
                                className="rounded-full !w-[40px] !h-[40px]"
                                icon={
                                  actualNode?.props.strokeWidth === 0 ? (
                                    <X
                                      className="px-0"
                                      size={20}
                                      strokeWidth={1}
                                    />
                                  ) : (
                                    <div
                                      className="w-[20px] h-[20px] rounded-full"
                                      style={{
                                        height: actualNode?.props.strokeWidth,
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  )
                                }
                                disabled={
                                  weaveConnectionStatus !==
                                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActualMenusOpen((prev) => [
                                    ...prev.filter((m) => m === "nodeStyle"),
                                    "nodeStrokeWidth",
                                  ]);
                                }}
                                label={
                                  <div className="flex gap-3 justify-start items-center">
                                    <p>Stroke width</p>
                                  </div>
                                }
                                tooltipSide="left"
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
                              className="min-w-auto font-inter shadow-none flex flex-row rounded-full rounded-x-none"
                            >
                              <div className="flex flex-row-reverse gap-1">
                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height: 20,
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        strokeWidth: 20,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>20px</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />
                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height: 10,
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        strokeWidth: 10,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>10px</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />
                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height: 5,
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        strokeWidth: 5,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>5px</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />

                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height: 2,
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        strokeWidth: 2,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>2px</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />
                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height: 1,
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        strokeWidth: 1,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>1px</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />

                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <X
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
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        strokeWidth: 0,
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>None</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-[10px] font-inter uppercase px-3">
                          Stroke width
                        </div>
                        <div className="col-span-2 w-full !h-[1px] bg-zinc-200"></div>
                        <div className="w-full flex justify-end items-center py-1">
                          <DropdownMenu
                            modal={false}
                            open={actualMenusOpen.includes("nodeStrokeStyle")}
                          >
                            <DropdownMenuTrigger
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              className={cn(
                                "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                                {
                                  ["disabled:cursor-default disabled:opacity-50"]:
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                                }
                              )}
                              asChild
                            >
                              <ToolbarButton
                                className="rounded-full !w-[40px] !h-[40px]"
                                icon={
                                  <div
                                    className="w-[20px] rounded-full"
                                    style={{
                                      height:
                                        (actualNode?.props.strokeWidth ?? 0) ===
                                        0
                                          ? 1
                                          : (actualNode?.props.strokeWidth ??
                                            0),
                                      background: nodeDashBackground,
                                    }}
                                  />
                                }
                                disabled={
                                  weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                                  (actualNode?.props.strokeWidth ?? 0) === 0
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActualMenusOpen((prev) => [
                                    ...prev.filter((m) => m === "nodeStyle"),
                                    "nodeStrokeStyle",
                                  ]);
                                }}
                                label={
                                  <div className="flex gap-3 justify-start items-center">
                                    <p>Stroke style</p>
                                  </div>
                                }
                                tooltipSide="left"
                                tooltipAlign="end"
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
                              className="min-w-auto font-inter shadow-none flex flex-row rounded-full rounded-x-none"
                            >
                              <div className="flex flex-row-reverse gap-1">
                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height:
                                          (actualNode?.props.strokeWidth ??
                                            0) === 0
                                            ? 1
                                            : (actualNode?.props.strokeWidth ??
                                              0),
                                        background: `repeating-linear-gradient(90deg, ${actualNode?.props.stroke} 0px, ${actualNode?.props.stroke} 4px, transparent 4px, transparent 8px)`,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        dash: [8, 4],
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>Dashed (long)</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />
                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height:
                                          (actualNode?.props.strokeWidth ??
                                            0) === 0
                                            ? 1
                                            : (actualNode?.props.strokeWidth ??
                                              0),
                                        background: `repeating-linear-gradient(90deg, ${actualNode?.props.stroke} 0px, ${actualNode?.props.stroke} 2px, transparent 2px, transparent 4px)`,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        dash: [4, 2],
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>Dashed (short)</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />

                                <ToolbarButton
                                  className="rounded-full !w-[40px] !h-[40px]"
                                  icon={
                                    <div
                                      className="w-[24px] rounded-full"
                                      style={{
                                        height:
                                          (actualNode?.props.strokeWidth ??
                                            0) === 0
                                            ? 1
                                            : (actualNode?.props.strokeWidth ??
                                              0),
                                        background: actualNode?.props.stroke,
                                      }}
                                    />
                                  }
                                  disabled={
                                    weaveConnectionStatus !==
                                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                  }
                                  onClick={() => {
                                    if (!actualNode) {
                                      return;
                                    }

                                    const updatedNode: WeaveStateElement = {
                                      ...actualNode,
                                      props: {
                                        ...actualNode.props,
                                        dash: [],
                                      },
                                    };

                                    updateElement(updatedNode);
                                  }}
                                  label={
                                    <div className="flex gap-3 justify-start items-center">
                                      <p>Normal</p>
                                    </div>
                                  }
                                  tooltipSide="top"
                                  tooltipAlign="end"
                                />
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-[10px] font-inter uppercase px-3">
                          Stroke style
                        </div>
                      </>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isImage && (
              <>
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
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

                    const selectionImage = await getImageBase64({
                      instance,
                      nodes: nodes.map((n) => n.node?.key ?? ""),
                      options: {
                        format: "image/png",
                        padding: 0,
                        backgroundColor: "transparent",
                        pixelRatio: 1,
                      },
                    });

                    const [header, base64] = selectionImage.url.split(",");
                    const mime = header.match(/:(.*?);/)![1];

                    const binary = atob(base64);
                    const len = binary.length;
                    const bytes = new Uint8Array(len);

                    for (let i = 0; i < len; i++) {
                      bytes[i] = binary.charCodeAt(i);
                    }

                    const selectionBlob = new Blob([bytes], { type: mime });

                    const file = new File([selectionBlob], "image.png", {
                      type: mime,
                    });

                    promptInputAttachmentsController.add([file]);

                    toast.dismiss(id);
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Set as prompt attachment</p>
                    </div>
                  }
                  tooltipSide="left"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
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
                      `#${actualNode?.key ?? ""}`
                    );

                    setLinkedNode(nodeInstance || null);
                    toast.success("Image set as template link.");
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Set as template link</p>
                    </div>
                  }
                  tooltipSide="left"
                  tooltipAlign="end"
                />
                <ToolbarDivider
                  orientation="horizontal"
                  className="!h-[28px]"
                />
                {workloadsEnabled && (
                  <>
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                        if (!instance) {
                          return;
                        }

                        const nodeImage = nodes[0].instance as
                          | Konva.Group
                          | undefined;

                        if (nodeImage) {
                          nodeImage.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);

                          setTransformingImage(true, "background-removal");

                          try {
                            const { url } = await getImageBase64({
                              instance,
                              nodes: nodes.map((n) => n.node?.key ?? ""),
                              options: {
                                padding: 0,
                                pixelRatio: 1,
                              },
                            });

                            const dataBase64 = url.split(",")[1];

                            mutationRemoveBackground.mutate(
                              {
                                userId: user?.name ?? "",
                                clientId: clientId ?? "",
                                imageId: uuidv4(),
                                image: {
                                  dataBase64,
                                  contentType: "image/png",
                                },
                              },
                              {
                                onSuccess: () => {
                                  sidebarToggle(SIDEBAR_ELEMENTS.images);
                                },
                                onError: () => {
                                  toast.error(
                                    "Error requesting image background removal."
                                  );
                                },
                                onSettled: () => {
                                  setTransformingImage(false);
                                },
                              }
                            );
                          } catch (error) {
                            console.error(error);
                            toast.error("Error transforming the image.");
                          } finally {
                            setTransformingImage(false);
                          }
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Remove background</p>
                        </div>
                      }
                      tooltipSide="left"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
                      icon={
                        <Minus className="px-0" size={20} strokeWidth={1} />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={async () => {
                        if (!instance) {
                          return;
                        }

                        const nodeImage = nodes[0].instance as
                          | Konva.Group
                          | undefined;

                        if (nodeImage) {
                          nodeImage.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);

                          setTransformingImage(true, "negate-image");

                          try {
                            const { url } = await getImageBase64({
                              instance,
                              nodes: nodes.map((n) => n.node?.key ?? ""),
                              options: {
                                padding: 0,
                                pixelRatio: 1,
                              },
                            });

                            const dataBase64 = url.split(",")[1];

                            mutationNegate.mutate(
                              {
                                userId: user?.name ?? "",
                                clientId: clientId ?? "",
                                imageId: uuidv4(),
                                image: {
                                  dataBase64,
                                  contentType: "image/png",
                                },
                              },
                              {
                                onSuccess: () => {
                                  sidebarToggle(SIDEBAR_ELEMENTS.images);
                                },
                                onError: () => {
                                  toast.error(
                                    "Error requesting image background removal."
                                  );
                                },
                                onSettled: () => {
                                  setTransformingImage(false);
                                },
                              }
                            );
                          } catch (error) {
                            console.error(error);
                            toast.error("Error transforming the image.");
                          } finally {
                            setTransformingImage(false);
                          }
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Negate</p>
                        </div>
                      }
                      tooltipSide="left"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                        if (!instance) {
                          return;
                        }

                        const nodeImage = nodes[0].instance as
                          | Konva.Group
                          | undefined;

                        if (nodeImage) {
                          nodeImage.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);

                          setTransformingImage(true, "flip-horizontal-image");

                          try {
                            const { url } = await getImageBase64({
                              instance,
                              nodes: nodes.map((n) => n.node?.key ?? ""),
                              options: {
                                padding: 0,
                                pixelRatio: 1,
                              },
                            });

                            const dataBase64 = url.split(",")[1];

                            mutationFlip.mutate(
                              {
                                userId: user?.name ?? "",
                                clientId: clientId ?? "",
                                imageId: uuidv4(),
                                orientation: "horizontal",
                                image: {
                                  dataBase64,
                                  contentType: "image/png",
                                },
                              },
                              {
                                onSuccess: () => {
                                  sidebarToggle(SIDEBAR_ELEMENTS.images);
                                },
                                onError: () => {
                                  toast.error(
                                    "Error requesting image horizontal flip."
                                  );
                                },
                                onSettled: () => {
                                  setTransformingImage(false);
                                },
                              }
                            );
                          } catch (error) {
                            console.error(error);
                            toast.error("Error transforming the image.");
                          } finally {
                            setTransformingImage(false);
                          }
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Flip horizontally</p>
                        </div>
                      }
                      tooltipSide="left"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                        if (!instance) {
                          return;
                        }

                        const nodeImage = nodes[0].instance as
                          | Konva.Group
                          | undefined;

                        if (nodeImage) {
                          nodeImage.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);

                          setTransformingImage(true, "flip-vertical-image");

                          try {
                            const { url } = await getImageBase64({
                              instance,
                              nodes: nodes.map((n) => n.node?.key ?? ""),
                              options: {
                                padding: 0,
                                pixelRatio: 1,
                              },
                            });

                            const dataBase64 = url.split(",")[1];

                            mutationFlip.mutate(
                              {
                                userId: user?.name ?? "",
                                clientId: clientId ?? "",
                                imageId: uuidv4(),
                                orientation: "vertical",
                                image: {
                                  dataBase64,
                                  contentType: "image/png",
                                },
                              },
                              {
                                onSuccess: () => {
                                  sidebarToggle(SIDEBAR_ELEMENTS.images);
                                },
                                onError: () => {
                                  toast.error(
                                    "Error requesting image vertical flip."
                                  );
                                },
                                onSettled: () => {
                                  setTransformingImage(false);
                                },
                              }
                            );
                          } catch (error) {
                            console.error(error);
                            toast.error("Error transforming the image.");
                          } finally {
                            setTransformingImage(false);
                          }
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Flip vertically</p>
                        </div>
                      }
                      tooltipSide="left"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                        if (!instance) {
                          return;
                        }

                        const nodeImage = nodes[0].instance as
                          | Konva.Group
                          | undefined;

                        if (nodeImage) {
                          nodeImage.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);

                          setTransformingImage(true, "grayscale-image");

                          try {
                            const { url } = await getImageBase64({
                              instance,
                              nodes: nodes.map((n) => n.node?.key ?? ""),
                              options: {
                                padding: 0,
                                pixelRatio: 1,
                              },
                            });

                            const dataBase64 = url.split(",")[1];

                            mutationGrayscale.mutate(
                              {
                                userId: user?.name ?? "",
                                clientId: clientId ?? "",
                                imageId: uuidv4(),
                                image: {
                                  dataBase64,
                                  contentType: "image/png",
                                },
                              },
                              {
                                onSuccess: () => {
                                  sidebarToggle(SIDEBAR_ELEMENTS.images);
                                },
                                onError: () => {
                                  toast.error(
                                    "Error requesting image grayscaling."
                                  );
                                },
                                onSettled: () => {
                                  setTransformingImage(false);
                                },
                              }
                            );
                          } catch (error) {
                            console.error(error);
                            toast.error("Error transforming the image.");
                          } finally {
                            setTransformingImage(false);
                          }
                        }
                      }}
                      label={
                        <div className="flex gap-3 justify-start items-center">
                          <p>Graycale</p>
                        </div>
                      }
                      tooltipSide="left"
                      tooltipAlign="center"
                    />
                  </>
                )}
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
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
                      <p>Crop image</p>
                    </div>
                  }
                  tooltipSide="left"
                  tooltipAlign="center"
                />
                <ToolbarDivider
                  orientation="horizontal"
                  className="!h-[28px]"
                />
              </>
            )}
            {isMultiNodesSelected && (
              <>
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
                  icon={
                    <WandSparkles className="px-0" size={20} strokeWidth={1} />
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

                    const selectionImage = await getImageBase64({
                      instance,
                      nodes: nodes.map((n) => n.node?.key ?? ""),
                      options: {
                        format: "image/png",
                        padding: 0,
                        backgroundColor: "transparent",
                        pixelRatio: 1,
                      },
                    });

                    const [header, base64] = selectionImage.url.split(",");
                    const mime = header.match(/:(.*?);/)![1];

                    const binary = atob(base64);
                    const len = binary.length;
                    const bytes = new Uint8Array(len);

                    for (let i = 0; i < len; i++) {
                      bytes[i] = binary.charCodeAt(i);
                    }

                    const selectionBlob = new Blob([bytes], { type: mime });

                    const file = new File([selectionBlob], "selection.png", {
                      type: mime,
                    });
                    const dataURL = await fileToDataURL(file);

                    // promptInputAttachmentsController.add([file]);

                    sendMessage(
                      {
                        text: "Follow the instructions on the image and generate the result, don't change anything else.",
                        files: [
                          {
                            type: "file",
                            mediaType: mime,
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
                      }
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
                  tooltipSide="left"
                  tooltipAlign="center"
                />
                <ToolbarDivider
                  orientation="horizontal"
                  className="!h-[28px]"
                />
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
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                        "nodesAlignmentHorizontal"
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
                      tooltipSide="left"
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
                    className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
                  >
                    <div className="flex gap-1">
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
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
                        tooltipSide="left"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
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
                        tooltipSide="left"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
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
                        tooltipSide="left"
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
                      "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                      {
                        ["disabled:cursor-default disabled:opacity-50"]:
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                      }
                    )}
                    asChild
                  >
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                        "nodesAlignmentVertical"
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
                      tooltipSide="left"
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
                    className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
                  >
                    <div className="flex gap-1">
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
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
                        tooltipSide="left"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
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
                        tooltipSide="left"
                        tooltipAlign="end"
                      />
                      <ToolbarButton
                        className="rounded-full !w-[40px] !h-[40px]"
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
                        tooltipSide="left"
                        tooltipAlign="end"
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!["measure"].includes(actualNode?.type as string) && (
              <DropdownMenu
                modal={false}
                open={actualMenusOpen.includes("composite")}
              >
                <DropdownMenuTrigger
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  className={cn(
                    "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                    {
                      ["disabled:cursor-default disabled:opacity-50"]:
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                    }
                  )}
                  asChild
                >
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
                    icon={
                      <RectangleCircle
                        className="px-0"
                        size={20}
                        strokeWidth={1}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={actualMenusOpen.includes("composite")}
                    onClick={(e) => {
                      e.preventDefault();
                      setActualMenusOpen((prev) =>
                        prev.length > 0 ? [] : ["composite"]
                      );
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Composite</p>
                      </div>
                    }
                    tooltipSide="left"
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
                  className="min-w-auto max-h-[200px] !p-0 font-inter rounded-xl !border-zinc-200 shadow-none flex flex-row"
                >
                  <div className="w-[120px] h-full flex flex-col gap-0 justify-center items-center py-1 px-1">
                    <ToolbarButton
                      className="rounded-none rounded-t-lg !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">source-over</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                          undefined ||
                        actualNode?.props.globalCompositeOperation ===
                          "source-over"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "source-over",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">multiply</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "multiply"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "multiply",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={<span className="font-inter text-xs">screen</span>}
                      active={
                        actualNode?.props.globalCompositeOperation === "screen"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "screen",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={<span className="font-inter text-xs">overlay</span>}
                      active={
                        actualNode?.props.globalCompositeOperation === "overlay"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "overlay",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={<span className="font-inter text-xs">darken</span>}
                      active={
                        actualNode?.props.globalCompositeOperation === "darken"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "darken",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={<span className="font-inter text-xs">lighten</span>}
                      active={
                        actualNode?.props.globalCompositeOperation === "lighten"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "lighten",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">color-dodge</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "color-dodge"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "color-dodge",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">color-burn</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "color-burn"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "color-burn",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">hard-light</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "hard-light"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "hard-light",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">soft-light</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "soft-light"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "soft-light",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">difference</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "difference"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "difference",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">exclusion</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "exclusion"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "exclusion",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={<span className="font-inter text-xs">hue</span>}
                      active={
                        actualNode?.props.globalCompositeOperation === "hue"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "hue",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">saturation</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "saturation"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "saturation",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                      icon={<span className="font-inter text-xs">color</span>}
                      active={
                        actualNode?.props.globalCompositeOperation === "color"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "color",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-none rounded-b-lg !w-full !h-[32px] !min-h-[32px]"
                      icon={
                        <span className="font-inter text-xs">luminosity</span>
                      }
                      active={
                        actualNode?.props.globalCompositeOperation ===
                        "luminosity"
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setActualMenusOpen([]);

                        if (!actualNode) {
                          return;
                        }

                        const updatedNode: WeaveStateElement = {
                          ...actualNode,
                          props: {
                            ...actualNode.props,
                            globalCompositeOperation: "luminosity",
                          },
                        };

                        updateElement(updatedNode);
                      }}
                      tooltipSide="left"
                      tooltipAlign="end"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                    "relative rounded-full cursor-pointer h-[40px] hover:text-[#666666] focus:outline-none",
                    {
                      ["disabled:cursor-default disabled:opacity-50"]:
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED,
                    }
                  )}
                  asChild
                >
                  <ToolbarButton
                    className="rounded-full !w-[40px] !h-[40px]"
                    icon={<Layers className="px-0" size={20} strokeWidth={1} />}
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={actualMenusOpen.includes("layering")}
                    onClick={(e) => {
                      e.preventDefault();
                      setActualMenusOpen((prev) =>
                        prev.length > 0 ? [] : ["layering"]
                      );
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Layering</p>
                      </div>
                    }
                    tooltipSide="left"
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
                  className="min-w-auto !p-0 font-inter rounded-full !border-zinc-200 shadow-none flex flex-row"
                >
                  <div className="flex gap-0 justify-center items-center py-1 px-1">
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                          nodeInstance as WeaveElementInstance
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
                      tooltipSide="top"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                      tooltipSide="top"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                      tooltipSide="top"
                      tooltipAlign="end"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[40px] !h-[40px]"
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
                          nodeInstance as WeaveElementInstance
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
                      tooltipSide="top"
                      tooltipAlign="end"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ToolbarDivider orientation="horizontal" className="!h-[28px]" />
            {isMultiNodesSelected && (
              <ToolbarButton
                className="rounded-full !w-[40px] !h-[40px]"
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
                      .filter((node) => typeof node !== "undefined")
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
                tooltipSide="left"
                tooltipAlign="center"
              />
            )}
            {isGroup && (
              <ToolbarButton
                className="rounded-full !w-[40px] !h-[40px]"
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
                tooltipSide="left"
                tooltipAlign="center"
              />
            )}
            <ToolbarButton
              className="rounded-full !w-[40px] !h-[40px]"
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
              tooltipSide="left"
              tooltipAlign="center"
            />
            <ToolbarButton
              className="rounded-full !w-[40px] !h-[40px]"
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
              tooltipSide="left"
              tooltipAlign="center"
            />
            <ToolbarButton
              className="rounded-full !w-[40px] !h-[40px]"
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
                    "copyPasteNodes"
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
              tooltipSide="left"
              tooltipAlign="center"
            />
            <ToolbarButton
              className="rounded-full !w-[40px] !h-[40px]"
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
              tooltipSide="left"
              tooltipAlign="center"
            />
            {isSingleNodeSelected && (
              <>
                <ToolbarDivider
                  orientation="horizontal"
                  className="!h-[28px]"
                />
                <ToolbarButton
                  className="rounded-full !w-[40px] !h-[40px]"
                  icon={<Settings className="px-0" size={20} strokeWidth={1} />}
                  disabled={
                    weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                    typeof nodePropertiesAction === "undefined" ||
                    typeof actualNode === "undefined" ||
                    (typeof actualNode === "undefined" && nodes.length < 2)
                  }
                  onClick={() => {
                    setActualMenusOpen([]);
                    setSidebarActive(SIDEBAR_ELEMENTS.nodeProperties);
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Node Properties</p>
                      <ShortcutElement
                        shortcuts={{
                          [SYSTEM_OS.MAC]: "⌘ Z",
                          [SYSTEM_OS.OTHER]: "Ctrl Z",
                        }}
                      />
                    </div>
                  }
                  tooltipSide="left"
                  tooltipAlign="center"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
