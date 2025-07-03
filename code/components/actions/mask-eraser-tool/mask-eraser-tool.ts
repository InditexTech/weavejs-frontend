// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import {
  WeaveAction,
  WeaveNodesSelectionPlugin,
  SELECTION_TOOL_ACTION_NAME,
} from "@inditextech/weave-sdk";
import { type MaskEraserToolActionState } from "./types";
import {
  MASK_ERASER_TOOL_ACTION_NAME,
  MASK_ERASER_TOOL_STATE,
} from "./constants";

export class MaskEraserToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: MaskEraserToolActionState;
  protected erasing: boolean = false;
  protected cancelAction!: () => void;
  onPropsChange = undefined;

  constructor() {
    super();

    this.initialized = false;
    this.erasing = false;
    this.state = MASK_ERASER_TOOL_STATE.IDLE;
  }

  getName(): string {
    return MASK_ERASER_TOOL_ACTION_NAME;
  }

  pointIntersectsElement(point?: Konva.Vector2d): Konva.Node | null {
    const stage = this.instance.getStage();
    const relativeMousePointer = point ??
      stage.getPointerPosition() ?? { x: 0, y: 0 };

    const utilityLayer = this.instance.getUtilityLayer();

    if (!utilityLayer) {
      return null;
    }

    const intersectedNode = utilityLayer.getIntersection(relativeMousePointer);

    return intersectedNode;
  }

  onInit() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        const maskTransformer: Konva.Transformer | undefined = stage.findOne(
          "#maskSelectionTransformer"
        );

        if (maskTransformer) {
          const selectedNodes: Konva.Node[] = maskTransformer.getNodes();
          const selectedNodesIds: string[] = selectedNodes.map(
            (node) => node.getAttrs().id
          );

          maskTransformer.nodes([
            ...maskTransformer
              .nodes()
              .filter(
                (node: Konva.Node) =>
                  !selectedNodesIds.includes(node.getAttrs().id)
              ),
          ]);
          for (const node of selectedNodes) {
            node.destroy();
            this.instance.emitEvent("onMaskRemoved", {
              nodeId: node.getAttrs().id,
            });
          }
          maskTransformer.forceUpdate();
        }
      }
    });
  }

  removeMaskNodes() {
    const stage = this.instance.getStage();

    const nodes = stage.find(
      (node: Konva.Node) =>
        (node.getType() === "Line" && node.getAttrs().nodeType === "mask") ||
        (node.getType() === "Group" &&
          node.getAttrs().nodeType === "fuzzy-mask")
    );

    const maskTransformer: Konva.Transformer | undefined = stage.findOne(
      "#maskSelectionTransformer"
    );

    for (const node of nodes) {
      node.destroy();
      this.instance.emitEvent("onMaskRemoved", {
        nodeId: node.getAttrs().id,
      });
    }

    if (maskTransformer) {
      maskTransformer.forceUpdate();
    }
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.on("pointerclick", () => {
      if (!this.erasing) {
        return;
      }

      let nodeTargeted: Konva.Node | null | undefined =
        this.pointIntersectsElement();

      if (!nodeTargeted) {
        return;
      }

      if (!["fuzzy-mask", "mask"].includes(nodeTargeted.getAttrs().nodeType)) {
        return;
      }

      if (nodeTargeted.getAttrs().nodeType === "fuzzy-mask") {
        nodeTargeted = stage.findOne(`#${nodeTargeted.getAttrs().nodeId}`);
      }

      if (!nodeTargeted) {
        return;
      }

      if (nodeTargeted) {
        const maskId = nodeTargeted.getAttrs().id;
        nodeTargeted.destroy();
        this.instance.emitEvent("onMaskRemoved", {
          nodeId: maskId,
        });
      }
    });

    stage.container().addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.instance.getActiveAction() === MASK_ERASER_TOOL_ACTION_NAME
      ) {
        this.cancelAction();
      }
    });

    this.initialized = true;
  }

  private setState(state: MaskEraserToolActionState) {
    this.state = state;
  }

  private setEraser() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";
    stage.container().focus();

    this.erasing = true;

    this.setState(MASK_ERASER_TOOL_STATE.ERASING);
  }

  trigger(cancelAction: () => void): void {
    if (!this.instance) {
      throw new Error("Instance not defined");
    }

    if (!this.initialized) {
      this.setupEvents();
    }
    const stage = this.instance.getStage();

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.cancelAction = cancelAction;

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      selectionPlugin.disable();
    }

    this.setEraser();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";
    this.erasing = false;

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      selectionPlugin.enable();
      this.instance.triggerAction(SELECTION_TOOL_ACTION_NAME);
    }

    this.setState(MASK_ERASER_TOOL_STATE.IDLE);
  }
}
