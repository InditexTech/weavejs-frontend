// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import { useWeave } from "@inditextech/weave-react";
import { isClipboardAPIAvailable } from "@/lib/utils";
import {
  TEXT_LAYOUT,
  WeaveNode,
  WeaveNodesSelectionPlugin,
  WeaveTextNode,
} from "@inditextech/weave-sdk";
import { WeaveElementInstance } from "@inditextech/weave-types";

export function useOnPasteExternalText() {
  const pastingToastIdRef = React.useRef<string | number | null>(null);

  const addTextRef = React.useRef<string | null>(null);
  const positionCalculatedRef = React.useRef<boolean | null>(null);

  const instance = useWeave((state) => state.instance);

  React.useEffect(() => {
    const onNodeRenderedAddedHandler = (node: WeaveElementInstance) => {
      if (!addTextRef.current) {
        return;
      }

      if (node.getAttrs().id !== addTextRef.current) {
        return;
      }

      if (pastingToastIdRef.current) {
        toast.dismiss(pastingToastIdRef.current);
        pastingToastIdRef.current = null;
      }

      toast.success("Paste successful");

      if (!positionCalculatedRef.current) {
        return;
      }

      if (node) {
        node?.x(node.x() - node.width() / 2);
        node?.y(node.y() - node.height() / 2);

        const nodeHandle = instance?.getNodeHandler<WeaveNode>(
          node.getAttrs().nodeType
        );

        if (nodeHandle) {
          instance?.updateNode(
            nodeHandle.serialize(node as WeaveElementInstance)
          );
        }

        const selectionPlugin =
          instance?.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
        if (selectionPlugin) {
          selectionPlugin.setSelectedNodes([node]);
        }

        instance?.triggerAction("fitToSelectionTool", {
          previousAction: "selectionTool",
          smartZoom: true,
        });
      }
    };

    instance?.addEventListener(
      "onNodeRenderedAdded",
      onNodeRenderedAddedHandler
    );

    return () => {
      instance?.removeEventListener(
        "onNodeRenderedAdded",
        onNodeRenderedAddedHandler
      );
    };
  }, [instance]);

  React.useEffect(() => {
    const onPasteExternalText = async ({
      positionCalculated,
      position,
      items,
      dataList,
    }: {
      positionCalculated: boolean;
      position: Vector2d;
      items?: ClipboardItems;
      dataList?: DataTransferItemList;
    }) => {
      if (!instance) {
        return;
      }

      if (items?.length === 0 && dataList?.length === 0) {
        return;
      }

      if (isClipboardAPIAvailable() && items?.length === 1) {
        const item = items[0];
        if (item.types.includes("text/plain")) {
          pastingToastIdRef.current = toast.loading("Pasting...");

          const blob = await item.getType("text/plain");
          const text = await blob.text();

          const textNodeHandler =
            instance.getNodeHandler<WeaveTextNode>("text");

          if (!textNodeHandler) {
            return;
          }

          const textNodeId = uuidv4();
          const textNode = textNodeHandler.create(textNodeId, {
            x: position.x,
            y: position.y,
            layout: TEXT_LAYOUT.AUTO_ALL,
            fontSize: 20,
            fontFamily: "Arial, sans-serif",
            fill: "#000000",
            align: "left",
            verticalAlign: "top",
            strokeEnabled: false,
            text: text.trim(),
          });

          instance.addNode(textNode);

          addTextRef.current = textNodeId;
          positionCalculatedRef.current = positionCalculated;
        }
      }
    };

    if (instance) {
      instance.addEventListener("onPasteExternal", onPasteExternalText);
    }

    return () => {
      if (instance) {
        instance.removeEventListener("onPasteExternal", onPasteExternalText);
      }
    };
  }, [instance]);
}
