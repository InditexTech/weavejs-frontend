// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import {
  ColorTokenToolActionOnAddedEvent,
  ColorTokenToolActionOnAddingEvent,
  ColorTokenToolActionState,
  ColorTokenToolActionTriggerParams,
} from "./types";
import { COLOR_TOKEN_ACTION_NAME, COLOR_TOKEN_TOOL_STATE } from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import Konva from "konva";
import { ColorTokenNode } from "@/components/nodes/color-token/color-token";

export class ColorTokenToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected state: ColorTokenToolActionState;
  protected pointers: Map<number, Vector2d>;
  protected colorTokenId: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected cancelAction!: () => void;
  onPropsChange = undefined;

  constructor() {
    super();

    this.pointers = new Map<number, Vector2d>();
    this.initialized = false;
    this.state = COLOR_TOKEN_TOOL_STATE.IDLE;
    this.colorTokenId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return COLOR_TOKEN_ACTION_NAME;
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
        this.instance.getActiveAction() === COLOR_TOKEN_ACTION_NAME
      ) {
        this.state = COLOR_TOKEN_TOOL_STATE.ADDING;
        return;
      }

      if (this.state === COLOR_TOKEN_TOOL_STATE.ADDING) {
        this.state = COLOR_TOKEN_TOOL_STATE.DEFINING_SIZE;
      }
    });

    stage.on("pointermove", (e) => {
      if (!this.isPressed(e)) return;

      if (!this.pointers.has(e.evt.pointerId)) return;

      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === COLOR_TOKEN_ACTION_NAME
      ) {
        this.state = COLOR_TOKEN_TOOL_STATE.ADDING;
        return;
      }
    });

    stage.on("pointerup", (e) => {
      this.pointers.delete(e.evt.pointerId);

      if (this.state === COLOR_TOKEN_TOOL_STATE.DEFINING_SIZE) {
        this.handleAdding();
      }
    });

    this.initialized = true;
  }

  private setState(state: ColorTokenToolActionState) {
    this.state = state;
  }

  private addColorToken(position?: Vector2d) {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "crosshair";
    stage.container().blur();
    stage.container().focus();

    if (position) {
      this.handleAdding(position);
      this.setState(COLOR_TOKEN_TOOL_STATE.IDLE);
      return;
    }

    this.instance.emitEvent<ColorTokenToolActionOnAddingEvent>(
      "onAddingColorToken"
    );

    this.colorTokenId = null;
    this.clickPoint = null;
    this.setState(COLOR_TOKEN_TOOL_STATE.ADDING);
  }

  private handleAdding(position?: Vector2d) {
    const { mousePoint, container } = this.instance.getMousePointer(position);

    this.clickPoint = mousePoint;
    this.container = container as Konva.Layer | Konva.Group;

    this.colorTokenId = uuidv4();

    const nodeHandler =
      this.instance.getNodeHandler<ColorTokenNode>("color-token");

    if (nodeHandler) {
      const node = nodeHandler.create(this.colorTokenId, {
        ...this.props,
        x: this.clickPoint.x,
        y: this.clickPoint.y,
      });

      this.instance.addNode(node, this.container?.getAttrs().id);

      this.instance.emitEvent<ColorTokenToolActionOnAddedEvent>(
        "onAddedColorToken"
      );
    }

    this.cancelAction();
  }

  trigger(
    cancelAction: () => void,
    params?: ColorTokenToolActionTriggerParams
  ) {
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

    if (params?.color) {
      this.props.colorToken = params.color;
    }

    this.addColorToken(params?.position ?? undefined);
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.colorTokenId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.colorTokenId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(COLOR_TOKEN_TOOL_STATE.IDLE);
  }
}
