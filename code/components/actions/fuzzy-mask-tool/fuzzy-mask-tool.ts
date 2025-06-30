// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import Konva from "konva";
import { type Vector2d } from "konva/lib/types";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import { type FuzzyMaskToolActionState } from "./types";
import {
  FUZZY_MASK_TOOL_ACTION_NAME,
  FUZZY_MASK_TOOL_STATE,
} from "./constants";
import { FuzzyMaskNode } from "@/components/nodes/fuzzy-mask/fuzzy-mask";
import { WeaveStateElement } from "@inditextech/weave-types";
import { KonvaEventObject } from "konva/lib/Node";
import { Stage } from "konva/lib/Stage";
import { throttle } from "lodash";

export class FuzzyMaskToolAction extends WeaveAction {
  protected initialized: boolean = false;
  protected initialCursor: string | null = null;
  protected state: FuzzyMaskToolActionState;
  protected maskId: string | null;
  protected tempCircle: Konva.Circle | undefined;
  protected mask: WeaveStateElement | undefined;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected measureContainer: Konva.Layer | Konva.Group | undefined;
  protected clickPoint: Vector2d | null;
  protected allowAdding: boolean = false;
  protected cancelAction!: () => void;
  onInit = undefined;

  constructor() {
    super();

    this.initialized = false;
    this.state = FUZZY_MASK_TOOL_STATE.IDLE;
    this.maskId = null;
    this.container = undefined;
    this.allowAdding = false;
    this.measureContainer = undefined;
    this.clickPoint = null;
    this.props = this.initProps();
  }

  getName(): string {
    return FUZZY_MASK_TOOL_ACTION_NAME;
  }

  initProps() {
    return {
      stroke: "#000000FF",
      strokeWidth: 0,
      radius: 20,
      fill: "#67BCF0FF",
      opacity: 1,
    };
  }

  handleKeyDown(e: KeyboardEvent) {
    if (
      e.key === "Enter" &&
      this.instance.getActiveAction() === FUZZY_MASK_TOOL_ACTION_NAME
    ) {
      this.allowAdding = false;
      this.cancelAction();
      return;
    }
    if (
      e.key === "Escape" &&
      this.instance.getActiveAction() === FUZZY_MASK_TOOL_ACTION_NAME
    ) {
      this.allowAdding = false;
      this.cancelAction();
      return;
    }
  }

  handleDblClick(e: KonvaEventObject<MouseEvent, Stage>) {
    e.evt.preventDefault();
    this.allowAdding = false;
    this.cancelAction();
  }

  handleAddingCircles = (e: KonvaEventObject<MouseEvent, Stage>) => {
    e.evt.preventDefault();

    if (this.tempCircle) {
      const { mousePoint } = this.instance.getMousePointer();

      this.tempCircle?.setAttrs({
        x: mousePoint.x,
        y: mousePoint.y,
      });
    }

    if (this.state === FUZZY_MASK_TOOL_STATE.ADDING && this.allowAdding) {
      this.handleAddCircle();
    }
  };

  handleMouseDown(e: KonvaEventObject<MouseEvent, Stage>) {
    e.evt.preventDefault();

    const stage = this.instance.getStage();

    stage.container().tabIndex = 1;
    stage.container().focus();

    if (this.state === FUZZY_MASK_TOOL_STATE.ADDING && e.evt.button === 0) {
      this.allowAdding = true;
      return;
    }
  }

  handleMouseUp(e: KonvaEventObject<MouseEvent, Stage>) {
    e.evt.preventDefault();

    if (this.state === FUZZY_MASK_TOOL_STATE.ADDING && this.allowAdding) {
      this.allowAdding = false;
      return;
    }
  }

  onPropsChange() {
    if (this.tempCircle) {
      this.tempCircle.setAttrs({
        radius: this.props.radius,
      });
    }
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage
      .container()
      .addEventListener("keydown", this.handleKeyDown.bind(this));

    stage.on("dblclick dbltap", this.handleDblClick.bind(this));

    stage.on(
      "mousemove touchmove",
      throttle(this.handleAddingCircles.bind(this), 10)
    );

    stage.on("mousedown touchdown", this.handleMouseDown.bind(this));

    stage.on("mouseup touchup", this.handleMouseUp.bind(this));

    this.initialized = true;
  }

  private setState(state: FuzzyMaskToolActionState) {
    this.state = state;
  }

  private addCircle() {
    const stage = this.instance.getStage();
    const mainLayer = this.instance.getMainLayer();

    this.tempCircle?.destroy();

    stage.container().style.cursor = "crosshair";

    const { mousePoint } = this.instance.getMousePointer();

    this.tempCircle = new Konva.Circle({
      ...this.props,
      fill: "#cc0000",
      x: mousePoint.x,
      y: mousePoint.y,
      radius: this.props.radius,
    });

    mainLayer?.add(this.tempCircle);

    this.instance.getStage().on("onRender", () => {
      if (this.tempCircle) {
        mainLayer?.add(this.tempCircle);
      }
    });

    this.clickPoint = null;
    this.setState(FUZZY_MASK_TOOL_STATE.ADDING);
  }

  private handleAddCircle() {
    const { mousePoint, container, measureContainer } =
      this.instance.getMousePointer();

    this.clickPoint = mousePoint;
    this.container = container;
    this.measureContainer = measureContainer;

    this.maskId = uuidv4();

    const nodeHandler =
      this.instance.getNodeHandler<FuzzyMaskNode>("fuzzy-mask");

    if (nodeHandler && !this.mask) {
      const node = nodeHandler.create(this.maskId, {
        ...this.props,
        circles: [
          {
            x: this.clickPoint?.x ?? 0,
            y: this.clickPoint?.y ?? 0,
            radius: this.props.radius,
          },
        ],
      });
      this.mask = node;
      this.instance.addNode(node, this.container?.getAttrs().id);
      return;
    }
    if (nodeHandler && this.mask) {
      this.mask.props.circles.push({
        x: this.clickPoint?.x ?? 0,
        y: this.clickPoint?.y ?? 0,
        radius: this.props.radius,
      });
      this.instance.updateNode(this.mask);
      return;
    }
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
      selectionPlugin.setSelectedNodes([]);
    }

    this.props = this.initProps();
    this.addCircle();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    this.tempCircle?.destroy();

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.maskId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    stage.container().style.cursor = "default";

    stage.container().tabIndex = 1;
    stage.container().focus();

    this.initialCursor = null;
    this.maskId = null;
    this.mask = undefined;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(FUZZY_MASK_TOOL_STATE.IDLE);
  }
}
