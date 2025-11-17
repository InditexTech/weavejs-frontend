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
  protected state: ImageTemplateToolActionState;
  protected pointers: Map<number, Vector2d>;
  protected imageTemplateId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  onPropsChange = undefined;

  constructor() {
    super();

    this.pointers = new Map<number, Vector2d>();
    this.initialized = false;
    this.state = IMAGE_TEMPLATE_TOOL_STATE.IDLE;
    this.imageTemplateId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return IMAGE_TEMPLATE_ACTION_NAME;
  }

  initProps() {
    return {
      colorToken: "#000000",
      width: 300,
      height: 300,
      opacity: 1,
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
        this.state = IMAGE_TEMPLATE_TOOL_STATE.DEFINING_SIZE;
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
    });

    stage.on("pointerup", (e) => {
      this.pointers.delete(e.evt.pointerId);

      if (this.state === IMAGE_TEMPLATE_TOOL_STATE.DEFINING_SIZE) {
        this.handleAdding();
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
    this.clickPoint = null;
    this.setState(IMAGE_TEMPLATE_TOOL_STATE.ADDING);
  }

  private handleAdding(position?: Vector2d) {
    const { mousePoint, container } = this.instance.getMousePointer(position);

    this.clickPoint = mousePoint;
    this.container = container as Konva.Layer | Konva.Group;

    this.imageTemplateId = uuidv4();

    const nodeHandler =
      this.instance.getNodeHandler<ImageTemplateNode>("image-template");

    if (nodeHandler) {
      const node = nodeHandler.create(this.imageTemplateId, {
        ...this.props,
        x: this.clickPoint.x,
        y: this.clickPoint.y,
        width: 100,
        height: 100,
        inUse: false,
        lockToContainer: false,
        moving: false,
      });

      this.instance.addNode(node, this.container?.getAttrs().id);

      this.instance.emitEvent<ImageTemplateToolActionOnAddedEvent>(
        "onAddedImageTemplate"
      );
    }

    this.cancelAction();
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
