// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useWeave } from "@inditextech/weave-react";
import React from "react";
import Konva from "konva";
import {
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveElementInstance,
  WeaveStateElement,
} from "@inditextech/weave-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  X,
  Layers,
  Lock,
  EyeOff,
  Copy,
  BringToFront,
  ArrowUp,
  ArrowDown,
  SendToBack,
  Trash,
  Paintbrush,
  FlipVertical2,
  Ruler,
} from "lucide-react";
import { cn, SYSTEM_OS } from "@/lib/utils";
import {
  WeaveCopyPasteNodesPlugin,
  WeaveMeasureNode,
} from "@inditextech/weave-sdk";
import { Button } from "@/components/ui/button";
import { merge } from "lodash";
import { ShortcutElement } from "@/components/room-components/help/shortcut-element";
import { ToolbarButton } from "@/components/room-components/toolbar/toolbar-button";
import { ToolbarDivider } from "@/components/room-components/toolbar/toolbar-divider";
import { useNodeActionName } from "@/components/room-components/overlay/hooks/use-node-action-name";
import { ColorPickerInput } from "@/components/room-components/inputs/color-picker";
import { useStandaloneUseCase } from "../../store/store";

export const NodeToolbar = () => {
  const actualNodeRef = React.useRef<WeaveStateElement | undefined>(undefined);

  const [dontRender, setDontRender] = React.useState(false);
  const [movingImageTemplate, setMovingImageTemplate] =
    React.useState<Konva.Group | null>(null);

  const [actualMenusOpen, setActualMenusOpen] = React.useState<string[]>([]);

  const [isSelecting] = React.useState(false);

  const instance = useWeave((state) => state.instance);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const actualAction = useWeave((state) => state.actions.actual);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const nodePropertiesAction: "create" | "update" | undefined =
    useStandaloneUseCase((state) => state.nodeProperties.action);
  const setNodePropertiesAction = useStandaloneUseCase(
    (state) => state.setNodePropertiesAction
  );
  const nodeCreateProps = useStandaloneUseCase(
    (state) => state.nodeProperties.createProps
  );
  const setReferenceMeasurePixels = useStandaloneUseCase(
    (state) => state.setReferenceMeasurePixels
  );

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
        "videoTool",
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
      return;
    }

    if (node) {
      setNodePropertiesAction("update");
    }
  }, [actualAction, node, setNodePropertiesAction]);

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

  const isTextNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "text",
    [actualNode]
  );

  const isMeasureNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "measure",
    [actualNode]
  );

  const isCustomMeasureNode = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "custom-measure",
    [actualNode]
  );

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
        "measure",
        "custom-measure",
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

  if (nodes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none absolute px-0 py-0 top-[80px] right-[20px] flex flex-col gap-0 justify-center items-center bg-white px-3 py-2 text-lg font-inter font-light border border-r-0 border-[#c9c9c9]">
        {title.toUpperCase()}
      </div>
      <div className="pointer-events-none absolute px-0 py-0 top-[144px] bottom-[16px] right-[16px] flex flex-col gap-0 justify-start items-center">
        <div className="flex flex-col gap-0 justify-start items-center bg-white border rounded-none border-zinc-200">
          <div className="flex flex-col gap-[2px] justify-end items-center px-1 my-1">
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
                          `weave.js_standalone_${instanceId}_${managingImageId}_config`
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
                        `weave.js_standalone_${instanceId}_${managingImageId}_config`,
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
            {isCustomMeasureNode && (
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
                          `weave.js_standalone_${instanceId}_${managingImageId}_config`
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
                        `weave.js_standalone_${instanceId}_${managingImageId}_config`,
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
            {canSetNodeStyling && (
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
                    {!["stroke", "line", "connector"].includes(
                      actualNode?.type ?? ""
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
                                active={actualMenusOpen.includes("nodeFill")}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActualMenusOpen((prev) => [
                                    ...prev.filter((m) => m === "nodeStyle"),
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
                                <X className="px-0" size={20} strokeWidth={1} />
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
                                <X className="px-0" size={20} strokeWidth={1} />
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
                                      (actualNode?.props.strokeWidth ?? 0) === 0
                                        ? 1
                                        : (actualNode?.props.strokeWidth ?? 0),
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
                                      (actualNode?.props.strokeWidth ?? 0) === 0
                                        ? 1
                                        : (actualNode?.props.strokeWidth ?? 0),
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
                                      (actualNode?.props.strokeWidth ?? 0) === 0
                                        ? 1
                                        : (actualNode?.props.strokeWidth ?? 0),
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
          </div>
        </div>
      </div>
    </>
  );
};
