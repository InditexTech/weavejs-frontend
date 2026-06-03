// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { TemplateEntity } from "@/components/room-components/templates-library/types";
import { clsx, type ClassValue } from "clsx";
import Konva from "konva";
import { Weave, WeaveStateManipulation } from "@inditextech/weave-sdk";
import { type WeaveStateElement } from "@inditextech/weave-types";
import * as Y from "yjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function colorIsLight(bgColor: string) {
  const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  const a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return a < 0.5;
}

export function isClipboardAPIAvailable() {
  return !!navigator.clipboard;
}

export function getContrastTextColor(hex: string): "white" | "black" {
  // Remove "#" if present
  const cleaned = hex.replace(/^#/, "");

  // Parse R, G, B from hex
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  // Calculate luminance (per W3C)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark
  return luminance > 0.5 ? "black" : "white";
}

export function stringToColor(str: string) {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }
  return color;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const updateNodeId = (node: WeaveStateElement): WeaveStateElement => {
  const newId = uuidv4();

  const updatedNode = {
    ...node,
    key: newId,
    props: {
      ...node.props,
      id: newId,
    },
  };

  if (node.props.children) {
    updatedNode.props.children = node.props.children.map((child) =>
      updateNodeId(child as WeaveStateElement),
    );
  }

  return updatedNode;
};

export function addTemplateAtPosition(params: {
  instance: Weave;
  template: TemplateEntity;
  containerId: string;
  position: Konva.Vector2d;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elements: Y.Map<any>[] = [];

  const { instance, position, template, containerId } = params;

  const roomDocument = instance.getStore().getDocument();

  try {
    const templateData = JSON.parse(template.templateData);

    for (let i = 0; i < templateData.length; i++) {
      const node = templateData[i];
      const nodeWithNewId = updateNodeId(node as WeaveStateElement);
      const positionedNode = {
        ...nodeWithNewId,
        props: {
          ...nodeWithNewId.props,
          x: nodeWithNewId.props.x + position.x,
          y: nodeWithNewId.props.y + position.y,
        },
      };
      const { element } = WeaveStateManipulation.mapNodeToYjs(
        positionedNode as unknown as WeaveStateElement,
      );

      if (!element) {
        continue;
      }

      elements.push(element);
    }

    roomDocument.transact(() => {
      const layer = WeaveStateManipulation.getYjsElement(
        roomDocument,
        containerId,
      );

      if (layer) {
        WeaveStateManipulation.addElements(layer, elements);
      }
    });
  } catch (ex) {
    console.error("Error parsing template data or mapping to Yjs:", ex);
  }
}
