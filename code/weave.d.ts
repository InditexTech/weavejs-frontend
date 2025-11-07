// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import "konva/lib/Node";
import "konva/lib/Stage";

declare module "konva/lib/Node" {
  interface Node {
    getTransformerProperties(): WeaveNodeTransformerProperties;
    triggerCrop(): void;
    closeCrop(type: WeaveImageCropEndType): void;
    resetCrop(): void;
    allowedAnchors(): string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatePosition(position: Vector2d): void;
    dblClick(): void;
    movedToContainer(container: Konva.Layer | Konva.Group): void;
    canMoveToContainer(node: Konva.Node): boolean;
  }
  interface Layer {
    canMoveToContainer(node: Konva.Node): boolean;
  }
}

declare module "konva/lib/Stage" {
  interface Stage {
    _mode: string;
    _allowActions: string[];
    _allowSelectNodeTypes: string[];
    _allowSelection: boolean;
    mode(mode?: WeaveStageMode): string;
    allowActions(actions?: string[]): string[];
    allowSelectNodes(nodeTypes?: string[]): string[];
    allowSelection(allowSelection?: boolean): boolean;
    isFocused(): boolean;
    isMouseWheelPressed(): boolean;
  }
}

declare global {
  interface Window {
    weave: Weave;
    weaveOnFieldFocus?: boolean;
    weaveTextEditing?: Record<string, string>;
    weaveDragImageURL?: string;
    weaveDragImageId?: string;
    weaveDragVideoParams?: WeaveVideoToolDragParams;
    weaveDragVideoId?: string;
    colorTokenDragColor?: string;
  }
}
