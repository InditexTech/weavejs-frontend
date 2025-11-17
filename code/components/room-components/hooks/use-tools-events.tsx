// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import {
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
    "none"
  );
  const [templates, setTemplates] = React.useState<TemplateEntity[]>([]);
  const [frameKind, setFrameKind] = React.useState<"horizontal" | "vertical">(
    "horizontal"
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
        (t) => t.templateId === frameTemplate
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
        mousePoint
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
            }
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
    (state) => state.setLoadingImage
  );
  const setNodePropertiesCreateProps = useCollaborationRoom(
    (state) => state.setNodePropertiesCreateProps
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
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
      toast.dismiss();
    };

    instance.addEventListener("onPropsChange", handlePropsChange);
    instance.addEventListener("onActiveActionChange", handleActiveActionChange);

    return () => {
      if (instance) {
        instance.removeEventListener("onPropsChange", handlePropsChange);
        instance.removeEventListener(
          "onActiveActionChange",
          handleActiveActionChange
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

    const handleStartCommentAdding = () => {
      toast("Add comments", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add a comment.`,
        duration: Infinity,
      });
    };

    const handleFinishCommentAdding = () => {
      toast.dismiss();
    };

    instance.addEventListener("onStartAddingComment", handleStartCommentAdding);
    instance.addEventListener(
      "onFinishAddingComment",
      handleFinishCommentAdding
    );

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onStartAddingComment",
          handleStartCommentAdding
        );
        instance.removeEventListener(
          "onFinishAddingComment",
          handleFinishCommentAdding
        );
      }
    };
  }, [instance, isTouchDevice]);

  // Rectangle tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleRectangleAdding = () => {
      toast("Add a rectangle", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size rectangle or ${isTouchDevice ? "tap" : "click"} and drag to add a rectangle with a defined size.`,
        duration: Infinity,
      });
    };

    const handleRectangleAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingRectangle", handleRectangleAdding);
    instance.addEventListener("onAddedRectangle", handleRectangleAdded);

    return () => {
      if (!instance) {
        return;
      }

      instance.removeEventListener("onAddingRectangle", handleRectangleAdding);
      instance.removeEventListener("onAddedRectangle", handleRectangleAdded);
    };
  }, [instance, isTouchDevice]);

  // Ellipse tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleEllipseAdding = () => {
      toast("Add an ellipse", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size ellipse or ${isTouchDevice ? "tap" : "click"} and drag to add a ellipse with a defined size.`,
        duration: Infinity,
      });
    };

    const handleEllipseAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingEllipse", handleEllipseAdding);
    instance.addEventListener("onAddedEllipse", handleEllipseAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingEllipse", handleEllipseAdding);
        instance.removeEventListener("onAddedEllipse", handleEllipseAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Regular Polygon tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleRegularPolygonAdding = () => {
      toast("Add a regular polygon", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size regular polygon or ${isTouchDevice ? "tap" : "click"} and drag to add a regular polygon with a defined size.`,
        duration: Infinity,
      });
    };

    const handleRegularPolygonAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener(
      "onAddingRegularPolygon",
      handleRegularPolygonAdding
    );
    instance.addEventListener(
      "onAddedRegularPolygon",
      handleRegularPolygonAdded
    );

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onAddingRegularPolygon",
          handleRegularPolygonAdding
        );
        instance.removeEventListener(
          "onAddedRegularPolygon",
          handleRegularPolygonAdded
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Star tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleStarAdding = () => {
      toast("Add a star", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add a fixed size star or ${isTouchDevice ? "tap" : "click"} and drag to add a star with a defined size, movement on the x-axis defines the outer radius and movement on the y-axis defines the inner radius.`,
        duration: Infinity,
      });
    };

    const handleStarAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingStar", handleStarAdding);
    instance.addEventListener("onAddedStar", handleStarAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingStar", handleStarAdding);
        instance.removeEventListener("onAddedStar", handleStarAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Color Token tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleColorTokenAdding = () => {
      toast("Add a color token", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add the color token. You can select the color of the token on the right toolbar.`,
        duration: Infinity,
      });
    };

    const handleColorTokenAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingColorToken", handleColorTokenAdding);
    instance.addEventListener("onAddedColorToken", handleColorTokenAdded);

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onAddingColorToken",
          handleColorTokenAdding
        );
        instance.removeEventListener(
          "onAddedColorToken",
          handleColorTokenAdded
        );
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Pen tool events
  React.useEffect(() => {
    if (!instance) return;

    const handlePenAdding = () => {
      toast("Add lines", {
        description: `${isTouchDevice ? "Tap" : "Click"} to set the line start point. Then keep ${isTouchDevice ? "tapping" : "moving and clicking"} to add more line segments.`,
        duration: Infinity,
      });
    };

    const handlePenAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingPen", handlePenAdding);
    instance.addEventListener("onAddedPen", handlePenAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingPen", handlePenAdding);
        instance.removeEventListener("onAddedPen", handlePenAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Brush tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleBrushAdding = () => {
      toast("Free-hand drawing", {
        description: `${isTouchDevice ? "Tap" : "Click"} and move to draw a stroke.`,
        duration: Infinity,
      });
    };

    const handleBrushAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingBrush", handleBrushAdding);
    instance.addEventListener("onAddedBrush", handleBrushAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingBrush", handleBrushAdding);
        instance.removeEventListener("onAddedBrush", handleBrushAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Arrow tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleArrowAdding = () => {
      toast("Add an arrow segment", {
        description: `${isTouchDevice ? "Tap" : "Click"} to set the arrow segment start point. Then keep ${isTouchDevice ? "tapping" : "moving and clicking"} to add more segments to the arrow.`,
        duration: Infinity,
      });
    };

    const handleArrowAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingArrow", handleArrowAdding);
    instance.addEventListener("onAddedArrow", handleArrowAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingArrow", handleArrowAdding);
        instance.removeEventListener("onAddedArrow", handleArrowAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Connector tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleConnectorAdding = () => {
      toast("Add connector", {
        description: `${isTouchDevice ? "Tap" : "Click"} on an element anchor to set the start point and then ${isTouchDevice ? "tap" : "click"} on another anchor to add the connector.`,
        duration: Infinity,
      });
    };

    const handleConnectorAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingConnector", handleConnectorAdding);
    instance.addEventListener("onAddedConnector", handleConnectorAdded);

    return () => {
      if (instance) {
        instance.removeEventListener(
          "onAddingConnector",
          handleConnectorAdding
        );
        instance.removeEventListener("onAddedConnector", handleConnectorAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Image tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleImageAdding = () => {
      toast("Add an image", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add the image to the room.`,
        duration: Infinity,
      });
    };

    const handleImageAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingImage", handleImageAdding);
    instance.addEventListener("onAddedImage", handleImageAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingImage", handleImageAdding);
        instance.removeEventListener("onAddedImage", handleImageAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Images tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleImagesAdding = () => {
      toast("Add multiple images", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add the images to the room.`,
        duration: Infinity,
      });
    };

    const handleImagesAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingImages", handleImagesAdding);
    instance.addEventListener("onAddedImages", handleImagesAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingImages", handleImagesAdding);
        instance.removeEventListener("onAddedImages", handleImagesAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Video tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleVideoAdding = () => {
      toast("Add a video", {
        description: `${isTouchDevice ? "Tap" : "Click"} to add the video to the room.`,
        duration: Infinity,
      });
    };

    const handleVideoAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingVideo", handleVideoAdding);
    instance.addEventListener("onAddedVideo", handleVideoAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingVideo", handleVideoAdding);
        instance.removeEventListener("onAddedVideo", handleVideoAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Text tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleTextAdding = () => {
      toast("Add text", {
        description: `${isTouchDevice ? "Tap" : "Click"} to set the text position. Then type and ${isTouchDevice ? "tap" : "click"} outside the text to confirm and add it.`,
        duration: Infinity,
      });
    };

    const handleTextAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingText", handleTextAdding);
    instance.addEventListener("onAddedText", handleTextAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingText", handleTextAdding);
        instance.removeEventListener("onAddedText", handleTextAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);

  // Frame tool events
  React.useEffect(() => {
    if (!instance) return;

    const handleFrameAdding = () => {
      toast("Add a frame", {
        description: AddFrameToast,

        duration: Infinity,
      });
    };

    const handleFrameAdded = () => {
      toast.dismiss();
    };

    instance.addEventListener("onAddingFrame", handleFrameAdding);
    instance.addEventListener("onAddedFrame", handleFrameAdded);

    return () => {
      if (instance) {
        instance.removeEventListener("onAddingFrame", handleFrameAdding);
        instance.removeEventListener("onAddedFrame", handleFrameAdded);
      }
    };
  }, [instance, isTouchDevice, setLoadingImage, setNodePropertiesCreateProps]);
};
