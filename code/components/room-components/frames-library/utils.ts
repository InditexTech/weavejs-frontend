// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Weave } from "@inditextech/weave-sdk";
import Konva from "konva";

export type PresentationImage = {
  img: HTMLImageElement;
  width: number;
  height: number;
  alt: string;
};

export const toImageAsync = (
  node: Konva.Node,
  properties: {
    pixelRatio?: number;
    x: number;
    y: number;
    width: number;
    height: number;
  },
): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    node.toImage({
      mimeType: "image/png",
      quality: 1,
      pixelRatio: properties.pixelRatio ?? 1,
      x: properties.x,
      y: properties.y,
      width: properties.width,
      height: properties.height,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback(img: any) {
        resolve(img);
      },
    });
  });
};

export async function generatePresentation(
  instance: Weave,
  framesAvailable: Konva.Node[],
) {
  const images: PresentationImage[] = [];
  for (const frame of framesAvailable) {
    const attrs = frame.getAttrs();
    const bounds = instance.getExportBoundingBox([attrs.containerId]);
    const img = await toImageAsync(frame, {
      pixelRatio: 4,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
    images.push({
      img,
      width: img.width,
      height: img.height,
      alt: "A frame image",
    });
  }

  return images;
}
