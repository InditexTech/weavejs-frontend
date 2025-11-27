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
  WeaveSelection,
  WeaveStateElement,
} from "@inditextech/weave-types";
import { useMutation } from "@tanstack/react-query";
import { postRemoveBackground } from "@/api/v2/post-remove-background";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNodeActionName } from "./hooks/use-node-action-name";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import {
  X,
  Group,
  Ungroup,
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
  HardDriveUpload,
  ImageUpscale,
} from "lucide-react";
import { ShortcutElement } from "../help/shortcut-element";
import { cn, SYSTEM_OS } from "@/lib/utils";
import {
  WEAVE_IMAGE_CROP_END_TYPE,
  WeaveCopyPasteNodesPlugin,
  WeaveNodesSelectionPlugin,
  WeaveAlignNodesToolActionTriggerParams,
  WeaveVideoNode,
} from "@inditextech/weave-sdk";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { ColorPickerInput } from "../inputs/color-picker";
import { Button } from "@/components/ui/button";
import { getImageBase64 } from "@/components/utils/images";
import { postNegateImage } from "@/api/post-negate-image";
import { postFlipImage } from "@/api/post-flip-image";
import { postGrayscaleImage } from "@/api/post-grayscale-image";
import { throttle } from "lodash";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { IMAGE_TEMPLATE_FIT } from "@/components/nodes/image-template/constants";

