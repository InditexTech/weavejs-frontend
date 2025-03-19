"use client";

import React from "react";
import { useWeave } from "@inditextech/weavejs-react";
import { useCollaborationRoom } from "@/store/store";
import { useKeyDown } from "../hooks/use-key-down";
import { SYSTEM_OS } from "@/lib/utils";
import { useGetOs } from "../hooks/use-get-os";
import {
  WeaveCopyPasteNodesPlugin,
  WeaveExportNodeActionParams,
  WeaveExportStageActionParams,
  WeaveNodesSelectionPlugin,
  WeaveUsersPointersPlugin,
} from "@inditextech/weavejs-sdk";

export function useKeyboardHandler() {
  const os = useGetOs();

  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const showUI = useCollaborationRoom((state) => state.ui.show);
  const setShowUi = useCollaborationRoom((state) => state.setShowUi);
  const framesLibraryVisible = useCollaborationRoom(
    (state) => state.frames.library.visible
  );
  const setFramesLibraryVisible = useCollaborationRoom(
    (state) => state.setFramesLibraryVisible
  );
  const imagesLibraryVisible = useCollaborationRoom(
    (state) => state.images.library.visible
  );
  const setImagesLibraryVisible = useCollaborationRoom(
    (state) => state.setImagesLibraryVisible
  );
  const pantonesLibraryVisible = useCollaborationRoom(
    (state) => state.pantones.library.visible
  );
  const setPantonesLibraryVisible = useCollaborationRoom(
    (state) => state.setPantonesLibraryVisible
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );

  const triggerTool = React.useCallback(
    (toolName: string) => {
      if (instance && actualAction !== toolName) {
        instance.triggerAction(toolName);
      }
      if (instance && actualAction === toolName) {
        instance.cancelAction(toolName);
      }
    },
    [instance, actualAction]
  );

  const libraryToggle = React.useCallback(
    (library: string) => {
      switch (library) {
        case "images":
          setPantonesLibraryVisible(false);
          setFramesLibraryVisible(false);
          setImagesLibraryVisible(!imagesLibraryVisible);
          break;
        case "pantones":
          setImagesLibraryVisible(false);
          setFramesLibraryVisible(false);
          setPantonesLibraryVisible(!pantonesLibraryVisible);
          break;
        case "frames":
          setImagesLibraryVisible(false);
          setPantonesLibraryVisible(false);
          setFramesLibraryVisible(!framesLibraryVisible);
          break;
        default:
          break;
      }
    },
    [
      pantonesLibraryVisible,
      framesLibraryVisible,
      imagesLibraryVisible,
      setImagesLibraryVisible,
      setPantonesLibraryVisible,
      setFramesLibraryVisible,
    ]
  );

  const handleTriggerAction = React.useCallback(
    (actionName: string) => {
      if (instance) {
        const triggerSelection = actualAction === "selectionTool";
        instance.triggerAction(actionName);
        if (triggerSelection) {
          instance.triggerAction("selectionTool");
        }
      }
    },
    [instance, actualAction]
  );

  const handlePrintToConsoleState = React.useCallback(() => {
    if (instance) {
      // eslint-disable-next-line no-console
      console.log({
        appState: JSON.parse(JSON.stringify(instance.getStore().getState())),
      });
    }
  }, [instance]);

  /* Keyboard shortcuts toolbar */

  useKeyDown(() => {
    triggerTool("selectionTool");
  }, ["KeyS"]);

  useKeyDown(
    () => {
      triggerTool("frameTool");
    },
    ["KeyF"],
    (e) => !(e.ctrlKey || e.metaKey)
  );

  useKeyDown(() => {
    triggerTool("rectangleTool");
  }, ["KeyR"]);

  useKeyDown(() => {
    triggerTool("penTool");
  }, ["KeyL"]);

  useKeyDown(() => {
    triggerTool("brushTool");
  }, ["KeyB"]);

  useKeyDown(() => {
    triggerTool("textTool");
  }, ["KeyT"]);

  useKeyDown(
    () => {
      triggerTool("imageTool");
      setShowSelectFileImage(true);
    },
    ["KeyI"],
    (e) => !(e.ctrlKey || e.metaKey)
  );

  useKeyDown(
    () => {
      triggerTool("pantoneTool");
    },
    ["KeyP"],
    (e) => !(e.ctrlKey || e.metaKey)
  );

  useKeyDown(
    () => {
      if (instance) {
        const actualStore = instance.getStore();
        actualStore.undoStateStep();
      }
    },
    ["Comma"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance) {
        const actualStore = instance.getStore();
        actualStore.redoStateStep();
      }
    },
    ["Period"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  /* Keyboard shortcuts visibility */

  useKeyDown(
    () => {
      setShowUi(!showUI);
    },
    ["IntlBackslash"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance) {
        const usersPointersPlugin =
          instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");
        if (usersPointersPlugin) {
          usersPointersPlugin.toggleRenderCursors();
        }
      }
    },
    ["KeyU"],
    (e) =>
      e.altKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  /* Keyboard shortcuts selection */

  useKeyDown(
    () => {
      if (instance) {
        const selectionPlugin =
          instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
        if (selectionPlugin) {
          selectionPlugin.selectAll();
        }
      }
    },
    ["KeyA"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance) {
        const selectionPlugin =
          instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
        if (selectionPlugin) {
          selectionPlugin.selectNone();
        }
      }
    },
    ["Escape"],
    (e) => e.shiftKey
  );

  /* Keyboard shortcuts editing */

  useKeyDown(
    () => {
      if (instance && selectedNodes.length > 0) {
        const weaveCopyPasteNodesPlugin =
          instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
        if (weaveCopyPasteNodesPlugin && weaveCopyPasteNodesPlugin.canCopy()) {
          weaveCopyPasteNodesPlugin.copy();
        }
      }
    },
    ["KeyC"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance) {
        const weaveCopyPasteNodesPlugin =
          instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
        if (weaveCopyPasteNodesPlugin && weaveCopyPasteNodesPlugin.canPaste()) {
          weaveCopyPasteNodesPlugin.paste();
        }
      }
    },
    ["KeyP"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance && selectedNodes.length === 1) {
        const weaveCopyPasteNodesPlugin =
          instance.getPlugin<WeaveCopyPasteNodesPlugin>("copyPasteNodes");
        if (weaveCopyPasteNodesPlugin && weaveCopyPasteNodesPlugin.canCopy()) {
          weaveCopyPasteNodesPlugin.copy();
          weaveCopyPasteNodesPlugin.paste();
        }
      }
    },
    ["KeyD"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance && selectedNodes.length === 1) {
        instance.triggerAction<WeaveExportNodeActionParams>("exportNodeTool", {
          node: selectedNodes[0].instance,
          options: {
            padding: 20,
            pixelRatio: 2,
          },
        });
      }
    },
    ["KeyE"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance) {
        instance.triggerAction<WeaveExportStageActionParams>(
          "exportStageTool",
          {
            options: {
              padding: 20,
              pixelRatio: 2,
            },
          }
        );
      }
    },
    ["KeyV"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  /* Keyboard shortcuts arrange */

  useKeyDown(
    () => {
      if (instance && selectedNodes.length === 1) {
        instance.bringToFront(selectedNodes[0].instance);
      }
    },
    ["BracketRight"],
    (e) => !([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance && selectedNodes.length === 1) {
        instance.moveUp(selectedNodes[0].instance);
      }
    },
    ["BracketRight"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance && selectedNodes.length === 1) {
        instance.moveDown(selectedNodes[0].instance);
      }
    },
    ["BracketLeft"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance && selectedNodes.length === 1) {
        instance.sendToBack(selectedNodes[0].instance);
      }
    },
    ["BracketLeft"],
    (e) => !([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (instance && selectedNodes.length > 1) {
        instance.group(selectedNodes.map((n) => n.node));
      }
    },
    ["KeyG"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      if (
        instance &&
        selectedNodes.length === 1 &&
        selectedNodes[0].node.type === "group"
      ) {
        instance.unGroup(selectedNodes[0].node);
      }
    },
    ["KeyU"],
    (e) =>
      e.shiftKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  /* Keyboard shortcuts sidebars */

  useKeyDown(
    () => {
      libraryToggle("images");
    },
    ["KeyI"],
    (e) =>
      e.altKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      libraryToggle("pantones");
    },
    ["KeyP"],
    (e) =>
      e.altKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      libraryToggle("frames");
    },
    ["KeyF"],
    (e) =>
      e.altKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  /* Keyboard shortcuts zoom */

  useKeyDown(
    () => {
      handleTriggerAction("zoomInTool");
    },
    ["BracketRight"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      handleTriggerAction("zoomOutTool");
    },
    ["Slash"],
    (e) => ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );

  useKeyDown(
    () => {
      handleTriggerAction("fitToScreenTool");
    },
    ["Digit1"],
    (e) => e.shiftKey
  );

  useKeyDown(
    () => {
      handleTriggerAction("fitToSelectionTool");
    },
    ["Digit2"],
    (e) => e.shiftKey
  );

  /* Keyboard shortcuts utility */

  useKeyDown(
    () => {
      handlePrintToConsoleState();
    },
    ["KeyC"],
    (e) =>
      e.altKey &&
      ([SYSTEM_OS.MAC as string].includes(os) ? e.metaKey : e.ctrlKey)
  );
}
