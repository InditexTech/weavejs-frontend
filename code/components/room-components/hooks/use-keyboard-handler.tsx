// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { toast } from "sonner";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useWeave } from "@inditextech/weave-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
  WEAVE_NODES_SELECTION_KEY,
  WEAVE_NODES_SNAPPING_PLUGIN_KEY,
  WeaveNodesSelectionPlugin,
  WeaveUsersPointersPlugin,
  WeaveNodesSnappingPlugin,
  GUIDE_ORIENTATION,
  WEAVE_IMAGE_NODE_TYPE,
} from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useCopyPasteGuides } from "./use-copy-paste-guides";

export function useKeyboardHandler() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const [guidesSequence, setGuidesSequence] = React.useState<boolean>(false);

  const viewType = useCollaborationRoom((state) => state.viewType);
  const setShowRightSidebarFloating = useCollaborationRoom(
    (state) => state.setShowRightSidebarFloating,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage,
  );
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads,
  );

  const triggerTool = React.useCallback(
    (toolName: string, params?: unknown, forceExecution?: boolean) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params, forceExecution);
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction],
  );

  const keysEnabled = React.useMemo(() => {
    return actualAction !== undefined && actualAction === "selectionTool";
  }, [actualAction]);

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      if (viewType === "floating") {
        setShowRightSidebarFloating(true);
      }
      setSidebarActive(element);
    },
    [setSidebarActive, viewType, setShowRightSidebarFloating],
  );

  const handleTriggerAction = React.useCallback(
    (actionName: string, actionParams: unknown) => {
      if (instance) {
        const triggerSelection = actualAction === "selectionTool";
        instance.triggerAction(actionName, actionParams);
        if (triggerSelection) {
          instance.triggerAction("selectionTool", actionParams);
        }
      }
    },
    [instance, actualAction],
  );

  const handlePrintToConsoleState = React.useCallback(() => {
    if (instance) {
      // eslint-disable-next-line no-console
      console.log({
        appState: JSON.parse(JSON.stringify(instance.getStore().getState())),
      });
    }
  }, [instance]);

  const isZoomingAllowed = React.useMemo(() => {
    const allowedZoomActions = ["selectionTool", "moveTool", "eraserTool"];
    if (typeof actualAction === "undefined") {
      return true;
    }
    if (allowedZoomActions.includes(actualAction)) {
      return true;
    }
    return false;
  }, [actualAction]);

  const keysEnabled = React.useMemo(() => {
    return actualAction !== undefined && actualAction === "selectionTool";
  }, [actualAction]);

  const { copyGuides, pasteGuides } = useCopyPasteGuides();

  // GUIDES HOTKEYS

  useHotkey({ key: "G" }, () => {
    setGuidesSequence(true);
  });

  useHotkey(
    { key: "C", mod: true },
    async (e) => {
      if (!guidesSequence) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setGuidesSequence(false);

      await copyGuides();
    },
    {
      preventDefault: false,
      stopPropagation: false,
    },
  );

  useHotkey(
    { key: "V", mod: true },
    async (e) => {
      if (!guidesSequence) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setGuidesSequence(false);

      await pasteGuides();
    },
    {
      preventDefault: false,
      stopPropagation: false,
    },
  );

  useHotkey({ key: "H" }, () => {
    if (!guidesSequence) {
      return;
    }
    setGuidesSequence(false);
    triggerTool("guideTool", { orientation: GUIDE_ORIENTATION.HORIZONTAL });
  });

  useHotkey({ key: "V" }, () => {
    if (!guidesSequence) {
      return;
    }
    setGuidesSequence(false);
    triggerTool("guideTool", { orientation: GUIDE_ORIENTATION.VERTICAL });
  });

  useHotkey({ key: "T" }, () => {
    if (!guidesSequence) {
      return;
    }

    if (!instance) {
      return;
    }

    const nodesSelectionPlugin = instance?.getPlugin<WeaveNodesSelectionPlugin>(
      WEAVE_NODES_SELECTION_KEY,
    );

    const snappingManagerPlugin = instance?.getPlugin<WeaveNodesSnappingPlugin>(
      WEAVE_NODES_SNAPPING_PLUGIN_KEY,
    );

    if (snappingManagerPlugin && nodesSelectionPlugin) {
      const mainLayer = instance.getMainLayer();
      let containerId = mainLayer?.id() ?? "";
      let performToggle = true;
      if (
        nodesSelectionPlugin.getSelectedNodes().length === 1 &&
        nodesSelectionPlugin.getSelectedNodes()[0].getAttrs().nodeType ===
          "frame"
      ) {
        containerId = nodesSelectionPlugin.getSelectedNodes()[0].id();
      }
      if (
        nodesSelectionPlugin.getSelectedNodes().length === 1 &&
        nodesSelectionPlugin.getSelectedNodes()[0].getAttrs().nodeType !==
          "frame"
      ) {
        performToggle = false;
      }

      if (performToggle) {
        snappingManagerPlugin
          .getGuidesManager()
          .toggleCustomGuides(containerId);
        sidebarToggle(SIDEBAR_ELEMENTS.guides);
      }
    }

    setGuidesSequence(false);
  });

  // TOOLBAR HOTKEYS

  // MOVE, SELECTION AND DELETE TOOLS

  useHotkey(
    { key: "M", mod: false, shift: false },
    () => {
      triggerTool("moveTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "S", mod: false, shift: false },
    () => {
      triggerTool("selectionTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "D", mod: false, shift: false },
    () => {
      if (guidesSequence) {
        return;
      }
      triggerTool("eraserTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  // SHAPES TOOLS

  useHotkey(
    { key: "R", mod: false, shift: false },
    () => {
      triggerTool("rectangleTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "E", mod: false, shift: false },
    () => {
      if (guidesSequence) {
        return;
      }
      triggerTool("ellipseTool");
    },
    {
      enabled: keysEnabled,
      conflictBehavior: "allow",
    },
  );

  useHotkey(
    { key: "P", mod: false, shift: false },
    () => {
      triggerTool("regularPolygonTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "J", mod: false, shift: false },
    () => {
      triggerTool("starTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "L", mod: false, shift: false },
    () => {
      triggerTool("strokeTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "B", mod: false, shift: false },
    () => {
      triggerTool("brushTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "Q", mod: false, shift: false },
    () => {
      triggerTool("arrowTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  // MEDIA TOOLS

  useHotkey(
    { key: "I", mod: false, shift: false },
    () => {
      triggerTool(WEAVE_IMAGE_TOOL_ACTION_NAME);
      setShowSelectFileImage(true);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "O", mod: false, shift: false },
    () => {
      triggerTool(WEAVE_IMAGES_TOOL_ACTION_NAME);
      setShowSelectFileImage(true);
    },
    {
      enabled: keysEnabled,
    },
  );

  // TEXT TOOLS

  useHotkey(
    { key: "T", mod: false, shift: false },
    () => {
      if (guidesSequence) {
        return;
      }
      triggerTool("textTool");
    },
    {
      enabled: keysEnabled,
      conflictBehavior: "allow",
    },
  );

  // OTHER TOOLS

  useHotkey(
    { key: "F", mod: false, shift: false },
    () => {
      triggerTool("frameTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "K", mod: false, shift: false },
    () => {
      triggerTool("colorTokenTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "X", mod: false, shift: false },
    () => {
      triggerTool("connectorTool");
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "H", mod: false, shift: false },
    () => {
      if (guidesSequence) {
        return;
      }

      if (!threadsEnabled) {
        return;
      }

      triggerTool("commentTool");
      sidebarToggle(SIDEBAR_ELEMENTS.comments);
    },
    {
      enabled: keysEnabled,
      conflictBehavior: "allow",
    },
  );

  // UNDO / REDO

  useHotkey(
    { key: "Z", mod: true, shift: false },
    () => {
      if (!instance) {
        return;
      }

      const actualStore = instance.getStore();
      actualStore.undoStateStep();
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "Y", mod: true, shift: false },
    () => {
      if (!instance) {
        return;
      }

      const actualStore = instance.getStore();
      actualStore.redoStateStep();
    },
    {
      enabled: keysEnabled,
    },
  );

  // VISIBILITY HOTKEYS

  useHotkey(
    { key: "U", mod: true, shift: true },
    () => {
      if (!instance) {
        return;
      }

      const usersPointersPlugin =
        instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");

      if (!usersPointersPlugin) {
        return;
      }

      if (usersPointersPlugin.isEnabled()) {
        usersPointersPlugin.disable();
      } else {
        usersPointersPlugin.enable();
      }
    },
    {
      enabled: keysEnabled,
    },
  );

  // SELECTION HOTKEYS

  useHotkey(
    { key: "A", mod: true, shift: true },
    () => {
      if (!instance) {
        return;
      }

      const selectionPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

      if (!selectionPlugin) {
        return;
      }

      selectionPlugin.selectAll();
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "Escape", mod: false, shift: true },
    () => {
      if (!instance) {
        return;
      }

      const selectionPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

      if (!selectionPlugin) {
        return;
      }

      selectionPlugin.selectNone();
    },
    {
      enabled: keysEnabled,
      preventDefault: false,
      stopPropagation: false,
    },
  );

  // Z-INDEX HOTKEYS

  useHotkey(
    { key: "BracketRight", mod: false, shift: false },
    () => {
      if (!instance) {
        return;
      }

      if (selectedNodes.length !== 1) {
        return;
      }

      instance.bringToFront(selectedNodes[0].instance);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "BracketRight", mod: false, shift: true },
    () => {
      if (!instance) {
        return;
      }

      if (selectedNodes.length !== 1) {
        return;
      }

      instance.moveUp(selectedNodes[0].instance);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "BracketLeft", mod: false, shift: true },
    () => {
      if (!instance) {
        return;
      }

      if (selectedNodes.length !== 1) {
        return;
      }

      instance.moveDown(selectedNodes[0].instance);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "BracketLeft", mod: false, shift: false },
    () => {
      if (!instance) {
        return;
      }

      if (selectedNodes.length !== 1) {
        return;
      }

      instance.sendToBack(selectedNodes[0].instance);
    },
    {
      enabled: keysEnabled,
    },
  );

  // GROUPING HOTKEYS

  useHotkey(
    { key: "G", mod: true, shift: false },
    () => {
      if (!instance) {
        return;
      }

      if (selectedNodes.length <= 1) {
        return;
      }

      instance.group(
        selectedNodes
          .map((n) => n?.node)
          .filter((node) => typeof node !== "undefined"),
      );
    },
    {
      enabled: keysEnabled,
      conflictBehavior: "allow",
    },
  );

  useHotkey(
    { key: "U", mod: true, shift: false },
    () => {
      if (!instance) {
        return;
      }

      if (
        selectedNodes.length !== 1 ||
        selectedNodes[0].node?.type !== "group"
      ) {
        return;
      }

      instance.unGroup(selectedNodes[0].node);
    },
    {
      enabled: keysEnabled,
    },
  );

  // SIDEBARS HOTKEYS

  useHotkey(
    { key: "I", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.images);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "V", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.videos);
    },
    {
      enabled: keysEnabled,
      conflictBehavior: "allow",
    },
  );

  useHotkey(
    { key: "C", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "F", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.frames);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "T", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.templates);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "O", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.comments);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "G", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.guides);
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "E", mod: false, alt: false, shift: true },
    () => {
      sidebarToggle(SIDEBAR_ELEMENTS.nodesTree);
    },
    {
      enabled: keysEnabled,
      conflictBehavior: "allow",
    },
  );

  // ZOOM HOTKEYS

  useHotkey(
    { key: "ArrowDown", mod: false, alt: true, shift: false },
    () => {
      if (!isZoomingAllowed) {
        return;
      }

      handleTriggerAction("zoomInTool", { previousAction: actualAction });
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "ArrowUp", mod: false, alt: true, shift: false },
    () => {
      if (!isZoomingAllowed) {
        return;
      }

      handleTriggerAction("zoomOutTool", { previousAction: actualAction });
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "1", mod: false, shift: true },
    () => {
      if (!isZoomingAllowed) {
        return;
      }

      handleTriggerAction("fitToScreenTool", {
        previousAction: actualAction,
        overrideZoom: false,
      });
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "2", mod: false, shift: true },
    () => {
      if (!isZoomingAllowed) {
        return;
      }

      handleTriggerAction("fitToSelectionTool", {
        previousAction: actualAction,
        overrideZoom: false,
      });
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "3", mod: false, shift: true },
    () => {
      if (!isZoomingAllowed) {
        return;
      }

      handleTriggerAction("fitToPageTool", {
        previousAction: actualAction,
        overrideZoom: false,
      });
    },
    {
      enabled: keysEnabled,
    },
  );

  // OTHER HOTKEYS

  useHotkey(
    { key: "L", mod: true, alt: false, shift: true },
    () => {
      handlePrintToConsoleState();
    },
    {
      enabled: keysEnabled,
    },
  );

  useHotkey(
    { key: "7", mod: true, alt: false, shift: false },
    () => {
      if (!instance) {
        return;
      }

      if (selectedNodes.length === 2) {
        const image = selectedNodes.find(
          (n) => n.node?.type === WEAVE_IMAGE_NODE_TYPE,
        );
        const reference = selectedNodes.find(
          (n) => n.node?.type !== WEAVE_IMAGE_NODE_TYPE,
        );

        if (image && reference) {
          const imageHandler = instance.getNodeHandler(WEAVE_IMAGE_NODE_TYPE);

          if (imageHandler) {
            try {
              imageHandler.cropImageWithReference(
                image.instance,
                reference.instance,
              );
            } catch (e) {
              if (e instanceof Error && e.cause === "RotationNotAligned") {
                toast.error(
                  "The selected image cannot be cropped. Check that both elements, image and reference, have the same rotation angle and try again.",
                );
              }
              if (e instanceof Error && e.cause === "InvalidImageNode") {
                toast.error(
                  "The provided element defined as an Image is not valid.",
                );
              }
            }
          }
        } else {
          toast.error(
            "To crop an image with reference to another element, select both the image and the reference element and try again.",
          );
        }
      } else {
        toast.error(
          "To crop an image with reference to another element, select both the image and the reference element and try again.",
        );
      }
    },
    {
      enabled: keysEnabled,
    },
  );
}
