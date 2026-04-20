// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { useCollaborationRoom } from "@/store/store";
import { PositionProperties } from "./../node-properties/position-properties";
import { SizeProperties } from "./../node-properties/size-properties";
import { AppearanceProperties } from "./../node-properties/appearance-properties";
import { FillProperties } from "./../node-properties/fill-properties";
import { StrokeProperties } from "./../node-properties/stroke-properties";
import { TextProperties } from "./../node-properties/text-properties";
import { ImageProperties } from "../node-properties/image-properties";
import { ColorTokenProperties } from "../node-properties/color-token-properties";
import { FrameProperties } from "../node-properties/frame-properties";
import { EyeOff, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeaveSelection } from "@inditextech/weave-types";
import { MetaProperties } from "../node-properties/meta-properties";
import { EllipseProperties } from "../node-properties/ellipse-properties";
import { StarProperties } from "../node-properties/star-properties";
import { ArrowProperties } from "../node-properties/arrow-properties";
import { RegularPolygonProperties } from "../node-properties/regular-polygon-properties";
import { AlignProperties } from "../node-properties/align-properties";
import { useNodeActionName } from "./hooks/use-node-action-name";
import { ImageTemplateProperties } from "../node-properties/image-template-properties";
import { SidebarSelector } from "../sidebar-selector";
import { SidebarHeader } from "../sidebar-header";
import { SIDEBAR_ELEMENTS } from "@/lib/constants";
import { WEAVE_IMAGE_TOOL_ACTION_NAME } from "@inditextech/weave-sdk";
import { cn } from "@/lib/utils";

export const NodeProperties = () => {
  const instance = useWeave((state) => state.instance);
  const actualAction = useWeave((state) => state.actions.actual);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const setNode = useWeave((state) => state.setNode);

  const sidebarActive = useCollaborationRoom((state) => state.sidebar.active);
  const setSidebarActive = useCollaborationRoom(
    (state) => state.setSidebarActive,
  );
  const setNodePropertiesAction = useCollaborationRoom(
    (state) => state.setNodePropertiesAction,
  );
  const nodePropertiesAction = useCollaborationRoom(
    (state) => state.nodeProperties.action,
  );

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
      setSidebarActive(SIDEBAR_ELEMENTS.images);
      return;
    }

    if (node) {
      setNodePropertiesAction("update");
      setSidebarActive(SIDEBAR_ELEMENTS.nodeProperties);
    }
  }, [actualAction, node, nodes, setSidebarActive, setNodePropertiesAction]);

  React.useEffect(() => {
    if (!instance) return;

    function handleOnNodeChange({ node }: WeaveSelection) {
      setNode(node);
    }

    instance.addEventListener("onNodeChange", handleOnNodeChange);

    return () => {
      instance.removeEventListener("onNodeChange", handleOnNodeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, instance]);

  const title = useNodeActionName();

  if (sidebarActive !== "nodeProperties") {
    return null;
  }

  return (
    <div
      className={cn("w-full h-full", {
        ["hidden pointer-events-none"]:
          sidebarActive !== SIDEBAR_ELEMENTS.nodeProperties,
        ["block pointer-events-auto"]:
          sidebarActive === SIDEBAR_ELEMENTS.nodeProperties,
      })}
    >
      <SidebarHeader
        actions={
          <div className="flex justify-end items-center gap-1">
            {nodePropertiesAction === "update" && (
              <>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onPointerDown={() => {
                    if (!instance) return;

                    for (const node of nodes) {
                      const isVisible = instance.allNodesVisible([
                        node.instance,
                      ]);

                      if (!isVisible) {
                        instance.showNode(node.instance);
                        continue;
                      }
                      if (isVisible) {
                        instance.hideNode(node.instance);
                      }
                    }
                  }}
                  onClick={() => {
                    if (!instance) return;

                    for (const node of nodes) {
                      const isVisible = instance.allNodesVisible([
                        node.instance,
                      ]);

                      if (!isVisible) {
                        instance.showNode(node.instance);
                        continue;
                      }
                      if (isVisible) {
                        instance.hideNode(node.instance);
                      }
                    }
                  }}
                >
                  <EyeOff size={16} strokeWidth={1} />
                </button>
                <button
                  className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                  onClick={() => {
                    if (!instance) return;

                    for (const node of nodes) {
                      const isLocked = instance.allNodesLocked([node.instance]);

                      if (!isLocked) {
                        instance.lockNode(node.instance);
                        continue;
                      }
                      if (isLocked) {
                        instance.unlockNode(node.instance);
                      }
                    }
                  }}
                >
                  <Lock size={16} strokeWidth={1} />
                </button>
              </>
            )}
          </div>
        }
      >
        <SidebarSelector title={title} />
      </SidebarHeader>
      <ScrollArea className="w-full h-[calc(100%-73px)]">
        <div className="w-full flex flex-col">
          <MetaProperties />
          <ImageProperties />
          <ColorTokenProperties />
          <ImageTemplateProperties />
          <FrameProperties />
          <PositionProperties />
          <SizeProperties />
          <AlignProperties />
          <EllipseProperties />
          <ArrowProperties />
          <StarProperties />
          <RegularPolygonProperties />
          <AppearanceProperties />
          <FillProperties />
          <StrokeProperties />
          <TextProperties />
          <div className="w-full h-[24px]"></div>
        </div>
      </ScrollArea>
    </div>
  );
};