export const NodeToolbar = () => {
  const actualNodeRef = React.useRef<WeaveStateElement | undefined>(undefined);
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const [dontRender, setDontRender] = React.useState(false);
  const [movingImageTemplate, setMovingImageTemplate] =
    React.useState<Konva.Group | null>(null);
  const [nodeFillMenuOpen, setNodeFillMenuOpen] = React.useState(false);
  const [nodeStrokeWidthMenuOpen, setNodeStrokeWidthMenuOpen] =
    React.useState(false);
  const [nodeStrokeStyleMenuOpen, setNodeStrokeStyleMenuOpen] =
    React.useState(false);
  const [nodeStrokeMenuOpen, setNodeStrokeMenuOpen] = React.useState(false);
  const [nodeStyleMenuOpen, setNodeStyleMenuOpen] = React.useState(false);
  const [nodeCompositeMenuOpen, setNodeCompositeMenuOpen] =
    React.useState(false);
  const [nodeLayeringMenuOpen, setNodeLayeringMenuOpen] = React.useState(false);
  const [colorTokenColorMenuOpen, setColorTokenColorMenuOpen] =
    React.useState(false);
  const [nodeTextColorMenuOpen, setNodeTextColorMenuOpen] =
    React.useState(false);
  const [
    nodesAlignmentHorizontalMenuOpen,
    setNodesAlignmentHorizontalMenuOpen,
  ] = React.useState(false);
  const [nodesAlignmentVerticalMenuOpen, setNodesAlignmentVerticalMenuOpen] =
    React.useState(false);
  const [templateFitMenuOpen, setTemplateFitMenuOpen] = React.useState(false);

  const [isSelecting, setIsSelecting] = React.useState(false);
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

  const linkedNode = useCollaborationRoom((state) => state.linkedNode);
  const setLinkedNode = useCollaborationRoom((state) => state.setLinkedNode);

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

  React.useEffect(() => {
    if (!instance) return;

    function handleOnDrag(draggedNode: Konva.Node | null = null) {
      if (toolbarRef.current && draggedNode) {
        toolbarRef.current.style.setProperty("visibility", "hidden");
      }
      if (toolbarRef.current && !draggedNode && nodes.length > 0) {
        toolbarRef.current.style.setProperty("visibility", "visible");
      }

      // updateNodeToolbarPosition();
    }

    function handleNodesChange(selectedNodes: WeaveSelection[]) {
      if (!instance) return;

      if (
        selectedNodes.length > 1 ||
        (selectedNodes.length === 1 &&
          actualNodeRef.current?.key !== selectedNodes[0].node?.key)
      ) {
        if (
          selectedNodes.length === 1 &&
          selectedNodes[0].node?.type === "video"
        ) {
          const nodeVideo = instance
            .getMainLayer()
            ?.findOne(`#${selectedNodes[0].node?.key}`);

          const nodeHandler = instance.getNodeHandler<WeaveVideoNode>("video");

          if (nodeVideo && nodeHandler) {
            const actualVideoState = nodeHandler.getVideoState(
              nodeVideo as WeaveElementInstance
            );

            if (actualVideoState) {
              setIsVideoPlaying(actualVideoState.playing);
              setIsVideoPaused(actualVideoState.paused);
            }
          }
        }

        setNodeStyleMenuOpen(false);
        setNodeLayeringMenuOpen(false);
        setNodeFillMenuOpen(false);
        setNodeCompositeMenuOpen(false);
        setNodeStrokeMenuOpen(false);
        setNodeStrokeWidthMenuOpen(false);
        setNodeStrokeStyleMenuOpen(false);
        setNodeTextColorMenuOpen(false);
      }

      updateNodeToolbarPosition();
    }

    function updateNodeToolbarPosition() {
      if (!instance) return;

      let hasNodes = false;
      let nodesRect: {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null = null;

      if (node && nodes.length === 1) {
        const nodeId = node.key;
        const stage = instance.getStage();
        const konvaNode = stage?.findOne(`#${nodeId}`);
        if (konvaNode && toolbarRef.current) {
          nodesRect = konvaNode.getClientRect();
          hasNodes = true;
        }
      }

      if (nodes.length > 1) {
        const nodesSelectionPlugin =
          instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

        if (nodesSelectionPlugin) {
          const tr = nodesSelectionPlugin.getTransformer();
          const nodes = tr.nodes();
          nodesRect = instance.getBoundingBox(nodes);
          hasNodes = true;
        }
      }

      if (toolbarRef.current && hasNodes && nodesRect) {
        const nodeWidth = nodesRect.width;
        const nodeHeight = nodesRect.height;
        const domElementBounds = toolbarRef.current.getBoundingClientRect();

        const paddingY = 8;
        const topPos = nodesRect.y + nodeHeight + paddingY;
        let leftPos = nodesRect.x;
        if (domElementBounds.width >= nodeWidth) {
          const amountOverflow = domElementBounds.width - nodeWidth;
          leftPos = leftPos - amountOverflow / 2;
        } else {
          const amountOverflow = nodeWidth - domElementBounds.width;
          leftPos = leftPos + amountOverflow / 2;
        }

        toolbarRef.current.style.setProperty("top", `${topPos}px`);
        toolbarRef.current.style.setProperty("left", `${leftPos}px`);
      }
    }

    if (nodes.length === 0) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      instance.removeEventListener("onDrag", handleOnDrag);
      instance.removeEventListener("onNodesChange", handleNodesChange);
      instance.removeEventListener("onZoomChange", updateNodeToolbarPosition);
      instance.removeEventListener("onStageMove", updateNodeToolbarPosition);
      actualNodeRef.current = undefined;
    }

    if (nodes.length > 0 && toolbarRef.current) {
      const throttledUpdatePosition = throttle(updateNodeToolbarPosition, 10);
      observerRef.current = new ResizeObserver(() => {
        throttledUpdatePosition();
      });

      observerRef.current.observe(toolbarRef.current);

      instance.addEventListener("onDrag", throttle(handleOnDrag, 10));
      instance.addEventListener(
        "onNodesChange",
        throttle(handleNodesChange, 100)
      );
      instance.addEventListener("onZoomChange", throttledUpdatePosition);
      instance.addEventListener("onStageMove", throttledUpdatePosition);
      throttledUpdatePosition();
      actualNodeRef.current = node;
    }

    function handleSelectionChange(active: boolean) {
      setIsSelecting(active);
    }

    instance.addEventListener("onSelectionState", handleSelectionChange);

    return () => {
      if (!instance) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      actualNodeRef.current = undefined;
      instance.removeEventListener("onZoomChange", updateNodeToolbarPosition);
      instance.removeEventListener("onStageMove", updateNodeToolbarPosition);
      instance.removeEventListener("onSelectionState", handleSelectionChange);
    };
  }, [instance, imageCroppingEnabled, node, nodes]);

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
      !["mask", "fuzzy-mask", "image", "video", "color-token"].includes(
        actualNode.type as string
      )
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
    <div
      ref={toolbarRef}
      className="pointer-events-none absolute px-0 py-0 bg-white border rounded-full border-zinc-200"
    >
      <div className="flex gap-0 justify-center items-center">
        <div className="font-inter font-light text-xs px-3 pr-2">
          {title?.toUpperCase()}
        </div>
        <div className="flex gap-[2px] justify-end items-center pr-1 my-1 h-[32px]">
          <ToolbarDivider orientation="vertical" className="!h-[28px]" />
          {!isGroup && isColorTokenNode && (
            <DropdownMenu modal={false} open={colorTokenColorMenuOpen}>
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
                  className="rounded-full min-w-[32px] !w-[32px]"
                  icon={
                    <div
                      className="border border-[#c9c9c9c] w-[16px] h-[16px]"
                      style={{
                        background: actualNode?.props.colorToken,
                      }}
                    />
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  active={nodeFillMenuOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setNodeLayeringMenuOpen(false);
                    setColorTokenColorMenuOpen((prev) => !prev);
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Color</p>
                    </div>
                  }
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
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
                      setColorTokenColorMenuOpen(false);
                    }}
                    className="cursor-pointer font-inter font-light rounded-none w-full"
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
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={<Play className="px-2" size={32} strokeWidth={1} />}
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  active={nodeStyleMenuOpen}
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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
              )}
              {isVideoPlaying && (
                <ToolbarButton
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={<Pause className="px-2" size={32} strokeWidth={1} />}
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  active={nodeStyleMenuOpen}
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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
              )}
              <ToolbarButton
                className="rounded-full !w-[32px] !h-[32px]"
                icon={<RotateCcw className="px-2" size={32} strokeWidth={1} />}
                disabled={!isVideoPlaying && !isVideoPaused}
                active={nodeStyleMenuOpen}
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
                tooltipSide="bottom"
                tooltipAlign="center"
              />
              <ToolbarDivider orientation="vertical" className="!h-[28px]" />
            </>
          )}
          {isImageTemplate && (
            <>
              {!actualNode?.props.isUsed && (
                <ToolbarButton
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={<Link className="px-2" size={32} strokeWidth={1} />}
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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
              )}
              {actualNode?.props.isUsed && (
                <>
                  <DropdownMenu modal={false} open={templateFitMenuOpen}>
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
                        className="rounded-full !w-[32px] !h-[32px]"
                        icon={
                          <ImageUpscale
                            className="px-2"
                            size={32}
                            strokeWidth={1}
                          />
                        }
                        disabled={
                          weaveConnectionStatus !==
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                        }
                        active={nodeStyleMenuOpen}
                        onClick={(e) => {
                          e.preventDefault();
                          setNodeLayeringMenuOpen(false);
                          setTemplateFitMenuOpen((prev) => !prev);
                        }}
                        label={
                          <div className="flex gap-3 justify-start items-center">
                            <p>Template fit</p>
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
                      side="bottom"
                      alignOffset={0}
                      sideOffset={8}
                      className="min-w-auto !p-0 font-inter rounded-2xl !border-zinc-200 shadow-none flex flex-row"
                    >
                      <div className="grid grid-cols-1 gap-1justify-start items-center py-1 px-1">
                        <button
                          onClick={() => {
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

                            setTemplateFitMenuOpen(false);
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

                            setTemplateFitMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-[10px] px-2 py-1 cursor-pointer hover:bg-[#c9c9c9] font-inter uppercase px-3",
                            {
                              ["hover:bg-[#e0e0e0] bg-[#e0e0e0] cursor-auto"]:
                                imageTemplateFit === IMAGE_TEMPLATE_FIT.CONTAIN,
                            }
                          )}
                        >
                          Contain
                        </button>
                        <button
                          onClick={() => {
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

                            setTemplateFitMenuOpen(false);
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

                            setTemplateFitMenuOpen(false);
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
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={<Unlink className="px-2" size={32} strokeWidth={1} />}
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
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                </>
              )}
              <ToolbarDivider orientation="vertical" className="!h-[28px]" />
            </>
          )}
          {!isGroup && canSetNodeStyling && (
            <DropdownMenu modal={false} open={nodeStyleMenuOpen}>
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
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={
                    <Paintbrush className="px-2" size={32} strokeWidth={1} />
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  active={nodeStyleMenuOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setNodeLayeringMenuOpen(false);
                    setNodeStyleMenuOpen((prev) => !prev);
                  }}
                  label={
                    <div className="flex gap-3 justify-start items-center">
                      <p>Styling</p>
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
                side="bottom"
                alignOffset={0}
                sideOffset={8}
                className="min-w-auto !p-0 font-inter rounded-2xl !border-zinc-200 shadow-none flex flex-row"
              >
                <div className="grid grid-cols-[auto_auto] gap-1justify-start items-center py-1 px-1">
                  {isTextNode && (
                    <>
                      <div className="text-[10px] font-inter uppercase px-3">
                        Font color
                      </div>
                      <div className="w-full flex justify-end items-center py-1">
                        <DropdownMenu
                          modal={false}
                          open={nodeTextColorMenuOpen}
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
                              className="rounded-full min-w-[32px] !w-[32px] !h-[32px]"
                              icon={
                                <div
                                  className="border border-[#c9c9c9c] w-[16px] h-[16px]"
                                  style={{ background: actualNode?.props.fill }}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              active={nodeFillMenuOpen}
                              onClick={(e) => {
                                e.preventDefault();
                                setNodeFillMenuOpen(false);
                                setColorTokenColorMenuOpen(false);
                                setNodeTextColorMenuOpen((prev) => !prev);
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Font color</p>
                                </div>
                              }
                              tooltipSide="right"
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
                                  setNodeTextColorMenuOpen(false);
                                }}
                                className="cursor-pointer font-inter font-light rounded-none w-full"
                              >
                                CLOSE
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                  {isFrameNode && (
                    <>
                      <div className="text-[10px] font-inter uppercase px-3">
                        Background color
                      </div>
                      <div className="w-full flex justify-end items-center py-1">
                        <DropdownMenu modal={false} open={nodeFillMenuOpen}>
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
                              className="rounded-full min-w-[32px] !w-[32px] !h-[32px]"
                              icon={
                                <div
                                  className="border border-[#c9c9c9c] w-[16px] h-[16px]"
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
                              active={nodeFillMenuOpen}
                              onClick={(e) => {
                                e.preventDefault();
                                setNodeFillMenuOpen((prev) => !prev);
                                setNodeStrokeMenuOpen(false);
                                // setNodeStrokeWidthMenuOpen(false);
                                // setNodeStrokeStyleMenuOpen(false);
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Background color</p>
                                </div>
                              }
                              tooltipSide="right"
                              tooltipAlign="center"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            side="right"
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
                                  actualNode?.props.frameBackground ?? "#ffffff"
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
                                  setNodeFillMenuOpen(false);
                                  setNodeStrokeMenuOpen(false);
                                  setNodeStrokeWidthMenuOpen(false);
                                  setNodeStrokeStyleMenuOpen(false);
                                }}
                                className="cursor-pointer font-inter font-light rounded-none w-full"
                              >
                                CLOSE
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      <div className="text-[10px] font-inter uppercase px-3">
                        Fill color
                      </div>
                      <div className="w-full flex justify-end items-center py-1">
                        <DropdownMenu modal={false} open={nodeFillMenuOpen}>
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
                              className="rounded-full min-w-[32px] !w-[32px] !h-[32px]"
                              icon={
                                <div
                                  className="border border-[#c9c9c9c] w-[16px] h-[16px]"
                                  style={{
                                    background: actualNode?.props.fill,
                                  }}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              active={nodeFillMenuOpen}
                              onClick={(e) => {
                                e.preventDefault();
                                setNodeFillMenuOpen((prev) => !prev);
                                setNodeStrokeMenuOpen(false);
                                // setNodeStrokeWidthMenuOpen(false);
                                // setNodeStrokeStyleMenuOpen(false);
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Fill color</p>
                                </div>
                              }
                              tooltipSide="right"
                              tooltipAlign="center"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            side="right"
                            alignOffset={0}
                            sideOffset={8}
                            className="min-w-auto font-inter rounded-none shadow-none flex flex-row"
                          >
                            <div
                              className="flex !flex-col gap-0 w-[300px] p-4"
                              onClick={(e) => e.preventDefault()}
                            >
                              <ColorPickerInput
                                value={actualNode?.props.fill ?? "#ffffff"}
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
                                  setNodeFillMenuOpen(false);
                                  setNodeStrokeMenuOpen(false);
                                  setNodeStrokeWidthMenuOpen(false);
                                  setNodeStrokeStyleMenuOpen(false);
                                }}
                                className="cursor-pointer font-inter font-light rounded-none w-full"
                              >
                                CLOSE
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="col-span-2 w-full !h-[1px] bg-zinc-200"></div>
                      <div className="text-[10px] font-inter uppercase px-3">
                        Stroke color
                      </div>
                      <div className="w-full flex justify-end items-center py-1">
                        <DropdownMenu modal={false} open={nodeStrokeMenuOpen}>
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
                              className="rounded-full min-w-[32px] !w-[32px] !h-[32px]"
                              icon={
                                <div
                                  className="border border-[#c9c9c9c] w-[16px] h-[16px]"
                                  style={{
                                    background: actualNode?.props.stroke,
                                  }}
                                />
                              }
                              disabled={
                                weaveConnectionStatus !==
                                WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                              }
                              active={nodeStrokeMenuOpen}
                              onClick={(e) => {
                                e.preventDefault();
                                setNodeFillMenuOpen(false);
                                setNodeStrokeMenuOpen((prev) => !prev);
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Stroke color</p>
                                </div>
                              }
                              tooltipSide="right"
                              tooltipAlign="center"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            side="right"
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
                                  setNodeFillMenuOpen(false);
                                  setNodeStrokeMenuOpen(false);
                                  setNodeStrokeWidthMenuOpen(false);
                                  setNodeStrokeStyleMenuOpen(false);
                                }}
                                className="cursor-pointer font-inter font-light rounded-none w-full"
                              >
                                CLOSE
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="col-span-2 w-full !h-[1px] bg-zinc-200"></div>
                      <div className="text-[10px] font-inter uppercase px-3">
                        Stroke width
                      </div>
                      <div className="w-full flex justify-end items-center py-1">
                        <DropdownMenu
                          modal={false}
                          open={nodeStrokeWidthMenuOpen}
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
                              className="rounded-full !w-[32px] !h-[32px]"
                              icon={
                                actualNode?.props.strokeWidth === 0 ? (
                                  <X
                                    className="px-2"
                                    size={32}
                                    strokeWidth={1}
                                  />
                                ) : (
                                  <div
                                    className="w-[16px] rounded-full"
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
                                setNodeFillMenuOpen(false);
                                setNodeStrokeMenuOpen(false);
                                setNodeStrokeWidthMenuOpen((prev) => !prev);
                                setNodeStrokeStyleMenuOpen(false);
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Stroke width</p>
                                </div>
                              }
                              tooltipSide="right"
                              tooltipAlign="center"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            onCloseAutoFocus={(e) => {
                              e.preventDefault();
                            }}
                            align="center"
                            side="right"
                            alignOffset={0}
                            sideOffset={8}
                            className="min-w-auto font-inter shadow-none flex flex-row rounded-full rounded-l-none"
                          >
                            <div className="flex gap-1">
                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
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
                                  setNodeStrokeWidthMenuOpen(false);

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
                                tooltipAlign="center"
                              />
                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
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
                                  setNodeStrokeWidthMenuOpen(false);

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
                                tooltipAlign="center"
                              />
                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
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
                                  setNodeStrokeWidthMenuOpen(false);

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
                                tooltipAlign="center"
                              />

                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
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
                                  setNodeStrokeWidthMenuOpen(false);

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
                                tooltipAlign="center"
                              />
                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
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
                                  setNodeStrokeWidthMenuOpen(false);

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
                                tooltipAlign="center"
                              />

                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
                                icon={
                                  <X
                                    className="px-2"
                                    size={32}
                                    strokeWidth={1}
                                  />
                                }
                                disabled={
                                  weaveConnectionStatus !==
                                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                                }
                                onClick={() => {
                                  setNodeStrokeWidthMenuOpen(false);

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
                                tooltipAlign="center"
                              />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="col-span-2 w-full !h-[1px] bg-zinc-200"></div>
                      <div className="text-[10px] font-inter uppercase px-3">
                        Stroke style
                      </div>
                      <div className="w-full flex justify-end items-center py-1">
                        <DropdownMenu
                          modal={false}
                          open={nodeStrokeStyleMenuOpen}
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
                              className="rounded-full !w-[32px] !h-[32px]"
                              icon={
                                <div
                                  className="w-[16px] rounded-full"
                                  style={{
                                    height:
                                      (actualNode?.props.strokeWidth ?? 0) === 0
                                        ? 1
                                        : (actualNode?.props.strokeWidth ?? 0),
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
                                setNodeFillMenuOpen(false);
                                setNodeStrokeMenuOpen(false);
                                setNodeStrokeWidthMenuOpen(false);
                                setNodeStrokeStyleMenuOpen((prev) => !prev);
                              }}
                              label={
                                <div className="flex gap-3 justify-start items-center">
                                  <p>Stroke style</p>
                                </div>
                              }
                              tooltipSide="right"
                              tooltipAlign="center"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            onCloseAutoFocus={(e) => {
                              e.preventDefault();
                            }}
                            align="center"
                            side="right"
                            alignOffset={0}
                            sideOffset={8}
                            className="min-w-auto font-inter shadow-none flex flex-row rounded-full rounded-l-none"
                          >
                            <div className="flex gap-1">
                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
                                icon={
                                  <div
                                    className="w-[24px] rounded-full"
                                    style={{
                                      height:
                                        (actualNode?.props.strokeWidth ?? 0) ===
                                        0
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
                                  setNodeStrokeStyleMenuOpen(false);

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
                                tooltipAlign="center"
                              />
                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
                                icon={
                                  <div
                                    className="w-[24px] rounded-full"
                                    style={{
                                      height:
                                        (actualNode?.props.strokeWidth ?? 0) ===
                                        0
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
                                  setNodeStrokeStyleMenuOpen(false);

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
                                tooltipAlign="center"
                              />

                              <ToolbarButton
                                className="rounded-full !w-[32px] !h-[32px]"
                                icon={
                                  <div
                                    className="w-[24px] rounded-full"
                                    style={{
                                      height:
                                        (actualNode?.props.strokeWidth ?? 0) ===
                                        0
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
                                  setNodeStrokeStyleMenuOpen(false);

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
                                tooltipAlign="center"
                              />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                className="rounded-full !w-[32px] !h-[32px]"
                icon={
                  <HardDriveUpload className="px-2" size={32} strokeWidth={1} />
                }
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
                    <p>Set as link</p>
                  </div>
                }
                tooltipSide="bottom"
                tooltipAlign="center"
              />
              <ToolbarDivider orientation="vertical" className="!h-[28px]" />
              {workloadsEnabled && (
                <>
                  <ToolbarButton
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={
                      <BrushCleaning
                        className="px-2"
                        size={32}
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
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={<Minus className="px-2" size={32} strokeWidth={1} />}
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
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={
                      <FlipHorizontal
                        className="px-2"
                        size={32}
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
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={
                      <FlipVertical
                        className="px-2"
                        size={32}
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
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                  <ToolbarButton
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={
                      <PaintRoller className="px-2" size={32} strokeWidth={1} />
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
                    tooltipSide="bottom"
                    tooltipAlign="center"
                  />
                </>
              )}
              <ToolbarButton
                className="rounded-full !w-[32px] !h-[32px]"
                icon={<Crop className="px-2" size={32} strokeWidth={1} />}
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
                tooltipSide="bottom"
                tooltipAlign="center"
              />
              <ToolbarDivider orientation="vertical" className="!h-[28px]" />
            </>
          )}
          {isMultiNodesSelected && (
            <>
              <DropdownMenu
                modal={false}
                open={nodesAlignmentHorizontalMenuOpen}
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
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={
                      <UnfoldHorizontal
                        className="px-2"
                        size={32}
                        strokeWidth={1}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={nodesAlignmentHorizontalMenuOpen}
                    onClick={(e) => {
                      e.preventDefault();
                      setNodeLayeringMenuOpen(false);
                      setNodesAlignmentHorizontalMenuOpen((prev) => !prev);
                      setNodesAlignmentVerticalMenuOpen(false);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Align Horizontal</p>
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
                  side="bottom"
                  alignOffset={0}
                  sideOffset={8}
                  className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
                >
                  <div className="flex gap-1">
                    <ToolbarButton
                      className="rounded-full !w-[32px] !h-[32px]"
                      icon={
                        <AlignHorizontalJustifyStart
                          className="px-2"
                          size={32}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setNodesAlignmentHorizontalMenuOpen(false);

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
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[32px] !h-[32px]"
                      icon={
                        <AlignHorizontalJustifyCenter
                          className="px-2"
                          size={32}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setNodesAlignmentHorizontalMenuOpen(false);

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
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[32px] !h-[32px]"
                      icon={
                        <AlignHorizontalJustifyEnd
                          className="px-2"
                          size={32}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setNodesAlignmentHorizontalMenuOpen(false);

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
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu modal={false} open={nodesAlignmentVerticalMenuOpen}>
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
                    className="rounded-full !w-[32px] !h-[32px]"
                    icon={
                      <UnfoldVertical
                        className="px-2"
                        size={32}
                        strokeWidth={1}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                    }
                    active={nodesAlignmentVerticalMenuOpen}
                    onClick={(e) => {
                      e.preventDefault();
                      setNodeLayeringMenuOpen(false);
                      setNodesAlignmentHorizontalMenuOpen(false);
                      setNodesAlignmentVerticalMenuOpen((prev) => !prev);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Align Vertical</p>
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
                  side="bottom"
                  alignOffset={0}
                  sideOffset={8}
                  className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
                >
                  <div className="flex gap-1">
                    <ToolbarButton
                      className="rounded-full !w-[32px] !h-[32px]"
                      icon={
                        <AlignVerticalJustifyStart
                          className="px-2"
                          size={32}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setNodesAlignmentHorizontalMenuOpen(false);

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
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[32px] !h-[32px]"
                      icon={
                        <AlignVerticalJustifyCenter
                          className="px-2"
                          size={32}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setNodesAlignmentHorizontalMenuOpen(false);

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
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                    <ToolbarButton
                      className="rounded-full !w-[32px] !h-[32px]"
                      icon={
                        <AlignVerticalJustifyEnd
                          className="px-2"
                          size={32}
                          strokeWidth={1}
                        />
                      }
                      disabled={
                        weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                      }
                      onClick={() => {
                        setNodesAlignmentHorizontalMenuOpen(false);

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
                      tooltipSide="bottom"
                      tooltipAlign="center"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <DropdownMenu modal={false} open={nodeCompositeMenuOpen}>
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
                className="rounded-full !w-[32px] !h-[32px]"
                icon={
                  <RectangleCircle className="px-2" size={32} strokeWidth={1} />
                }
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                active={nodeCompositeMenuOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setNodesAlignmentHorizontalMenuOpen(false);
                  setNodesAlignmentVerticalMenuOpen(false);
                  setNodeStyleMenuOpen(false);
                  setColorTokenColorMenuOpen(false);
                  setNodeLayeringMenuOpen(false);
                  setNodeCompositeMenuOpen((prev) => !prev);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Composite</p>
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
              side="bottom"
              alignOffset={0}
              sideOffset={8}
              className="min-w-auto max-h-[200px] !p-0 font-inter rounded-none !border-zinc-200 shadow-none flex flex-row"
            >
              <div className="w-[120px] h-full flex flex-col gap-0 justify-center items-center py-1 px-1">
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">source-over</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === undefined ||
                    actualNode?.props.globalCompositeOperation === "source-over"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                {/* <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={
                    <span className="font-inter text-xs">destination-out</span>
                  }
                  active={
                    actualNode?.props.globalCompositeOperation ===
                    "destination-out"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

                    if (!actualNode) {
                      return;
                    }

                    const updatedNode: WeaveStateElement = {
                      ...actualNode,
                      props: {
                        ...actualNode.props,
                        globalCompositeOperation: "destination-out",
                      },
                    };

                    updateElement(updatedNode);
                  }}
                  tooltipSide="bottom"
                  tooltipAlign="center"
                /> */}
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">multiply</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "multiply"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
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
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
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
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
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
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
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
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">color-dodge</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "color-dodge"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">color-burn</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "color-burn"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">hard-light</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "hard-light"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">soft-light</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "soft-light"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">difference</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "difference"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">exclusion</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "exclusion"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">hue</span>}
                  active={actualNode?.props.globalCompositeOperation === "hue"}
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">saturation</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "saturation"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
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
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-none !w-full !h-[32px] !min-h-[32px]"
                  icon={<span className="font-inter text-xs">luminosity</span>}
                  active={
                    actualNode?.props.globalCompositeOperation === "luminosity"
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeCompositeMenuOpen(false);

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
                  tooltipSide="bottom"
                  tooltipAlign="center"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu modal={false} open={nodeLayeringMenuOpen}>
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
                className="rounded-full !w-[32px] !h-[32px]"
                icon={<Layers className="px-2" size={32} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                active={nodeLayeringMenuOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setNodesAlignmentHorizontalMenuOpen(false);
                  setNodesAlignmentVerticalMenuOpen(false);
                  setNodeStyleMenuOpen(false);
                  setColorTokenColorMenuOpen(false);
                  setNodeLayeringMenuOpen((prev) => !prev);
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
              align="center"
              side="bottom"
              alignOffset={0}
              sideOffset={8}
              className="min-w-auto !p-0 font-inter rounded-full !border-zinc-200 shadow-none flex flex-row"
            >
              <div className="flex gap-0 justify-center items-center py-1 px-1">
                <ToolbarButton
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={
                    <BringToFront className="px-2" size={32} strokeWidth={1} />
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeLayeringMenuOpen(false);

                    if (!instance) {
                      return;
                    }

                    const nodeInstance = instance
                      .getStage()
                      .findOne(`#${node?.key}`);

                    if (!nodeInstance) {
                      return;
                    }

                    instance.bringToFront(nodeInstance as WeaveElementInstance);
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
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={<ArrowUp className="px-2" size={32} strokeWidth={1} />}
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeLayeringMenuOpen(false);

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
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={
                    <ArrowDown className="px-2" size={32} strokeWidth={1} />
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeLayeringMenuOpen(false);

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
                  className="rounded-full !w-[32px] !h-[32px]"
                  icon={
                    <SendToBack className="px-2" size={32} strokeWidth={1} />
                  }
                  disabled={
                    weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                  }
                  onClick={() => {
                    setNodeLayeringMenuOpen(false);

                    if (!instance) {
                      return;
                    }

                    const nodeInstance = instance
                      .getStage()
                      .findOne(`#${node?.key}`);

                    if (!nodeInstance) {
                      return;
                    }

                    instance.sendToBack(nodeInstance as WeaveElementInstance);
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
          <ToolbarDivider orientation="vertical" className="!h-[28px]" />
          {isMultiNodesSelected && (
            <ToolbarButton
              className="rounded-full !w-[32px] !h-[32px]"
              icon={<Group className="px-2" size={32} strokeWidth={1} />}
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
              tooltipSide="bottom"
              tooltipAlign="center"
            />
          )}
          {isGroup && (
            <ToolbarButton
              className="rounded-full !w-[32px] !h-[32px]"
              icon={<Ungroup className="px-2" size={32} strokeWidth={1} />}
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
            className="rounded-full !w-[32px] !h-[32px]"
            icon={<Lock className="px-2" size={32} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              setNodeLayeringMenuOpen(false);
              setNodeStyleMenuOpen(false);

              if (!instance) {
                return;
              }

              const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

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
            className="rounded-full !w-[32px] !h-[32px]"
            icon={<EyeOff className="px-2" size={32} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              setNodeLayeringMenuOpen(false);
              setNodeStyleMenuOpen(false);

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
            className="rounded-full !w-[32px] !h-[32px]"
            icon={<Copy className="px-2" size={32} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={async () => {
              setNodeLayeringMenuOpen(false);
              setNodeStyleMenuOpen(false);

              if (!instance) {
                return;
              }

              const weaveCopyPasteNodesPlugin =
                instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
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
            className="rounded-full !w-[32px] !h-[32px]"
            icon={<Trash className="px-2" size={32} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              setNodeLayeringMenuOpen(false);
              setNodeStyleMenuOpen(false);

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
          {isSingleNodeSelected && (
            <>
              <ToolbarDivider orientation="vertical" className="!h-[28px]" />
              <ToolbarButton
                className="rounded-full !w-[32px] !h-[32px]"
                icon={<Settings className="px-2" size={32} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                  typeof nodePropertiesAction === "undefined" ||
                  typeof actualNode === "undefined" ||
                  (typeof actualNode === "undefined" && nodes.length < 2)
                }
                onClick={() => {
                  setNodeLayeringMenuOpen(false);
                  setNodeStyleMenuOpen(false);
                  setSidebarActive(SIDEBAR_ELEMENTS.nodeProperties, "right");
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
                tooltipSide="bottom"
                tooltipAlign="center"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
