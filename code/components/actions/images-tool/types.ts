// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { Vector2d } from "konva/lib/types";
import { IMAGES_TOOL_STATE } from "./constants";

export type ImagesToolActionStateKeys = keyof typeof IMAGES_TOOL_STATE;
export type ImagesToolActionState =
  (typeof IMAGES_TOOL_STATE)[ImagesToolActionStateKeys];

export type ImagesToolActionOnStartLoadImageEvent = undefined;
export type ImagesToolActionOnEndLoadImageEvent = Error | undefined;

export type ImageInfo = {
  imageId: string;
  url: string;
};

export type ImagesToolActionTriggerParams = {
  images: ImageInfo[];
  padding?: number;
  position?: Vector2d;
};
