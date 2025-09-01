// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { useWeave } from "@inditextech/weave-react";
import { WeaveActionPropsChangeEvent } from "@inditextech/weave-sdk";
import { useIsTouchDevice } from "./use-is-touch-device";

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
        description: `${isTouchDevice ? "Tap" : "Click"} to add the frame.`,
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
