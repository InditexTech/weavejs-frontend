// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
  WeaveActionPropsChangeEvent,
  WeaveFrameToolAction,
} from "@inditextech/weave-sdk";
import { useIsTouchDevice } from "./use-is-touch-device";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RectangleHorizontal, RectangleVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { ColorPickerInput } from "../inputs/color-picker";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getFrameTemplates } from "@/api/get-frame-templates";
import { TemplateEntity } from "../templates-library/types";
import Konva from "konva";
import { setTemplateOnPosition } from "@/components/utils/templates";

const AddFrameToast = () => {
  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const room = useCollaborationRoom((state) => state.room);

  const [frameTemplate, setFrameTemplate] = React.useState<"none" | string>(
    "none",
  );
  const [templates, setTemplates] = React.useState<TemplateEntity[]>([]);
  const [frameKind, setFrameKind] = React.useState<"horizontal" | "vertical">(
    "horizontal",
  );
  const [selectBackgroundColor, setSelectBackgroundColor] =
    React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState("#ffffffff");

  const isTouchDevice = useIsTouchDevice();

  const query = useQuery({
    queryKey: ["getFrameTemplates", room],
    queryFn: async () => {
      if (!room) {
        return [];
      }

      return await getFrameTemplates(room ?? "");
    },
    select: (newData) => newData, // keep shape stable
    structuralSharing: true,
  });

  React.useEffect(() => {
    if (!instance) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClickStage(e: any) {
      if (!instance) return;

      if (frameTemplate === "none") {
        return;
      }

      const template = templates.find(
        (t) => t.templateId === frameTemplate,
      ) as TemplateEntity;

      if (!template) {
        return;
      }

      e.cancelBubble = true;

      const position: Konva.Vector2d | null | undefined = instance
        .getStage()
        .getPointerPosition();

      if (!position) {
        return;
      }

      const { mousePoint } = instance.getMousePointer(position);

      setTemplateOnPosition(
        instance,
        JSON.parse(template.templateData),
        mousePoint,
      );

      const actionHandler: WeaveFrameToolAction | undefined =
        instance.getActionHandler("frameTool");

      if (actionHandler) {
        actionHandler.cleanup();
      }
    }

    instance.getStage().on("pointerclick", handleClickStage);

    return () => {
      instance.getStage().off("pointerclick", handleClickStage);
    };
  }, [instance, frameTemplate, templates]);

  React.useEffect(() => {
    if (!query.data) return;
    setTemplates(query.data.items);
  }, [query.data]);

  return (
    <div className="cursor-auto w-full h-auto flex flex-col gap-1 justify-between items-center">
      <div className="w-full">{`Select the frame background color and orientation and finally ${isTouchDevice ? "tap" : "click"} on the room to add the frame.`}</div>
      <div className="w-full flex flex-col gap-1 justify-end items-end pt-2">
        <div className="w-full flex flex-col gap-1 justify-start items-start">
          <div className="text-[10px] font-inter uppercase px-0">Template</div>
          <Select
            value={frameTemplate}
            onValueChange={(value) => {
              setFrameTemplate(value);

              if (!instance) return;

              if (value !== "none") {
                const actionHandler: WeaveFrameToolAction | undefined =
                  instance.getActionHandler("frameTool");

                if (actionHandler) {
                  actionHandler.setTemplateToUse(value);
                }
              }
            }}
          >
            <SelectTrigger
              onClick={(e) => {
                e.preventDefault();
              }}
              className="cursor-pointer w-full font-inter text-xs rounded-none !h-[30px] !border-black !shadow-none"
            >
              <SelectValue placeholder="Amount" />
            </SelectTrigger>
            <SelectContent
              className="!z-[1000000000] rounded-none p-0 w-[var(--radix-popover-trigger-width)] border-black"
              align="end"
            >
              <SelectGroup>
                <SelectItem
                  value="none"
                  className="font-inter text-xs rounded-none"
                >
                  BLANK
                </SelectItem>
                {templates.map((template) => (
                  <SelectItem
                    key={template.templateId}
                    value={template.templateId}
                    className="font-inter text-xs rounded-none"
                  >
                    {template.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div
          className={cn(
            "w-full flex flex-col gap-1 justify-start items-start mt-3",
            {
              ["text-[var(--accent-foreground)] opacity-50"]:
                weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                frameTemplate !== "none",
            },
          )}
        >
          <div className="text-[10px] font-inter uppercase px-0">
            Template properties
          </div>
          <div className="w-full flex flex-col border border-[#c9c9c9] p-3 gap-1">
            <div className="w-full flex gap-1 justify-start items-center">
              <DropdownMenu modal={false} open={selectBackgroundColor}>
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
                          WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                        frameTemplate !== "none",
                    },
                  )}
                  asChild
                >
                  <ToolbarButton
                    className="rounded-full min-w-[32px] !w-[32px] !h-[32px]"
                    icon={
                      <div
                        className="border border-[#c9c9c9c] w-[16px] h-[16px]"
                        style={{
                          background: backgroundColor,
                        }}
                      />
                    }
                    disabled={
                      weaveConnectionStatus !==
                        WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                      frameTemplate !== "none"
                    }
                    active={selectBackgroundColor}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectBackgroundColor((prev) => !prev);
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
                  align="end"
                  side="left"
                  alignOffset={0}
                  sideOffset={8}
                  className="min-w-auto font-inter rounded-none shadow-none flex flex-row !z-[1000000000]"
                >
                  <div
                    className="flex !flex-col gap-0 w-[300px] p-4"
                    onClick={(e) => e.preventDefault()}
                  >
                    <ColorPickerInput
                      value={backgroundColor}
                      onChange={(color: string) => {
                        setBackgroundColor(color);

                        if (!instance) return;

                        instance.updatePropsAction("frameTool", {
                          frameBackground: color,
                        });
                      }}
                    />
                    <Button
                      onClick={() => {
                        setSelectBackgroundColor(false);
                      }}
                      className="cursor-pointer font-inter font-light rounded-none w-full"
                    >
                      CLOSE
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div
                className={cn("text-[10px] font-inter uppercase", {
                  ["text-[var(--accent-foreground)] opacity-50"]:
                    weaveConnectionStatus !==
                      WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                    frameTemplate !== "none",
                })}
              >
                Background color
              </div>
            </div>
            <ToggleGroup
              variant="outline"
              type="single"
              size="sm"
              className="w-full"
              value={frameKind}
              disabled={
                weaveConnectionStatus !==
                  WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
                frameTemplate !== "none"
              }
              onValueChange={(value) => {
                if (instance && value === "horizontal") {
                  setFrameKind("horizontal");
                  instance.updatePropsAction("frameTool", {
                    frameWidth: 1920,
                    frameHeight: 1080,
                  });
                }
                if (instance && value === "vertical") {
                  setFrameKind(value);
                  instance.updatePropsAction("frameTool", {
                    frameWidth: 1080,
                    frameHeight: 1920,
                  });
                }
              }}
            >
              <ToggleGroupItem
                value="horizontal"
                className="text-[10px] font-inter uppercase !px-5 cursor-pointer"
                aria-label="Frame is horizontal"
              >
                Horizontal <RectangleHorizontal size={32} strokeWidth={1} />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="vertical"
                className="text-[10px] font-inter uppercase !px-5 cursor-pointer"
                aria-label="Frame is vertical"
              >
                Vertical <RectangleVertical size={32} strokeWidth={1} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export const useToolsEvents = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);

  const setLoadingImage = useCollaborationRoom(
    (state) => state.setLoadingImage,
  );
  const setNodePropertiesCreateProps = useCollaborationRoom(
    (state) => state.setNodePropertiesCreateProps,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
  );

  const isTouchDevice = useIsTouchDevice();

  // General event handlers
  React.useEffect(() => {
    if (!instance) return;

    const handlePropsChange = ({ props }: WeaveActionPropsChangeEvent) => {
      setNodePropertiesCreateProps(props);
    };

    const handleActiveActionChange = (action: string | undefined) => {
      if (actualAction === "commentTool" && action !== "commentTool") {
        sidebarToggle(null);
      }
    };

    instance.addEventListener("onPropsChange", handlePropsChange);
    instance.addEventListener("onActiveActionChange", handleActiveActionChange);

    return () => {
      if (instance) {
        instance.removeEventListener("onPropsChange", handlePropsChange);
        instance.removeEventListener(
          "onActiveActionChange",
          handleActiveActionChange,
        );
        instance.removeEventListener("onImageLoadStart", handlePropsChange);
        instance.removeEventListener("onImageLoadEnd", handlePropsChange);
      }
    };
  }, [
    instance,
    actualAction,
    isTouchDevice,
    sidebarToggle,
    setLoadingImage,
    setNodePropertiesCreateProps,
  ]);

  // Comment tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleStartCommentAdding = () => {
      toastId = toast("Add comments", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add a comment.`,
        duration: Infinity,
      });
    };

    const handleFinishCommentAdding = () => {
      toast.dismiss(toastId);
    };

    instance.addEventListener("onStartAddingComment", handleStartCommentAdding);
    instance.addEventListener(
      "onFinishAddingComment",
      handleFinishCommentAdding,
    );

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onStartAddingComment",
          handleStartCommentAdding,
        );
        instance.removeEventListener(
          "onFinishAddingComment",
          handleFinishCommentAdding,
        );
      }
    };
  }, [instance, isTouchDevice]);

  // Rectangle tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleRectangleAdding = () => {
      toastId = toast("Add a rectangle", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size rectangle or ${isTouchDevice ? "tap" : "click"} and drag to add a rectangle with a defined size.`,
        duration: Infinity,
      });
    };

    const handleRectangleAdded = () => {
      toast.dismiss(toastId);
    };

    const handleRectangleCancelled = (activeAction: string) => {
      if (activeAction !== "rectangleTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingRectangle", handleRectangleAdding);
    instance.addEventListener("onAddedRectangle", handleRectangleAdded);
    instance.addEventListener("onActiveActionChange", handleRectangleCancelled);

    return () => {
      if (!instance) {
        return;
      }

      instance.removeEventListener("onAddingRectangle", handleRectangleAdding);
      instance.removeEventListener("onAddedRectangle", handleRectangleAdded);
      instance.removeEventListener(
        "onActiveActionChange",
        handleRectangleCancelled,
      );
    };
  }, [instance, isTouchDevice]);

  // Ellipse tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleEllipseAdding = () => {
      toastId = toast("Add an ellipse", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size ellipse or ${isTouchDevice ? "tap" : "click"} and drag to add a ellipse with a defined size.`,
        duration: Infinity,
      });
    };

    const handleEllipseAdded = () => {
      toast.dismiss(toastId);
    };

    const handleEllipseCancelled = (activeAction: string) => {
      if (activeAction !== "ellipseTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingEllipse", handleEllipseAdding);
    instance.addEventListener("onAddedEllipse", handleEllipseAdded);
    instance.addEventListener("onActiveActionChange", handleEllipseCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingEllipse", handleEllipseAdding);
        instance.removeEventListener("onAddedEllipse", handleEllipseAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleEllipseCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Regular Polygon tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleRegularPolygonAdding = () => {
      toastId = toast("Add a regular polygon", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size regular polygon or ${isTouchDevice ? "tap" : "click"} and drag to add a regular polygon with a defined size.`,
        duration: Infinity,
      });
    };

    const handleRegularPolygonAdded = () => {
      toast.dismiss(toastId);
    };

    const handleRegularPolygonCancelled = (activeAction: string) => {
      if (activeAction !== "regularPolygonTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener(
      "onAddingRegularPolygon",
      handleRegularPolygonAdding,
    );
    instance.addEventListener(
      "onAddedRegularPolygon",
      handleRegularPolygonAdded,
    );
    instance.addEventListener(
      "onActiveActionChange",
      handleRegularPolygonCancelled,
    );

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onAddingRegularPolygon",
          handleRegularPolygonAdding,
        );
        instance.removeEventListener(
          "onAddedRegularPolygon",
          handleRegularPolygonAdded,
        );
        instance.removeEventListener(
          "onActiveActionChange",
          handleRegularPolygonCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Star tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleStarAdding = () => {
      toastId = toast("Add a star", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size star or ${isTouchDevice ? "tap" : "click"} and drag to add a star with a defined size, movement on the x-axis defines the outer radius and movement on the y-axis defines the inner radius.`,
        duration: Infinity,
      });
    };

    const handleStarAdded = () => {
      toast.dismiss(toastId);
    };

    const handleStarCancelled = (activeAction: string) => {
      if (activeAction !== "starTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingStar", handleStarAdding);
    instance.addEventListener("onAddedStar", handleStarAdded);
    instance.addEventListener("onActiveActionChange", handleStarCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingStar", handleStarAdding);
        instance.removeEventListener("onAddedStar", handleStarAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleStarCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Color Token tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleColorTokenAdding = () => {
      toastId = toast("Add a color token", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add the color token. You can select the color of the token on the right toolbar.`,
        duration: Infinity,
      });
    };

    const handleColorTokenAdded = () => {
      toast.dismiss(toastId);
    };

    const handleColorTokenCancelled = (activeAction: string) => {
      if (activeAction !== "colorTokenTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingColorToken", handleColorTokenAdding);
    instance.addEventListener("onAddedColorToken", handleColorTokenAdded);
    instance.addEventListener(
      "onActiveActionChange",
      handleColorTokenCancelled,
    );

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onAddingColorToken",
          handleColorTokenAdding,
        );
        instance.removeEventListener(
          "onAddedColorToken",
          handleColorTokenAdded,
        );
        instance.removeEventListener(
          "onActiveActionChange",
          handleColorTokenCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Line tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleStrokeAdding = ({ actionName }: { actionName: string }) => {
      if (actionName === "strokeTool") {
        toastId = toast("Add a stroke", {
          toasterId: "info",
          description: `${isTouchDevice ? "Tap" : "Click"} and drag to paint a stroke.`,
          duration: Infinity,
        });
      }
    };

    const handleStrokeAdded = ({ actionName }: { actionName: string }) => {
      if (actionName === "strokeTool") {
        toast.dismiss(toastId);
      }
    };

    const handleStrokeCancelled = (activeAction: string) => {
      if (activeAction !== "strokeTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingStroke", handleStrokeAdding);
    instance.addEventListener("onAddedStroke", handleStrokeAdded);
    instance.addEventListener("onActiveActionChange", handleStrokeCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingStroke", handleStrokeAdding);
        instance.removeEventListener("onAddedStroke", handleStrokeAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleStrokeCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Arrow tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleArrowAdding = ({ actionName }: { actionName: string }) => {
      if (actionName === "arrowTool") {
        toastId = toast("Add an arrow", {
          toasterId: "info",
          description: `${isTouchDevice ? "Tap" : "Click"} and drag to paint an arrow.`,
          duration: Infinity,
        });
      }
    };

    const handleArrowAdded = ({ actionName }: { actionName: string }) => {
      if (actionName === "arrowTool") {
        toast.dismiss(toastId);
      }
    };

    const handleArrowCancelled = (activeAction: string) => {
      if (activeAction !== "arrowTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingStroke", handleArrowAdding);
    instance.addEventListener("onAddedStroke", handleArrowAdded);
    instance.addEventListener("onActiveActionChange", handleArrowCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingStroke", handleArrowAdding);
        instance.removeEventListener("onAddedStroke", handleArrowAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleArrowCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Brush tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleBrushAdding = () => {
      toastId = toast("Free-hand drawing", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} and move to draw a stroke.`,
        duration: Infinity,
      });
    };

    const handleBrushAdded = () => {
      toast.dismiss(toastId);
    };

    const handleBrushCancelled = (activeAction: string) => {
      if (activeAction !== "brushTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingBrush", handleBrushAdding);
    instance.addEventListener("onAddedBrush", handleBrushAdded);
    instance.addEventListener("onActiveActionChange", handleBrushCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingBrush", handleBrushAdding);
        instance.removeEventListener("onAddedBrush", handleBrushAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleBrushCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Connector tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleConnectorAdding = () => {
      toastId = toast("Add connector", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} on an element anchor to set the start point and then ${isTouchDevice ? "tap" : "click"} on another anchor to add the connector.`,
        duration: Infinity,
      });
    };

    const handleConnectorAdded = () => {
      toast.dismiss(toastId);
    };

    const handleConnectorCancelled = (activeAction: string) => {
      if (activeAction !== "connectorTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingConnector", handleConnectorAdding);
    instance.addEventListener("onAddedConnector", handleConnectorAdded);
    instance.addEventListener("onActiveActionChange", handleConnectorCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onAddingConnector",
          handleConnectorAdding,
        );
        instance.removeEventListener("onAddedConnector", handleConnectorAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleConnectorCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Image tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleImageAdding = () => {
      toastId = toast("Add an image", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add the image to the room.`,
        duration: Infinity,
      });
    };

    const handleImageAdded = () => {
      toast.dismiss(toastId);
    };

    const handleImageCancelled = (activeAction: string) => {
      if (activeAction !== WEAVE_IMAGE_TOOL_ACTION_NAME) {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingImage", handleImageAdding);
    instance.addEventListener("onAddedImage", handleImageAdded);
    instance.addEventListener("onActiveActionChange", handleImageCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingImage", handleImageAdding);
        instance.removeEventListener("onAddedImage", handleImageAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleImageCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Images tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleImagesAdding = () => {
      toastId = toast("Add multiple images", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add the images to the room.`,
        duration: Infinity,
      });
    };

    const handleImagesAdded = () => {
      toast.dismiss(toastId);
    };

    const handleImagesCancelled = (activeAction: string) => {
      if (activeAction !== WEAVE_IMAGES_TOOL_ACTION_NAME) {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingImages", handleImagesAdding);
    instance.addEventListener("onAddedImages", handleImagesAdded);
    instance.addEventListener("onActiveActionChange", handleImagesCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingImages", handleImagesAdding);
        instance.removeEventListener("onAddedImages", handleImagesAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleImagesCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Video tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleVideoAdding = () => {
      toastId = toast("Add a video", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to add the video to the room.`,
        duration: Infinity,
      });
    };

    const handleVideoAdded = () => {
      toast.dismiss(toastId);
    };

    const handleVideoCancelled = (activeAction: string) => {
      if (activeAction !== "videoTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingVideo", handleVideoAdding);
    instance.addEventListener("onAddedVideo", handleVideoAdded);
    instance.addEventListener("onActiveActionChange", handleVideoCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingVideo", handleVideoAdding);
        instance.removeEventListener("onAddedVideo", handleVideoAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleVideoCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Text tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleTextAdding = () => {
      toastId = toast("Add text", {
        toasterId: "info",
        description: `${isTouchDevice ? "Tap" : "Click"} to set the text position. Then type and ${isTouchDevice ? "tap" : "click"} outside the text to confirm and add it.`,
        duration: Infinity,
      });
    };

    const handleTextAdded = () => {
      toast.dismiss(toastId);
    };

    const handleTextCancelled = (activeAction: string) => {
      if (activeAction !== "textTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingText", handleTextAdding);
    instance.addEventListener("onAddedText", handleTextAdded);
    instance.addEventListener("onActiveActionChange", handleTextCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingText", handleTextAdding);
        instance.removeEventListener("onAddedText", handleTextAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleTextCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Frame tool events
  React.useEffect(() => {
    if (!instance) return;

    let toastId: string | number = 0;

    const handleFrameAdding = () => {
      toastId = toast("Add a frame", {
        toasterId: "info",
        description: AddFrameToast,

        duration: Infinity,
      });
    };

    const handleFrameAdded = () => {
      toast.dismiss(toastId);
    };

    const handleFrameCancelled = (activeAction: string) => {
      if (activeAction !== "frameTool") {
        toast.dismiss(toastId);
      }
    };

    instance.addEventListener("onAddingFrame", handleFrameAdding);
    instance.addEventListener("onAddedFrame", handleFrameAdded);
    instance.addEventListener("onActiveActionChange", handleFrameCancelled);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingFrame", handleFrameAdding);
        instance.removeEventListener("onAddedFrame", handleFrameAdded);
        instance.removeEventListener(
          "onActiveActionChange",
          handleFrameCancelled,
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);
};
