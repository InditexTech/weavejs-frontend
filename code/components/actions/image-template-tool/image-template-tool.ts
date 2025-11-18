// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import {
  ImageTemplateToolActionOnAddedEvent,
  ImageTemplateToolActionOnAddingEvent,
  ImageTemplateToolActionState,
} from "./types";
import {
  IMAGE_TEMPLATE_ACTION_NAME,
  IMAGE_TEMPLATE_TOOL_STATE,
} from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import Konva from "konva";
import { ImageTemplateNode } from "@/components/nodes/image-template/image-template";

export class ImageTemplateToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected moved: boolean;
  protected tempImageTemplateNode: Konva.Rect | null;
  protected state: ImageTemplateToolActionState;
  protected pointers: Map<number, Vector2d>;
  protected imageTemplateId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected measureContainer: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  onPropsChange = undefined;

  constructor() {
    super();

    this.pointers = new Map<number, Vector2d>();
    this.initialized = false;
    this.state = IMAGE_TEMPLATE_TOOL_STATE.IDLE;
    this.tempImageTemplateNode = null;
    this.moved = false;
    this.imageTemplateId = null;
    this.container = undefined;
    this.measureContainer = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return IMAGE_TEMPLATE_ACTION_NAME;
  }

  initProps() {
    return {
      opacity: 1,
      fill: "#666666",
      stroke: "#000000",
      strokeWidth: 1,
      width: 400,
      height: 225,
    };
  }

  onInit() {
    this.instance.addEventListener("onStageDrop", (e) => {
      if (window.colorTokenDragColor) {
        this.instance.getStage().setPointersPositions(e);
        const position = this.instance.getStage().getRelativePointerPosition();
        this.instance.triggerAction("colorTokenTool", {
          color: window.colorTokenDragColor,
          position,
        });
        window.colorTokenDragColor = undefined;
      }
    });
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelAction();
        return;
      }
    });

    stage.on("pointermove", () => {
      if (this.state === IMAGE_TEMPLATE_TOOL_STATE.IDLE) return;

      this.setCursor();
    });

    stage.on("pointerdown", (e) => {
      this.setTapStart(e);

      this.pointers.set(e.evt.pointerId, {
        x: e.evt.clientX,
        y: e.evt.clientY,
      });

      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === IMAGE_TEMPLATE_ACTION_NAME
      ) {
        this.state = IMAGE_TEMPLATE_TOOL_STATE.ADDING;
        return;
      }

      if (this.state === IMAGE_TEMPLATE_TOOL_STATE.ADDING) {
        this.handleAdding();
      }
    });

    stage.on("pointermove", (e) => {
      if (this.state === IMAGE_TEMPLATE_TOOL_STATE.IDLE) return;

      this.setCursor();

      if (!this.isPressed(e)) return;

      if (!this.pointers.has(e.evt.pointerId)) return;

      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === IMAGE_TEMPLATE_ACTION_NAME
      ) {
        this.state = IMAGE_TEMPLATE_TOOL_STATE.ADDING;
        return;
      }

      if (this.state === IMAGE_TEMPLATE_TOOL_STATE.DEFINING_SIZE) {
        this.handleMovement();
      }
    });

    stage.on("pointerup", (e) => {
      this.pointers.delete(e.evt.pointerId);

      const isTap = this.isTap(e);

      if (isTap) {
        this.moved = false;
      }

      if (this.state === IMAGE_TEMPLATE_TOOL_STATE.DEFINING_SIZE) {
        this.handleSettingSize();
      }
    });

    this.initialized = true;
  }

  private setState(state: ImageTemplateToolActionState) {
    this.state = state;
  }

  private addImageTemplate() {
    this.setCursor();

    this.instance.emitEvent<ImageTemplateToolActionOnAddingEvent>(
      "onAddingImageTemplate"
    );

    this.imageTemplateId = null;
    this.tempImageTemplateNode = null;
    this.moved = false;
    this.container = undefined;
    this.measureContainer = undefined;
    this.clickPoint = null;
    this.setState(IMAGE_TEMPLATE_TOOL_STATE.ADDING);
  }

  private handleAdding(position?: Vector2d) {
    const { mousePoint, container, measureContainer } =
      this.instance.getMousePointer(position);

    this.clickPoint = mousePoint;
    this.container = container as Konva.Layer | Konva.Group;
    this.measureContainer = measureContainer;

    this.imageTemplateId = uuidv4();

    if (!this.tempImageTemplateNode) {
      this.tempImageTemplateNode = new Konva.Rect({
        ...this.props,
        id: this.imageTemplateId,
        strokeScaleEnabled: true,
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        width: 0,
        height: 0,
      });
      this.measureContainer?.add(this.tempImageTemplateNode);
    }

    this.setState(IMAGE_TEMPLATE_TOOL_STATE.DEFINING_SIZE);
  }

  private handleSettingSize() {
    if (
      this.imageTemplateId &&
      this.tempImageTemplateNode &&
      this.clickPoint &&
      this.container
    ) {
      const { mousePoint } = this.instance.getMousePointerRelativeToContainer(
        this.container
      );

      const rectPos: Konva.Vector2d = {
        x: this.clickPoint.x,
        y: this.clickPoint.y,
      };
      let rectWidth = this.props.width;
      let rectHeight = this.props.height;
      if (this.moved) {
        rectPos.x = Math.min(this.clickPoint.x, mousePoint.x);
        rectPos.y = Math.min(this.clickPoint.y, mousePoint.y);
        rectWidth = Math.abs(this.clickPoint.x - mousePoint.x);
        rectHeight = Math.abs(this.clickPoint.y - mousePoint.y);
      }

      this.tempImageTemplateNode.setAttrs({
        ...this.props,
        x: rectPos.x,
        y: rectPos.y,
        width: rectWidth,
        height: rectHeight,
      });

      const nodeHandler =
        this.instance.getNodeHandler<ImageTemplateNode>("image-template");

      if (nodeHandler) {
        const clonedRectNode = this.tempImageTemplateNode.clone();
        this.tempImageTemplateNode.destroy();

        const node = nodeHandler.create(this.imageTemplateId, {
          ...this.props,
          ...clonedRectNode.getAttrs(),
        });

        this.instance.addNode(node, this.container?.getAttrs().id);
      }

      this.instance.emitEvent<ImageTemplateToolActionOnAddedEvent>(
        "onAddedImageTemplate"
      );
    }

    this.cancelAction();
  }

  private handleMovement() {
    if (this.state !== IMAGE_TEMPLATE_TOOL_STATE.DEFINING_SIZE) {
      return;
    }

    if (
      this.imageTemplateId &&
      this.tempImageTemplateNode &&
      this.measureContainer &&
      this.clickPoint
    ) {
      this.moved = true;

      const { mousePoint } = this.instance.getMousePointerRelativeToContainer(
        this.measureContainer
      );

      const deltaX = mousePoint.x - this.clickPoint?.x;
      const deltaY = mousePoint.y - this.clickPoint?.y;

      this.tempImageTemplateNode.setAttrs({
        width: deltaX,
        height: deltaY,
      });
    }
  }

  trigger(cancelAction: () => void) {
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
      selectionPlugin.setSelectedNodes([]);
    }

    this.props = this.initProps();
    this.addImageTemplate();
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.imageTemplateId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.imageTemplateId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(IMAGE_TEMPLATE_TOOL_STATE.IDLE);
  }

  private setCursor() {
    const stage = this.instance.getStage();
    stage.container().style.cursor = "crosshair";
  }
}
