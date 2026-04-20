// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { X, Check } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { bottomElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import {
  WEAVE_IMAGE_CROP_END_TYPE,
  WEAVE_IMAGE_TOOL_ACTION_NAME,
} from "@inditextech/weave-sdk";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { useIAChat } from "@/store/ia-chat";

export function ToolsNodeOverlay() {
  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const imageCroppingEnabled = useCollaborationRoom(
    (state) => state.images.cropping.enabled,
  );
  const imageCroppingNode = useCollaborationRoom(
    (state) => state.images.cropping.node,
  );
  const nodePropertiesAction: "create" | "update" | undefined =
    useCollaborationRoom((state) => state.nodeProperties.action);
  const nodeCreateProps = useCollaborationRoom(
    (state) => state.nodeProperties.createProps,
  );
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const setNodePropertiesAction = useCollaborationRoom(
    (state) => state.setNodePropertiesAction,
  );

  const aiChatEnabled = useIAChat((state) => state.enabled);

  React.useEffect(() => {
    if (
      actualAction &&
      [
        "rectangleTool",
        "ellipseTool",
        "regularPolygonTool",
        "brushTool",
        WEAVE_IMAGE_TOOL_ACTION_NAME,
        "videoTool",
        "starTool",
        "strokeTool",
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

    if ((!actualAction || !node) && nodes.length === 0) {
      setNodePropertiesAction(undefined);
      setSidebarActive(
        aiChatEnabled ? SIDEBAR_ELEMENTS.aiChat : SIDEBAR_ELEMENTS.images,
      );
      return;
    }

    if (node) {
      setNodePropertiesAction("update");
      setSidebarActive(SIDEBAR_ELEMENTS.nodeProperties);
    }
  }, [
    aiChatEnabled,
    actualAction,
    node,
    nodes,
    setSidebarActive,
    setNodePropertiesAction,
  ]);

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

  const croppingTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (imageCroppingEnabled && imageCroppingNode) {
      actualNodeTools.push(
        <React.Fragment key="image-cropping-tools">
          <ToolbarButton
            className="rounded-none !w-[40px]"
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
            className="rounded-none !w-[40px]"
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
            tooltipSide="bottom"
            tooltipAlign="center"
          />
        </React.Fragment>,
      );
    }
    return actualNodeTools;
  }, [
    instance,
    weaveConnectionStatus,
    imageCroppingEnabled,
    imageCroppingNode,
  ]);

  if (!actualNode && !imageCroppingEnabled && actualAction !== "commentTool") {
    return null;
  }

  if (croppingTools.length === 0) {
    return null;
  }

  if (nodePropertiesAction === "update" && croppingTools.length === 0) {
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
      variants={bottomElementVariants}
      className="pointer-events-none absolute right-[8px] left-[8px] top-[8px] flex flex-col gap-5 justify-center items-center"
    >
      {croppingTools.length > 0 && (
        <Toolbar orientation="horizontal">{croppingTools}</Toolbar>
      )}
    </motion.div>
  );
}
