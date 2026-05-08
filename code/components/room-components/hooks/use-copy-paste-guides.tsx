// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { toast } from "sonner";
import { useWeave } from "@inditextech/weave-react";
import React from "react";
import {
  WEAVE_NODES_SELECTION_KEY,
  WeaveNodesSelectionPlugin,
} from "@inditextech/weave-sdk";
import { SidebarActive, useCollaborationRoom } from "@/store/store";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";

export const useCopyPasteGuides = () => {
  const instance = useWeave((state) => state.instance);

  const viewType = useCollaborationRoom((state) => state.viewType);
  const setShowRightSidebarFloating = useCollaborationRoom(
    (state) => state.setShowRightSidebarFloating,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );

  const sidebarToggle = React.useCallback(
    (element: SidebarActive) => {
      if (viewType === "floating") {
        setShowRightSidebarFloating(true);
      }
      setSidebarActive(element);
    },
    [setSidebarActive, viewType, setShowRightSidebarFloating],
  );

  const copyGuides = React.useCallback(
    async (containerId?: string) => {
      if (!instance) {
        return;
      }

      const nodesSelectionPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>(
          WEAVE_NODES_SELECTION_KEY,
        );

      if (!nodesSelectionPlugin) {
        return;
      }

      const snappingManagerPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>(
          WEAVE_NODES_SELECTION_KEY,
        );

      if (!snappingManagerPlugin) {
        return;
      }

      let selectedContainerId: string = instance.getMainLayer()?.id() ?? "";
      if (!containerId) {
        const selectedNodes = nodesSelectionPlugin.getSelectedNodes();

        if (selectedNodes.length > 1) {
          toast.error("Please select a single container to copy guides from");
          return;
        }

        if (
          selectedNodes.length === 1 &&
          selectedNodes[0].getAttrs().nodeType !== "frame"
        ) {
          toast.error("Please select a container to copy guides from");
          return;
        }

        if (selectedNodes.length === 1) {
          selectedContainerId = selectedNodes[0].id();
        }
      } else {
        const container = instance.getStage().findOne(`#${containerId}`);

        if (!container) {
          toast.error("Container not found, please select another container");
          return;
        }

        if (
          container.id() !== instance.getMainLayer()?.id() &&
          container.getAttrs().nodeType !== "frame"
        ) {
          toast.error("Please select a container to copy guides from");
          return;
        }

        selectedContainerId = container.id();
      }

      try {
        await snappingManagerPlugin.copyContainerGuidesToClipboard(
          selectedContainerId,
        );
        toast.success("Guides copied to clipboard");
      } catch (err) {
        const e = err as Error;
        if (e.message === "No guides to copy") {
          toast.error("No guides to copy, please select another container");
          return;
        }
        if (e.message === "Container not found") {
          toast.error("Container not found, please select another container");
          return;
        }
        toast.error("Failed to copy guides to clipboard, please try again");
        return;
      }
    },
    [instance],
  );

  const pasteGuides = React.useCallback(
    async (containerId?: string) => {
      if (!instance) {
        return;
      }

      const nodesSelectionPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>(
          WEAVE_NODES_SELECTION_KEY,
        );

      if (!nodesSelectionPlugin) {
        return;
      }

      const snappingManagerPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>(
          WEAVE_NODES_SELECTION_KEY,
        );

      if (!snappingManagerPlugin) {
        return;
      }

      let selectedContainerId: string = instance.getMainLayer()?.id() ?? "";
      if (!containerId) {
        const selectedNodes = nodesSelectionPlugin.getSelectedNodes();

        if (selectedNodes.length > 1) {
          toast.error("Please select a single container to copy guides from");
          return;
        }

        if (
          selectedNodes.length === 1 &&
          selectedNodes[0].getAttrs().nodeType !== "frame"
        ) {
          toast.error("Please select a container to copy guides from");
          return;
        }

        if (selectedNodes.length === 1) {
          selectedContainerId = selectedNodes[0].id();
        }
      } else {
        const container = instance.getStage().findOne(`#${containerId}`);

        if (!container) {
          toast.error("Container not found, please select another container");
          return;
        }

        if (
          container.id() !== instance.getMainLayer()?.id() &&
          container.getAttrs().nodeType !== "frame"
        ) {
          toast.error("Please select a container to copy guides from");
          return;
        }

        selectedContainerId = container.id();
      }

      try {
        await snappingManagerPlugin.pasteGuidesFromClipboard(
          selectedContainerId,
        );

        toast.success("Guides pasted from clipboard");

        if (
          !snappingManagerPlugin
            .getGuidesManager()
            .isCustomGuidesVisible(selectedContainerId)
        ) {
          snappingManagerPlugin
            .getGuidesManager()
            .toggleCustomGuides(selectedContainerId);
        }

        sidebarToggle(SIDEBAR_ELEMENTS.guides);
      } catch (err) {
        const e = err as Error;
        if (e.message === "Clipboard does not contain valid guides data") {
          toast.error(
            "No guides data found in clipboard, please copy guides from a container first",
          );
          return;
        }
        if (e.message === "Cannot parse clipboard data as guides") {
          toast.error(
            "Failed to read guides data from clipboard, please try again",
          );
          return;
        }
        toast.error("Failed to paste guides from clipboard, please try again");
      }
    },
    [sidebarToggle, instance],
  );
  const toggleContainerGuides = React.useCallback(
    (containerId: string) => {
      if (!instance) {
        return;
      }

      const nodesSelectionPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>(
          WEAVE_NODES_SELECTION_KEY,
        );

      if (!nodesSelectionPlugin) {
        return;
      }

      const snappingManagerPlugin =
        instance.getPlugin<WeaveNodesSelectionPlugin>(
          WEAVE_NODES_SELECTION_KEY,
        );

      if (!snappingManagerPlugin) {
        return;
      }

      const container = instance.getStage().findOne(`#${containerId}`);

      if (!container) {
        toast.error("Container not found, please select another container");
        return;
      }

      if (
        container.id() !== instance.getMainLayer()?.id() &&
        container.getAttrs().nodeType !== "frame"
      ) {
        toast.error("Please select a container to toggle guides from");
        return;
      }

      snappingManagerPlugin.getGuidesManager().toggleCustomGuides(containerId);
    },
    [instance],
  );

  return {
    copyGuides,
    pasteGuides,
    toggleContainerGuides,
  };
};
