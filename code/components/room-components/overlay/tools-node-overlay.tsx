// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import Konva from "konva";
import { ToolbarButton } from "../toolbar/toolbar-button";
import {
  Trash,
  Copy,
  Lock,
  EyeOff,
  Layers,
  BringToFront,
  ArrowUp,
  ArrowDown,
  SendToBack,
  PanelRight,
  Ungroup,
  X,
  BrushCleaning,
  Bot,
  Crop,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { rightElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { cn, SYSTEM_OS } from "@/lib/utils";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import {
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveElementInstance,
  WeaveStateElement,
} from "@inditextech/weave-types";
import { ToolbarDivider } from "../toolbar/toolbar-divider";
import { ShortcutElement } from "../help/shortcut-element";
import {
  WEAVE_IMAGE_CROP_END_TYPE,
  WeaveCopyPasteNodesPlugin,
  WeaveExportNodesActionParams,
} from "@inditextech/weave-sdk";
import { Button } from "@/components/ui/button";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { postRemoveBackground } from "@/api/post-remove-background";
import { useIACapabilities } from "@/store/ia";
import { ColorPickerInput } from "../inputs/color-picker";

export function ToolsNodeOverlay() {
  useKeyboardHandler();

  const [actualNodeKey, setActualNodeKey] = React.useState("");
  const [colorTokenColorMenuOpen, setColorTokenColorMenuOpen] =
    React.useState(false);
  const [nodeTextColorMenuOpen, setNodeTextColorMenuOpen] =
    React.useState(false);
  const [nodeFillMenuOpen, setNodeFillMenuOpen] = React.useState(false);
  const [nodeStrokeMenuOpen, setNodeStrokeMenuOpen] = React.useState(false);
  const [nodeStrokeWidthMenuOpen, setNodeStrokeWidthMenuOpen] =
    React.useState(false);
  const [nodeStrokeStyleMenuOpen, setNodeStrokeStyleMenuOpen] =
    React.useState(false);
  const [nodeLayeringMenuOpen, setNodeLayeringMenuOpen] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const room = useCollaborationRoom((state) => state.room);
  const showUI = useCollaborationRoom((state) => state.ui.show);
  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled
  );
  const imageCroppingNode = useCollaborationRoom(
    (state) => state.images.cropping.node
  );
  const nodePropertiesAction: "create" | "update" | undefined =
    useCollaborationRoom((state) => state.nodeProperties.action);
  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps
  );

  const setTransformingImage = useCollaborationRoom(
    (state) => state.setTransformingImage
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const setNodePropertiesAction = useCollaborationRoom(
    (state) => state.setNodePropertiesAction
  );

  const aiEnabled = useIACapabilities((state) => state.enabled);
  const setImagesLLMPopupSelectedNodes = useIACapabilities(
    (state) => state.setImagesLLMPopupSelectedNodes
  );
  const setImagesLLMPopupType = useIACapabilities(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
  );
  const setImagesLLMPopupImage = useIACapabilities(
    (state) => state.setImagesLLMPopupImage
  );

  const mutationUpload = useMutation({
    mutationFn: async (imageId: string) => {
      return await postRemoveBackground(room ?? "", imageId);
    },
  });

  React.useEffect(() => {
    if (
      actualAction &&
      [
        "rectangleTool",
        "ellipseTool",
        "regularPolygonTool",
        "brushTool",
        "penTool",
        "imageTool",
        "starTool",
        "arrowTool",
        "colorTokenTool",
        "frameTool",
        "textTool",
        "fuzzyMaskTool",
      ].includes(actualAction)
    ) {
      setNodePropertiesAction("create");
      return;
    }

    if (!actualAction || !node) {
      setNodePropertiesAction(undefined);
      setSidebarActive(null, "right");
      return;
    }

    if (node) {
      setNodePropertiesAction("update");
    }
  }, [actualAction, node, setSidebarActive, setNodePropertiesAction]);

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
    if (!actualNode) {
      return;
    }
    if (!actualAction) {
      return;
    }

    if (actualNode.key !== actualNodeKey) {
      setActualNodeKey(actualNode.key);
      setNodeLayeringMenuOpen(false);
      setNodeFillMenuOpen(false);
      setNodeStrokeMenuOpen(false);
      setNodeStrokeWidthMenuOpen(false);
      setNodeStrokeStyleMenuOpen(false);
      setColorTokenColorMenuOpen(false);
      setNodeTextColorMenuOpen(false);
    }
  }, [actualAction, actualNode, actualNodeKey, nodePropertiesAction]);

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

  const nodeDashBackground = React.useMemo(() => {
    if (!actualNode) {
      return "transparent";
    }

    switch ((actualNode.props.dash ?? []).join(",")) {
      case "":
        return actualNode.props.stroke;
      case "5,5":
        return `repeating-linear-gradient(90deg, ${actualNode.props.stroke} 0px, ${actualNode.props.stroke} 2px, transparent 2px, transparent 4px)`;
      case "10,10":
        return `repeating-linear-gradient(90deg, ${actualNode.props.stroke} 0px, ${actualNode.props.stroke} 4px, transparent 4px, transparent 8px)`;

      default:
        break;
    }
  }, [actualNode]);

  const isGroup = React.useMemo(
    () =>
      nodes.length === 1 && actualNode && (actualNode.type ?? "") === "group",
    [actualNode, nodes]
  );

  const singleLocked = React.useMemo(() => {
    return nodes.length === 1 && nodes[0].instance.getAttrs().locked;
  }, [nodes]);

  const imageEditionTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode) {
      return [];
    }

    if (
      nodes.length === 1 &&
      ["image"].includes(nodes[0].node?.type ?? "") &&
      !singleLocked
    ) {
      actualNodeTools.push(
        <React.Fragment key="image-edition-tools">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<BrushCleaning className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              if (!instance) {
                return;
              }

              const nodeImage = nodes[0].instance as Konva.Group | undefined;

              if (nodeImage) {
                nodeImage.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);

                const nodeImageInternal = nodeImage?.findOne(
                  `#${nodeImage.getAttrs().id}-image`
                );
                const imageTokens = nodeImageInternal
                  ?.getAttr("image")
                  .src.split("/");
                const imageId = imageTokens[imageTokens.length - 1];
                setTransformingImage(true);
                mutationUpload.mutate(imageId, {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onSuccess: (data: any) => {
                    const room = data.fileName.split("/")[0];
                    const imageId = data.fileName.split("/")[1];

                    const { finishUploadCallback } = instance.triggerAction(
                      "imageTool"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ) as any;

                    instance.updatePropsAction("imageTool", { imageId });

                    finishUploadCallback(
                      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/weavejs/rooms/${room}/images/${imageId}`
                    );
                  },
                  onError: () => {
                    console.error("Error uploading image");
                  },
                  onSettled: () => {
                    setTransformingImage(false);
                  },
                });
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
            className="rounded-full !w-[40px]"
            icon={<Bot className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !==
                WEAVE_STORE_CONNECTION_STATUS.CONNECTED || !aiEnabled
            }
            onClick={async () => {
              if (!instance) {
                return;
              }

              const image = await instance.triggerAction<
                WeaveExportNodesActionParams,
                Promise<HTMLImageElement>
              >("exportNodesTool", {
                nodes: nodes.map((n) => n.instance),
                options: {
                  padding: 0,
                  pixelRatio: 1,
                },
              });

              const base64URL: unknown = instance.imageToBase64(
                image,
                "image/png"
              );

              setImagesLLMPopupSelectedNodes(nodes.map((n) => n.instance));
              setImagesLLMPopupType("edit-prompt");
              setImagesLLMPopupImage(base64URL as string);
              setImagesLLMPopupVisible(true);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Edit with AI</p>
              </div>
            }
            tooltipSide="left"
            tooltipAlign="center"
          />
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [
    aiEnabled,
    instance,
    mutationUpload,
    nodes,
    actualNode,
    setImagesLLMPopupImage,
    setImagesLLMPopupSelectedNodes,
    setImagesLLMPopupType,
    setImagesLLMPopupVisible,
    setTransformingImage,
    singleLocked,
    weaveConnectionStatus,
  ]);

  const colorTokenTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode) {
      return [];
    }

    if (
      (nodes.length === 1 &&
        ["color-token"].includes(actualNode.type as string)) ||
      ["colorTokenTool"].includes(actualAction as string)
    ) {
      actualNodeTools.push(
        <React.Fragment key="color-token-tools">
          <div className="w-[40px] text-[9px] text-center font-inter uppercase pt-3">
            Color token
          </div>
          <DropdownMenu modal={false} open={colorTokenColorMenuOpen}>
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
                className="rounded-full min-w-[40px] !w-[40px]"
                icon={
                  <div
                    className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                    style={{ background: actualNode.props.colorToken }}
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
                  setNodeFillMenuOpen(false);
                  setNodeStrokeMenuOpen(false);
                  setNodeStrokeWidthMenuOpen(false);
                  setNodeStrokeStyleMenuOpen(false);
                  setColorTokenColorMenuOpen((prev) => !prev);
                  setNodeTextColorMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Color token</p>
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
                className="flex !flex-col gap-0 w-[300px]"
                onClick={(e) => e.preventDefault()}
              >
                <ColorPickerInput
                  value={actualNode.props.colorToken ?? "#ffffff"}
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
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [
    nodes,
    actualNode,
    actualAction,
    colorTokenColorMenuOpen,
    weaveConnectionStatus,
    nodeFillMenuOpen,
    updateElement,
  ]);

  const textTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode) {
      return [];
    }

    if (
      (nodes.length === 1 && ["text"].includes(actualNode.type as string)) ||
      ["textTool"].includes(actualAction as string)
    ) {
      actualNodeTools.push(
        <React.Fragment key="text-tools">
          <div className="w-[40px] text-[9px] text-center font-inter uppercase pt-3">
            Text color
          </div>
          <DropdownMenu modal={false} open={nodeTextColorMenuOpen}>
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
                className="rounded-full min-w-[40px] !w-[40px]"
                icon={
                  <div
                    className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                    style={{ background: actualNode.props.fill }}
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
                  setNodeFillMenuOpen(false);
                  setNodeStrokeMenuOpen(false);
                  setNodeStrokeWidthMenuOpen(false);
                  setNodeStrokeStyleMenuOpen(false);
                  setColorTokenColorMenuOpen(false);
                  setNodeTextColorMenuOpen((prev) => !prev);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Text color</p>
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
                className="flex !flex-col gap-0 w-[300px]"
                onClick={(e) => e.preventDefault()}
              >
                <ColorPickerInput
                  value={actualNode.props.colorToken ?? "#ffffff"}
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
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [
    actualNode,
    nodes,
    actualAction,
    nodeTextColorMenuOpen,
    weaveConnectionStatus,
    nodeFillMenuOpen,
    updateElement,
  ]);

  const commonShapeManagementTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode || imageCroppingEnabled) {
      return [];
    }

    if (nodePropertiesAction === "update" && nodes.length === 1) {
      actualNodeTools.push(
        <React.Fragment key="common-shape-management-tools">
          {isGroup && (
            <ToolbarButton
              className="rounded-full !w-[40px]"
              icon={<Ungroup className="px-2" size={40} strokeWidth={1} />}
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
                className="rounded-full !w-[40px]"
                icon={<Layers className="px-2" size={40} strokeWidth={1} />}
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                active={nodeLayeringMenuOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setNodeLayeringMenuOpen((prev) => !prev);
                  setNodeFillMenuOpen(false);
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
              align="center"
              side="right"
              alignOffset={0}
              sideOffset={8}
              className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
            >
              <div className="flex gap-1">
                <ToolbarButton
                  className="rounded-full !w-[40px]"
                  icon={
                    <BringToFront className="px-2" size={40} strokeWidth={1} />
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
                  tooltipSide="top"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-full !w-[40px]"
                  icon={<ArrowUp className="px-2" size={40} strokeWidth={1} />}
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
                  tooltipSide="top"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-full !w-[40px]"
                  icon={
                    <ArrowDown className="px-2" size={40} strokeWidth={1} />
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
                          [SYSTEM_OS.MAC]: "⌘ ]",
                          [SYSTEM_OS.OTHER]: "Ctrl ]",
                        }}
                      />
                    </div>
                  }
                  tooltipSide="top"
                  tooltipAlign="center"
                />
                <ToolbarButton
                  className="rounded-full !w-[40px]"
                  icon={
                    <SendToBack className="px-2" size={40} strokeWidth={1} />
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
                          [SYSTEM_OS.MAC]: "J",
                          [SYSTEM_OS.OTHER]: "J",
                        }}
                      />
                    </div>
                  }
                  tooltipSide="top"
                  tooltipAlign="center"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarDivider orientation="horizontal" className="col-span-1" />
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<Lock className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              setNodeLayeringMenuOpen(false);
              setNodeFillMenuOpen(false);

              if (!instance) {
                return;
              }

              const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

              if (!nodeInstance) {
                return;
              }

              instance.lockNode(nodeInstance as WeaveElementInstance);
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
            className="rounded-full !w-[40px]"
            icon={<EyeOff className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              setNodeLayeringMenuOpen(false);
              setNodeFillMenuOpen(false);

              if (!instance) {
                return;
              }

              const nodeInstance = instance.getStage().findOne(`#${node?.key}`);

              if (!nodeInstance) {
                return;
              }

              instance.hideNode(nodeInstance as WeaveElementInstance);
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
            className="rounded-full !w-[40px]"
            icon={<Copy className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={async () => {
              setNodeLayeringMenuOpen(false);
              setNodeFillMenuOpen(false);

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
            tooltipSide="left"
            tooltipAlign="center"
          />
          <ToolbarDivider orientation="horizontal" className="col-span-1" />
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<Trash className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              setNodeLayeringMenuOpen(false);
              setNodeFillMenuOpen(false);

              if (!instance) {
                return;
              }

              instance.removeNode(actualNode);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Delete</p>
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
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [
    actualNode,
    imageCroppingEnabled,
    nodePropertiesAction,
    isGroup,
    weaveConnectionStatus,
    nodeLayeringMenuOpen,
    instance,
    nodes,
    node?.key,
  ]);

  const commonShapeTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode) {
      return [];
    }

    if (
      !isGroup &&
      !["mask", "fuzzy-mask", "text", "image", "frame", "color-token"].includes(
        actualNode.type as string
      ) &&
      !["colorTokenTool", "imageTool", "imagesTool"].includes(
        actualAction as string
      )
    ) {
      actualNodeTools.push(
        <React.Fragment key="common-shape-tools">
          {!["image"].includes(actualNode.type) && (
            <>
              <div className="w-[40px] text-[9px] text-center font-inter uppercase pt-3">
                Fill
              </div>
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
                    className="rounded-full min-w-[40px] !w-[40px]"
                    icon={
                      <div
                        className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                        style={{ background: actualNode.props.fill }}
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
                      setNodeFillMenuOpen((prev) => !prev);
                      setNodeStrokeMenuOpen(false);
                      setNodeStrokeWidthMenuOpen(false);
                      setNodeStrokeStyleMenuOpen(false);
                    }}
                    label={
                      <div className="flex gap-3 justify-start items-center">
                        <p>Fill</p>
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
                      value={actualNode.props.fill ?? "#ffffff"}
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
                      }}
                      className="cursor-pointer font-inter font-light rounded-none w-full"
                    >
                      CLOSE
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <ToolbarDivider orientation="horizontal" className="col-span-1" />
            </>
          )}
          <div
            className={cn(
              "w-[40px] text-[9px] text-center font-inter uppercase pt-3",
              {
                ["pt-0"]: !["image"].includes(actualNode.type),
              }
            )}
          >
            Stroke
          </div>
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
                className="rounded-full min-w-[40px] !w-[40px]"
                icon={
                  <div
                    className="border border-[#c9c9c9c] w-[20px] h-[20px]"
                    style={{ background: actualNode.props.stroke }}
                  />
                }
                disabled={
                  weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED
                }
                active={nodeStrokeMenuOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setNodeLayeringMenuOpen(false);
                  setNodeFillMenuOpen(false);
                  setNodeStrokeMenuOpen((prev) => !prev);
                  setNodeStrokeWidthMenuOpen(false);
                  setNodeStrokeStyleMenuOpen(false);
                }}
                label={
                  <div className="flex gap-3 justify-start items-center">
                    <p>Stroke</p>
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
                className="flex !flex-col gap-0 w-[300px]"
                onClick={(e) => e.preventDefault()}
              >
                <ColorPickerInput
                  value={actualNode.props.stroke ?? "#ffffff"}
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
                    setNodeStrokeMenuOpen(false);
                  }}
                  className="cursor-pointer font-inter font-light rounded-none w-full"
                >
                  CLOSE
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-[40px] text-[9px] text-center font-inter uppercase pt-0">
            Width
          </div>
          <DropdownMenu modal={false} open={nodeStrokeWidthMenuOpen}>
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
                className="rounded-full !w-[40px]"
                icon={
                  actualNode.props.strokeWidth === 0 ? (
                    <X className="px-2" size={40} strokeWidth={1} />
                  ) : (
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height: actualNode.props.strokeWidth,
                        background: actualNode.props.stroke,
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
                  setNodeLayeringMenuOpen(false);
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
                tooltipSide="left"
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
              className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
            >
              <div className="flex gap-1">
                <ToolbarButton
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[30px] rounded-full"
                      style={{
                        height: 20,
                        background: actualNode.props.stroke,
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
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height: 10,
                        background: actualNode.props.stroke,
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
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height: 5,
                        background: actualNode.props.stroke,
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
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height: 2,
                        background: actualNode.props.stroke,
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
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height: 1,
                        background: actualNode.props.stroke,
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
                  className="rounded-full !w-[40px]"
                  icon={<X className="px-2" size={40} strokeWidth={1} />}
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
          <div className="w-[40px] text-[9px] text-center font-inter uppercase pt-0">
            Style
          </div>
          <DropdownMenu modal={false} open={nodeStrokeStyleMenuOpen}>
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
                className="rounded-full !w-[40px]"
                icon={
                  <div
                    className="w-[20px] rounded-full"
                    style={{
                      height:
                        (actualNode.props.strokeWidth ?? 0) === 0
                          ? 1
                          : (actualNode.props.strokeWidth ?? 0),
                      background: nodeDashBackground,
                    }}
                  />
                }
                disabled={
                  weaveConnectionStatus !==
                    WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                  (actualNode.props.strokeWidth ?? 0) === 0
                }
                onClick={(e) => {
                  e.preventDefault();
                  setNodeLayeringMenuOpen(false);
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
                tooltipSide="left"
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
              className="min-w-auto font-inter rounded-none shadow-none flex flex-row rounded-full"
            >
              <div className="flex gap-1">
                <ToolbarButton
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height:
                          (actualNode.props.strokeWidth ?? 0) === 0
                            ? 1
                            : (actualNode.props.strokeWidth ?? 0),
                        background: `repeating-linear-gradient(90deg, ${actualNode.props.stroke} 0px, ${actualNode.props.stroke} 4px, transparent 4px, transparent 8px)`,
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
                        dash: [10, 10],
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
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height:
                          (actualNode.props.strokeWidth ?? 0) === 0
                            ? 1
                            : (actualNode.props.strokeWidth ?? 0),
                        background: `repeating-linear-gradient(90deg, ${actualNode.props.stroke} 0px, ${actualNode.props.stroke} 2px, transparent 2px, transparent 4px)`,
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
                        dash: [5, 5],
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
                  className="rounded-full !w-[40px]"
                  icon={
                    <div
                      className="w-[20px] rounded-full"
                      style={{
                        height:
                          (actualNode.props.strokeWidth ?? 0) === 0
                            ? 1
                            : (actualNode.props.strokeWidth ?? 0),
                        background: actualNode.props.stroke,
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
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [
    actualNode,
    isGroup,
    actualAction,
    nodeFillMenuOpen,
    weaveConnectionStatus,
    nodeStrokeMenuOpen,
    nodeStrokeWidthMenuOpen,
    nodeStrokeStyleMenuOpen,
    nodeDashBackground,
    updateElement,
  ]);

  const commonUpdateNodeTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (
      nodePropertiesAction === "update" &&
      typeof imageCroppingNode === "undefined"
    ) {
      if (
        imageEditionTools.length > 0 ||
        colorTokenTools.length > 0 ||
        textTools.length > 0 ||
        commonShapeTools.length > 0
      ) {
        actualNodeTools.push(
          <ToolbarDivider
            orientation="horizontal"
            key="divider-1"
            className="!w-full col-span-1"
          />
        );
      }

      if (nodes.length === 1 && node?.type === "image") {
        actualNodeTools.push(
          <React.Fragment key="update-node-image-tools">
            <ToolbarButton
              className="rounded-full !w-[40px]"
              icon={<Crop className="px-2" size={40} strokeWidth={1} />}
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
              className="!w-full col-span-1"
            />
          </React.Fragment>
        );
      }

      actualNodeTools.push(
        <ToolbarButton
          key="update-node-properties"
          className="rounded-full !w-[40px]"
          icon={<PanelRight className="px-2" size={40} strokeWidth={1} />}
          disabled={
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
            typeof nodePropertiesAction === "undefined" ||
            typeof actualNode === "undefined" ||
            (typeof actualNode === "undefined" && nodes.length < 2)
          }
          onClick={() => {
            setNodeLayeringMenuOpen(false);
            setNodeFillMenuOpen(false);
            setNodeStrokeMenuOpen(false);
            setNodeStrokeWidthMenuOpen(false);
            setNodeStrokeStyleMenuOpen(false);
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
          tooltipSide="left"
          tooltipAlign="center"
        />
      );
    }

    return actualNodeTools;
  }, [
    instance,
    colorTokenTools,
    commonShapeTools,
    imageEditionTools,
    textTools,
    actualNode,
    node,
    imageCroppingNode,
    nodePropertiesAction,
    nodes.length,
    setSidebarActive,
    weaveConnectionStatus,
  ]);

  const commonCreateNodeTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (
      nodePropertiesAction === "create" &&
      ![
        "selectionTool",
        "moveTool",
        "eraseTool",
        "imageTool",
        "imagesTool",
      ].includes(actualAction as string) &&
      !imageCroppingNode
    ) {
      actualNodeTools.push(
        <React.Fragment key="create-node-common-tools">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<X className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              if (!instance) {
                return;
              }

              instance.cancelAction(actualAction as string);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Close</p>
              </div>
            }
            tooltipSide="left"
            tooltipAlign="center"
          />
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [
    actualAction,
    imageCroppingNode,
    instance,
    nodePropertiesAction,
    weaveConnectionStatus,
  ]);

  const croppingTools = React.useMemo(() => {
    const actualNodeTools = [];
    if (imageCroppingEnabled && imageCroppingNode) {
      actualNodeTools.push(
        <React.Fragment key="image-cropping-tools">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<Check className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              if (!instance) {
                return;
              }

              imageCroppingNode.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.ACCEPT);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Apply</p>
              </div>
            }
            tooltipSide="left"
            tooltipAlign="center"
          />
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<X className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={() => {
              if (!instance) {
                return;
              }

              imageCroppingNode.closeCrop(WEAVE_IMAGE_CROP_END_TYPE.CANCEL);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Cancel</p>
              </div>
            }
            tooltipSide="left"
            tooltipAlign="center"
          />
        </React.Fragment>
      );
    }
    return actualNodeTools;
  }, [
    instance,
    weaveConnectionStatus,
    imageCroppingEnabled,
    imageCroppingNode,
  ]);

  if (nodes && nodes.length > 1 && !imageCroppingEnabled) return null;

  if (!actualNode && !imageCroppingEnabled) {
    return null;
  }

  if (!showUI) {
    return null;
  }

  if (
    imageEditionTools.length === 0 &&
    colorTokenTools.length === 0 &&
    textTools.length === 0 &&
    commonShapeTools.length === 0 &&
    commonUpdateNodeTools.length === 0 &&
    commonShapeManagementTools.length === 0 &&
    commonCreateNodeTools.length === 0 &&
    croppingTools.length === 0
  ) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={rightElementVariants}
      className="pointer-events-none absolute right-[16px] top-[16px] bottom-[16px] flex flex-col gap-5 justify-center items-center"
    >
      {!imageCroppingEnabled && (
        <Toolbar
          orientation="vertical"
          className="grid grid-cols-1 w-auto justify-start items-center rounded-3xl"
        >
          {imageEditionTools}
          {colorTokenTools}
          {textTools}
          {commonShapeTools}
          {commonUpdateNodeTools}
        </Toolbar>
      )}
      <Toolbar
        orientation="vertical"
        className="grid grid-cols-1 w-auto justify-start items-center rounded-3xl"
      >
        {commonShapeManagementTools}
        {commonCreateNodeTools}
        {croppingTools}
      </Toolbar>
    </motion.div>
  );
}
