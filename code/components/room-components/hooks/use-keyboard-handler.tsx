// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { v4 as uuidv4 } from "uuid";
import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { useKeyDown } from "../hooks/use-key-down";
import { SYSTEM_OS } from "@/lib/utils";
import { useGetOs } from "../hooks/use-get-os";
import {
  WeaveExportNodesActionParams,
  WeaveExportStageActionParams,
  WeaveNodesSelectionPlugin,
  WeaveUsersPointersPlugin,
} from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useIACapabilities } from "@/store/ia";
import { useIACapabilitiesV2 } from "@/store/ia-v2";

export function useKeyboardHandler() {
  const os = useGetOs();

  const instance = useWeave((state) => state.instance);
  const selectedNodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const aiEnabled = useIACapabilities((state) => state.enabled);

  const showUI = useCollaborationRoom((state) => state.ui.show);
  const setShowUi = useCollaborationRoom((state) => state.setShowUi);
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const setShowSelectFileImage = useCollaborationRoom(
    (state) => state.setShowSelectFileImage
  );
  const threadsEnabled = useCollaborationRoom(
    (state) => state.features.threads
  );
  const workloadsEnabled = useCollaborationRoom(
    (state) => state.features.workloads
  );

  const showMinimap = useCollaborationRoom((state) => state.ui.minimap);
  const setShowMinimap = useCollaborationRoom((state) => state.setShowMinimap);

  const imagesLLMPopupType = useIACapabilities((state) => state.llmPopup.type);
  const imagesLLMPopupVisible = useIACapabilities(
    (state) => state.llmPopup.visible
  );
  const setImagesLLMPopupType = useIACapabilities(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisible = useIACapabilities(
    (state) => state.setImagesLLMPopupVisible
  );

  const imagesLLMPopupTypeV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.type
  );
  const imagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.llmPopup.visible
  );
  const setImagesLLMPopupTypeV2 = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupType
  );
  const setImagesLLMPopupVisibleV2 = useIACapabilitiesV2(
    (state) => state.setImagesLLMPopupVisible
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
    [instance, actualAction]
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      setSidebarActive(element);
    },
    [setSidebarActive]
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

  /* Keyboard shortcuts toolbar */
  const keyDownHandler = React.useCallback(
    async (event: KeyboardEvent) => {
      if (event.code === "KeyM") {
        event.preventDefault();
        triggerTool("moveTool");
      }

      if (event.code === "KeyS") {
        event.preventDefault();
        triggerTool("selectionTool");
      }

      if (event.code === "KeyD") {
        event.preventDefault();
        triggerTool("eraserTool");
      }

      if (event.code === "KeyF" && !(event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        triggerTool("frameTool");
      }

      if (event.code === "KeyR") {
        event.preventDefault();
        triggerTool("rectangleTool");
      }

      if (event.code === "KeyE") {
        event.preventDefault();
        triggerTool("ellipseTool");
      }

      if (event.code === "KeyP") {
        event.preventDefault();
        triggerTool("regularPolygonTool");
      }

      if (event.code === "KeyL") {
        event.preventDefault();
        triggerTool("penTool");
      }

      if (event.code === "KeyB") {
        event.preventDefault();
        triggerTool("brushTool");
      }

      if (event.code === "KeyX") {
        event.preventDefault();
        triggerTool("connectorTool");
      }

      if (
        event.code === "KeyT" &&
        !event.shiftKey &&
        !event.altKey &&
        !([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey)
      ) {
        event.preventDefault();
        triggerTool("textTool");
      }

      if (event.code === "KeyI" && !(event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        triggerTool("imageTool");
        setShowSelectFileImage(true);
      }

      if (event.code === "KeyO" && !(event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        triggerTool("imagesTool");
        setShowSelectFileImage(true);
      }

      if (event.code === "KeyJ") {
        event.preventDefault();
        triggerTool("starTool");
      }

      if (event.code === "KeyA") {
        event.preventDefault();
        triggerTool("arrowTool");
      }

      if (event.code === "KeyK" && !(event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        triggerTool("colorTokenTool");
      }

      if (
        event.code === "KeyZ" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance
      ) {
        const actualStore = instance.getStore();
        actualStore.undoStateStep();
      }

      if (
        event.code === "KeyY" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance
      ) {
        const actualStore = instance.getStore();
        actualStore.redoStateStep();
      }

      /* Keyboard shortcuts visibility */

      if (
        event.code === "IntlBackslash" &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        setShowUi(!showUI);
      }

      if (
        event.code === "KeyU" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance
      ) {
        const usersPointersPlugin =
          instance.getPlugin<WeaveUsersPointersPlugin>("usersPointers");
        if (usersPointersPlugin && usersPointersPlugin.isEnabled()) {
          usersPointersPlugin.disable();
        }
        if (usersPointersPlugin && !usersPointersPlugin.isEnabled()) {
          usersPointersPlugin.enable();
        }
      }

      /* Keyboard shortcuts selection */

      if (
        event.code === "KeyA" &&
        event.shiftKey &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance
      ) {
        const selectionPlugin =
          instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
        if (selectionPlugin) {
          selectionPlugin.selectAll();
        }
      }

      if (event.code === "Escape" && event.shiftKey && instance) {
        const selectionPlugin =
          instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
        if (selectionPlugin) {
          selectionPlugin.selectNone();
        }
      }

      /* Keyboard shortcuts editing */

      if (
        event.code === "KeyE" &&
        event.shiftKey &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length === 1
      ) {
        if (instance && selectedNodes.length === 1) {
          instance.triggerAction<WeaveExportNodesActionParams, void>(
            "exportNodeTool",
            {
              nodes: selectedNodes.map((node) => node.instance),
              options: {
                padding: 20,
                pixelRatio: 2,
              },
            }
          );
        }
      }

      if (
        event.code === "KeyV" &&
        event.shiftKey &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance
      ) {
        const image = await instance.triggerAction<
          WeaveExportStageActionParams,
          Promise<HTMLImageElement>
        >("exportStageTool", {
          options: {
            padding: 20,
            pixelRatio: 2,
          },
        });

        const link = document.createElement("a");
        link.href = image.src;
        link.download = `${uuidv4()}image/png`;
        link.click();
      }

      /* Keyboard shortcuts arrange */

      if (
        event.code === "BracketRight" &&
        !([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length === 1
      ) {
        instance.bringToFront(selectedNodes[0].instance);
      }

      if (
        event.code === "BracketRight" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length === 1
      ) {
        instance.moveUp(selectedNodes[0].instance);
      }

      if (
        event.code === "BracketLeft" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length === 1
      ) {
        instance.moveDown(selectedNodes[0].instance);
      }

      if (
        event.code === "BracketLeft" &&
        !([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length === 1
      ) {
        instance.sendToBack(selectedNodes[0].instance);
      }

      if (
        event.code === "KeyG" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length > 1
      ) {
        instance.group(
          selectedNodes
            .map((n) => n?.node)
            .filter((node) => typeof node !== "undefined")
        );
      }

      if (
        event.code === "KeyU" &&
        ([SYSTEM_OS.MAC as string].includes(os)
          ? event.metaKey
          : event.ctrlKey) &&
        instance &&
        selectedNodes.length === 1 &&
        selectedNodes[0].node?.type === "group"
      ) {
        instance.unGroup(selectedNodes[0].node);
      }

      /* Keyboard shortcuts sidebars */

      if (
        event.code === "KeyI" &&
        event.shiftKey &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        event.preventDefault();
        event.stopPropagation();
        sidebarToggle(SIDEBAR_ELEMENTS.images);
      }

      if (
        event.code === "KeyV" &&
        event.shiftKey &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        event.preventDefault();
        event.stopPropagation();
        sidebarToggle(SIDEBAR_ELEMENTS.videos);
      }

      if (
        event.code === "KeyC" &&
        event.shiftKey &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        event.preventDefault();
        event.stopPropagation();
        sidebarToggle(SIDEBAR_ELEMENTS.colorTokens);
      }

      if (
        event.code === "KeyF" &&
        event.shiftKey &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        event.preventDefault();
        event.stopPropagation();
        sidebarToggle(SIDEBAR_ELEMENTS.frames);
      }

      if (
        event.code === "KeyT" &&
        event.shiftKey &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        event.preventDefault();
        event.stopPropagation();
        sidebarToggle(SIDEBAR_ELEMENTS.templates);
      }

      if (
        event.code === "KeyE" &&
        event.shiftKey &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        event.preventDefault();
        event.stopPropagation();
        sidebarToggle(SIDEBAR_ELEMENTS.nodesTree);
      }

      /* Keyboard shortcuts zoom */

      if (
        event.code === "BracketRight" &&
        isZoomingAllowed &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        handleTriggerAction("zoomInTool", { previousAction: actualAction });
      }

      if (
        event.code === "Slash" &&
        isZoomingAllowed &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        handleTriggerAction("zoomOutTool", { previousAction: actualAction });
      }

      if (event.code === "Digit1" && isZoomingAllowed && event.shiftKey) {
        handleTriggerAction("fitToScreenTool", {
          previousAction: actualAction,
        });
      }

      if (event.code === "Digit2" && isZoomingAllowed && event.shiftKey) {
        handleTriggerAction("fitToSelectionTool", {
          previousAction: actualAction,
        });
      }

      /* Keyboard shortcuts utility */

      if (
        event.code === "KeyC" &&
        event.altKey &&
        ([SYSTEM_OS.MAC as string].includes(os) ? event.metaKey : event.ctrlKey)
      ) {
        handlePrintToConsoleState();
      }

      /* IA Utilities */

      if (event.code === "KeyG") {
        if (aiEnabled && !workloadsEnabled) {
          setImagesLLMPopupType("create");
          if (imagesLLMPopupType === "create") {
            setImagesLLMPopupVisible(!imagesLLMPopupVisible);
          } else {
            setImagesLLMPopupVisible(true);
          }
        }

        if (aiEnabled && workloadsEnabled) {
          setImagesLLMPopupTypeV2("create");
          if (imagesLLMPopupTypeV2 === "create") {
            setImagesLLMPopupVisibleV2(!imagesLLMPopupVisibleV2);
          } else {
            setImagesLLMPopupVisibleV2(true);
          }
        }
      }

      if (event.code === "KeyQ" && aiEnabled) {
        triggerTool("fuzzyMaskTool");
      }

      if (event.code === "KeyW" && aiEnabled) {
        triggerTool("maskTool");
      }

      /* Other tools */

      if (event.code === "KeyH" && threadsEnabled) {
        triggerTool("commentTool");
        sidebarToggle(SIDEBAR_ELEMENTS.comments);
      }

      if (event.code === "KeyN") {
        setShowMinimap(!showMinimap);
      }

      if (
        event.code === "KeyV" &&
        !(event.ctrlKey || event.metaKey) &&
        instance
      ) {
        const { finishUploadCallback } = instance.triggerAction(
          "videoTool"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any;

        instance.updatePropsAction("videoTool", { videoId: "testJesus" });

        const videoURLUploaded =
          "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm";
        finishUploadCallback?.(videoURLUploaded);
      }
    },
    [
      selectedNodes,
      actualAction,
      aiEnabled,
      showUI,
      threadsEnabled,
      workloadsEnabled,
      os,
      instance,
      isZoomingAllowed,
      imagesLLMPopupType,
      imagesLLMPopupVisible,
      setImagesLLMPopupType,
      setImagesLLMPopupVisible,
      imagesLLMPopupTypeV2,
      imagesLLMPopupVisibleV2,
      setImagesLLMPopupTypeV2,
      setImagesLLMPopupVisibleV2,
      showMinimap,
      setShowMinimap,
      setShowUi,
      sidebarToggle,
      handleTriggerAction,
      handlePrintToConsoleState,
      triggerTool,
      setShowSelectFileImage,
    ]
  );

  useKeyDown(keyDownHandler);
}
