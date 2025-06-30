// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import "konva/lib/Node";

declare module "konva/lib/Node" {
  interface Node {
    getTransformerProperties(): WeaveNodeTransformerProperties;
    triggerCrop(): void;
    closeCrop(type: WeaveImageCropEndType): void;
    resetCrop(): void;
    updatePosition(position: Vector2d): void;
    getRealClientRect(
      config?:
        | {
            skipTransform?: boolean;
            skipShadow?: boolean;
            skipStroke?: boolean;
            relativeTo?: Container;
          }
        | undefined
    ): {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
}

declare global {
  interface Window {
    weave: Weave;
    weaveOnFieldFocus?: boolean;
    weaveTextEditing?: Record<string, string>;
    weaveDragImageURL?: string;
    colorTokenDragColor?: string;
  }
}
