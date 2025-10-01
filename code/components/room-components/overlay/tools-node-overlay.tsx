// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { X, Check } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { rightElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { useKeyboardHandler } from "../hooks/use-keyboard-handler";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { WEAVE_IMAGE_CROP_END_TYPE } from "@inditextech/weave-sdk";

export function ToolsNodeOverlay() {
  useKeyboardHandler();

  const [actualNodeKey, setActualNodeKey] = React.useState("");

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

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
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive
  );
  const setNodePropertiesAction = useCollaborationRoom(
    (state) => state.setNodePropertiesAction
  );

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
    }
  }, [actualAction, actualNode, actualNodeKey, nodePropertiesAction]);

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

  if (!actualNode && !imageCroppingEnabled) {
    return null;
  }

  if (!showUI) {
    return null;
  }

  if (commonCreateNodeTools.length === 0 && croppingTools.length === 0) {
    return null;
  }

  if (nodes.length >= 2) {
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
      {(commonCreateNodeTools.length > 0 || croppingTools.length > 0) && (
        <Toolbar
          orientation="vertical"
          className="grid grid-cols-1 w-auto justify-start items-center rounded-3xl"
        >
          {commonCreateNodeTools}
          {croppingTools}
        </Toolbar>
      )}
    </motion.div>
  );
}
