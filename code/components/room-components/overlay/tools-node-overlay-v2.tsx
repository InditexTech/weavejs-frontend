// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import Konva from "konva";
import { ToolbarButton } from "../toolbar/toolbar-button";
import { Lock, LockOpen } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { Toolbar } from "../toolbar/toolbar";
import { motion } from "framer-motion";
import { rightElementVariants } from "./variants";
import { useCollaborationRoom } from "@/store/store";
import {
  WEAVE_STORE_CONNECTION_STATUS,
  WeaveElementInstance,
} from "@inditextech/weave-types";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";
import { IMAGE_TEMPLATE_FIT } from "@/components/nodes/image-template/constants";

export function ToolsNodeOverlayV2() {
  const [movingImageTemplate, setMovingImageTemplate] =
    React.useState<Konva.Group | null>(null);

  const instance = useWeave((state) => state.instance);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);
  const node = useWeave((state) => state.selection.node);
  const nodes = useWeave((state) => state.selection.nodes);
  const actualAction = useWeave((state) => state.actions.actual);

  const nodePropertiesAction: "create" | "update" | undefined =
    useCollaborationRoom((state) => state.nodeProperties.action);
  const showUI = useCollaborationRoom((state) => state.ui.show);

  React.useEffect(() => {
    if (!instance) return;

    function handleImageTemplateFreed({ template }: { template: Konva.Group }) {
      setMovingImageTemplate(template as Konva.Group);
    }

    function handleImageTemplateLocked({
      template,
    }: {
      template: Konva.Group;
    }) {
      if (
        movingImageTemplate?.getAttrs()?.id === (template.getAttrs().id ?? "")
      ) {
        setMovingImageTemplate(null);
      }
    }

    instance.addEventListener("onImageTemplateFreed", handleImageTemplateFreed);
    instance.addEventListener(
      "onImageTemplateLocked",
      handleImageTemplateLocked
    );

    return () => {
      instance.removeEventListener(
        "onImageTemplateFreed",
        handleImageTemplateFreed
      );
      instance.removeEventListener(
        "onImageTemplateLocked",
        handleImageTemplateLocked
      );
    };
  }, [instance, movingImageTemplate]);

  const singleLocked = React.useMemo(() => {
    return nodes.length === 1 && nodes[0].instance.getAttrs().locked;
  }, [nodes]);

  const actualNode = React.useMemo(() => {
    if (node && nodePropertiesAction === "update") {
      return node;
    }
    return undefined;
  }, [actualAction, node, nodePropertiesAction]);

  const isImageTemplate = React.useMemo(
    () => actualNode && (actualNode.type ?? "") === "image-template",
    [actualNode]
  );

  const imageTemplateFit = React.useMemo(() => {
    if (!isImageTemplate || !actualNode) {
      return undefined;
    }

    return actualNode.props.fit;
  }, [isImageTemplate, actualNode]);

  const imageTemplateTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode) {
      return [];
    }

    if (
      nodes.length === 1 &&
      ["image-template"].includes(nodes[0].node?.type ?? "") &&
      !singleLocked &&
      imageTemplateFit === IMAGE_TEMPLATE_FIT.FREE
    ) {
      actualNodeTools.push(
        <React.Fragment key="image-edition-tools">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<LockOpen className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={async () => {
              if (!instance) {
                return;
              }

              const handler =
                instance.getNodeHandler<ImageTemplateNode>("image-template");

              const stage = instance.getStage();
              const nodeInstance = stage.findOne(`#${actualNode?.key ?? ""}`);

              if (!handler || !nodeInstance) {
                return;
              }

              handler.freeImage(nodeInstance as WeaveElementInstance);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Move image</p>
              </div>
            }
            tooltipSide="left"
            tooltipAlign="center"
          />
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [instance, nodes, actualNode, singleLocked, weaveConnectionStatus]);

  const imageTools = React.useMemo(() => {
    const actualNodeTools = [];

    if (!actualNode) {
      return [];
    }

    if (
      nodes.length === 1 &&
      ["image"].includes(nodes[0].node?.type ?? "") &&
      !singleLocked &&
      nodes[0].node?.props?.lockToContainer
    ) {
      actualNodeTools.push(
        <React.Fragment key="image-tools">
          <ToolbarButton
            className="rounded-full !w-[40px]"
            icon={<Lock className="px-2" size={40} strokeWidth={1} />}
            disabled={
              weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED
            }
            onClick={async () => {
              if (!instance) {
                return;
              }

              const handler =
                instance.getNodeHandler<ImageTemplateNode>("image-template");

              const stage = instance.getStage();
              const nodeInstance = stage.findOne(`#${actualNode?.key ?? ""}`);

              if (!handler || !nodeInstance) {
                return;
              }

              const imageTemplateInstance = nodeInstance
                .getParent()
                ?.getParent();

              if (!imageTemplateInstance) {
                return;
              }

              handler.lockImage(imageTemplateInstance as WeaveElementInstance);
            }}
            label={
              <div className="flex gap-3 justify-start items-center">
                <p>Lock image</p>
              </div>
            }
            tooltipSide="left"
            tooltipAlign="center"
          />
        </React.Fragment>
      );
    }

    return actualNodeTools;
  }, [instance, nodes, actualNode, singleLocked, weaveConnectionStatus]);

  if (!showUI) {
    return null;
  }

  if (imageTemplateTools.length === 0 && imageTools.length === 0) {
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
      {(imageTemplateTools.length > 0 || imageTools.length > 0) && (
        <Toolbar
          orientation="vertical"
          className="grid grid-cols-1 w-auto justify-start items-center rounded-3xl"
        >
          {imageTemplateTools}
          {imageTools}
        </Toolbar>
      )}
    </motion.div>
  );
}
