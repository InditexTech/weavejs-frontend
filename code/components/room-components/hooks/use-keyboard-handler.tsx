// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useWeave } from "@inditextech/weave-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import {
  WEAVE_IMAGE_TOOL_ACTION_NAME,
  WEAVE_IMAGES_TOOL_ACTION_NAME,
  WeaveNodesSelectionPlugin,
  WeaveUsersPointersPlugin,
} from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";

export function useKeyboardHandler() {
  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

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
    (toolName: string, params?: unknown) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName, params);
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction],
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive],
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

  // TOOLBAR HOTKEYS

  // MOVE, SELECTION AND DELETE TOOLS

  useHotkey({ key: "M", mod: false, shift: false }, () => {
    triggerTool("moveTool");
  });

  useHotkey({ key: "S", mod: false, shift: false }, () => {
    triggerTool("selectionTool");
  });

  useHotkey({ key: "D", mod: false, shift: false }, () => {
    triggerTool("eraserTool");
  });

  // SHAPES TOOLS

  useHotkey({ key: "R", mod: false, shift: false }, () => {
    triggerTool("rectangleTool");
  });

  useHotkey({ key: "E", mod: false, shift: false }, () => {
    triggerTool("ellipseTool");
  });

  useHotkey({ key: "P", mod: false, shift: false }, () => {
    triggerTool("regularPolygonTool");
  });

  useHotkey({ key: "J", mod: false, shift: false }, () => {
    triggerTool("starTool");
  });

  useHotkey({ key: "L", mod: false, shift: false }, () => {
    triggerTool("strokeTool");
  });

  useHotkey({ key: "B", mod: false, shift: false }, () => {
    triggerTool("brushTool");
  });

  useHotkey({ key: "Q", mod: false, shift: false }, () => {
    triggerTool("arrowTool");
  });

  // MEDIA TOOLS

  useHotkey({ key: "I", mod: false, shift: false }, () => {
    triggerTool(WEAVE_IMAGE_TOOL_ACTION_NAME);
    setShowSelectFileImage(true);
  });

  useHotkey({ key: "O", mod: false, shift: false }, () => {
    triggerTool(WEAVE_IMAGES_TOOL_ACTION_NAME);
    setShowSelectFileImage(true);
  });

  // TEXT TOOLS

  useHotkey({ key: "T", mod: false, shift: false }, () => {
    triggerTool("textTool");
  });

  // OTHER TOOLS

  useHotkey({ key: "F", mod: false, shift: false }, () => {
    triggerTool("frameTool");
  });

  useHotkey({ key: "K", mod: false, shift: false }, () => {
    triggerTool("colorTokenTool");
  });

  useHotkey({ key: "X", mod: false, shift: false }, () => {
    triggerTool("connectorTool");
  });

  useHotkey({ key: "H", mod: false, shift: false }, () => {
    if (!threadsEnabled) {
      return;
    }

    triggerTool("commentTool");
    sidebarToggle(SIDEBAR_ELEMENTS.comments);
  });

  // UNDO / REDO

  useHotkey({ key: "Z", mod: true, shift: false }, () => {
    if (!instance) {
      return;
    }

    const actualStore = instance.getStore();
    actualStore.undoStateStep();
  });

  useHotkey({ key: "Y", mod: true, shift: false }, () => {
    if (!instance) {
      return;
    }

    const actualStore = instance.getStore();
    actualStore.redoStateStep();
  });

  // VISIBILITY HOTKEYS

  useHotkey({ key: "U", mod: true, shift: true }, () => {
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
  });

  // SELECTION HOTKEYS

  useHotkey({ key: "A", mod: true, shift: true }, () => {
    if (!instance) {
      return;
    }

    const selectionPlugin =
      instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

    if (!selectionPlugin) {
      return;
    }

    selectionPlugin.selectAll();
  });

  useHotkey({ key: "Escape", mod: false, shift: true }, () => {
    if (!instance) {
      return;
    }

    const selectionPlugin =
      instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");

    if (!selectionPlugin) {
      return;
    }

    selectionPlugin.selectNone();
  });

  // Z-INDEX HOTKEYS

  useHotkey({ key: "BracketRight", mod: false, shift: false }, () => {
    if (!instance) {
      return;
    }

    if (selectedNodes.length !== 1) {
      return;
    }

    instance.bringToFront(selectedNodes[0].instance);
  });

  useHotkey({ key: "BracketRight", mod: false, shift: true }, () => {
    if (!instance) {
      return;
    }

    if (selectedNodes.length !== 1) {
      return;
    }

    instance.moveUp(selectedNodes[0].instance);
  });

  useHotkey({ key: "BracketLeft", mod: false, shift: true }, () => {
    if (!instance) {
      return;
    }

    if (selectedNodes.length !== 1) {
      return;
    }

    instance.moveDown(selectedNodes[0].instance);
  });

  useHotkey({ key: "BracketLeft", mod: false, shift: false }, () => {
    if (!instance) {
      return;
    }

    if (selectedNodes.length !== 1) {
      return;
    }

    instance.sendToBack(selectedNodes[0].instance);
  });

  // GROUPING HOTKEYS

  useHotkey({ key: "G", mod: true, shift: false }, () => {
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
  });

  useHotkey({ key: "U", mod: true, shift: false }, () => {
    if (!instance) {
      return;
    }

    if (selectedNodes.length !== 1 || selectedNodes[0].node?.type !== "group") {
      return;
    }

    instance.unGroup(selectedNodes[0].node);
  });

  // SIDEBARS HOTKEYS

  useHotkey({ key: "I", mod: true, alt: true, shift: false }, () => {
    sidebarToggle(SIDEBAR_ELEMENTS.images);
  });

  useHotkey({ key: "V", mod: true, alt: true, shift: false }, () => {
    sidebarToggle(SIDEBAR_ELEMENTS.videos);
  });

  useHotkey({ key: "C", mod: true, alt: true, shift: false }, () => {
    sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
  });

  useHotkey({ key: "F", mod: true, alt: true, shift: false }, () => {
    sidebarToggle(SIDEBAR_ELEMENTS.frames);
  });

  useHotkey({ key: "T", mod: true, alt: true, shift: false }, () => {
    sidebarToggle(SIDEBAR_ELEMENTS.templates);
  });

  useHotkey({ key: "E", mod: true, alt: true, shift: false }, () => {
    sidebarToggle(SIDEBAR_ELEMENTS.nodesTree);
  });

  // ZOOM HOTKEYS

  useHotkey({ key: "ArrowDown", mod: false, shift: true }, () => {
    if (!isZoomingAllowed) {
      return;
    }

    handleTriggerAction("zoomInTool", { previousAction: actualAction });
  });

  useHotkey({ key: "ArrowUp", mod: false, shift: true }, () => {
    if (!isZoomingAllowed) {
      return;
    }

    handleTriggerAction("zoomOutTool", { previousAction: actualAction });
  });

  useHotkey({ key: "1", mod: false, shift: true }, () => {
    if (!isZoomingAllowed) {
      return;
    }

    handleTriggerAction("fitToScreenTool", {
      previousAction: actualAction,
      overrideZoom: false,
    });
  });

  useHotkey({ key: "2", mod: false, shift: true }, () => {
    if (!isZoomingAllowed) {
      return;
    }

    handleTriggerAction("fitToSelectionTool", {
      previousAction: actualAction,
      overrideZoom: false,
    });
  });

  useHotkey({ key: "3", mod: false, shift: true }, () => {
    if (!isZoomingAllowed) {
      return;
    }

    handleTriggerAction("fitToPageTool", {
      previousAction: actualAction,
      overrideZoom: false,
    });
  });

  // OTHER HOTKEYS

  useHotkey({ key: "L", mod: true, alt: false, shift: true }, () => {
    handlePrintToConsoleState();
  });
}
