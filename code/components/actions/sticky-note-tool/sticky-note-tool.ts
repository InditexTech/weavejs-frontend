// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidv4 } from "uuid";
import { Vector2d } from "konva/lib/types";
import {
  StickyNoteToolActionOnAddedEvent,
  StickyNoteToolActionOnAddingEvent,
  StickyNoteToolActionState,
  StickyNoteToolActionTriggerParams,
} from "./types";
import { STICKY_NOTE_ACTION_NAME, STICKY_NOTE_TOOL_STATE } from "./constants";
import { WeaveAction, WeaveNodesSelectionPlugin } from "@inditextech/weave-sdk";
import Konva from "konva";
import { StickyNoteNode } from "@/components/nodes/sticky-note/sticky-note";
import {
  DEFAULT_DOG_EAR_SIZE,
  DEFAULT_STICKY_NOTE_COLOR,
  DEFAULT_STICKY_NOTE_FONT_FAMILY,
  DEFAULT_STICKY_NOTE_FONT_SIZE,
  DEFAULT_STICKY_NOTE_HEIGHT,
  DEFAULT_STICKY_NOTE_TEXT,
  DEFAULT_STICKY_NOTE_TEXT_COLOR,
  DEFAULT_STICKY_NOTE_WIDTH,
  STICKY_NOTE_NODE_TYPE,
} from "@/components/nodes/sticky-note/constants";

export class StickyNoteToolAction extends WeaveAction {
  protected initialized!: boolean;
  protected state!: StickyNoteToolActionState;
  protected pointers!: Map<number, Vector2d>;
  protected stickyNoteId!: string | null;
  protected container: Konva.Layer | Konva.Group | undefined;
  protected clickPoint!: Vector2d | null;
  protected cancelAction!: () => void;
  onPropsChange = undefined;

  constructor() {
    super();
    this.initialize();
  }

  initialize(): void {
    this.pointers = new Map<number, Vector2d>();
    this.initialized = false;
    this.state = STICKY_NOTE_TOOL_STATE.IDLE;
    this.stickyNoteId = null;
    this.container = undefined;
    this.clickPoint = null;
  }

  getName(): string {
    return STICKY_NOTE_ACTION_NAME;
  }

  initProps() {
    return {
      color: DEFAULT_STICKY_NOTE_COLOR,
      width: DEFAULT_STICKY_NOTE_WIDTH,
      height: DEFAULT_STICKY_NOTE_HEIGHT,
      text: DEFAULT_STICKY_NOTE_TEXT,
      fontSize: DEFAULT_STICKY_NOTE_FONT_SIZE,
      fontFamily: DEFAULT_STICKY_NOTE_FONT_FAMILY,
      fontColor: DEFAULT_STICKY_NOTE_TEXT_COLOR,
      dogEarSize: DEFAULT_DOG_EAR_SIZE,
      opacity: 1,
    };
  }

  onInit() {
    // Stage drag-and-drop listener for external drops if needed
    this.instance.addEventListener("onStageDrop", (e) => {
      if ((window as unknown as { stickyNoteDropColor?: string }).stickyNoteDropColor) {
        this.instance.getStage().setPointersPositions(e);
        const position = this.instance.getStage().getRelativePointerPosition();
        this.instance.triggerAction(STICKY_NOTE_ACTION_NAME, {
          color: (window as unknown as { stickyNoteDropColor?: string }).stickyNoteDropColor,
          position,
        });
        (window as unknown as { stickyNoteDropColor?: string }).stickyNoteDropColor = undefined;
      }
    });
  }

  private setupEvents() {
    const stage = this.instance.getStage();

    stage.container().addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
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
        this.instance.getActiveAction() === STICKY_NOTE_ACTION_NAME
      ) {
        this.state = STICKY_NOTE_TOOL_STATE.ADDING;
        return;
      }

      if (this.state === STICKY_NOTE_TOOL_STATE.ADDING) {
        this.state = STICKY_NOTE_TOOL_STATE.DEFINING_SIZE;
      }
    });

    stage.on("pointermove", (e) => {
      if (this.state === STICKY_NOTE_TOOL_STATE.IDLE) return;

      this.setCursor();

      if (!this.isPressed(e)) return;

      if (!this.pointers.has(e.evt.pointerId)) return;

      if (
        this.pointers.size === 2 &&
        this.instance.getActiveAction() === STICKY_NOTE_ACTION_NAME
      ) {
        this.state = STICKY_NOTE_TOOL_STATE.ADDING;
        return;
      }
    });

    stage.on("pointerup", (e) => {
      this.pointers.delete(e.evt.pointerId);

      if (this.state === STICKY_NOTE_TOOL_STATE.DEFINING_SIZE) {
        this.handleAdding();
      }
    });

    this.initialized = true;
  }

  private setState(state: StickyNoteToolActionState) {
    this.state = state;
  }

  private addStickyNote(position?: Vector2d) {
    this.setCursor();

    if (position) {
      this.handleAdding(position);
      this.setState(STICKY_NOTE_TOOL_STATE.IDLE);
      return;
    }

    this.instance.emitEvent<StickyNoteToolActionOnAddingEvent>(
      "onAddingStickyNote",
    );

    this.stickyNoteId = null;
    this.clickPoint = null;
    this.setState(STICKY_NOTE_TOOL_STATE.ADDING);
  }

  private handleAdding(position?: Vector2d) {
    const { mousePoint, container } = this.instance.getMousePointer(position);

    this.clickPoint = mousePoint;
    this.container = container as Konva.Layer | Konva.Group;

    this.stickyNoteId = uuidv4();

    const nodeHandler =
      this.instance.getNodeHandler<StickyNoteNode>(STICKY_NOTE_NODE_TYPE);

    if (nodeHandler) {
      const node = nodeHandler.create(this.stickyNoteId, {
        ...this.props,
        x: this.clickPoint.x,
        y: this.clickPoint.y,
      });

      this.instance.addNode(node, this.container?.getAttrs().id);

      this.instance.emitEvent<StickyNoteToolActionOnAddedEvent>(
        "onAddedStickyNote",
      );
    }

    this.cancelAction();
  }

  trigger(
    cancelAction: () => void,
    params?: StickyNoteToolActionTriggerParams,
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
      this.props.color = params.color;
    }
    if (params?.text) {
      this.props.text = params.text;
    }
    if (params?.author) {
      this.props.author = params.author;
    }

    this.addStickyNote(params?.position ?? undefined);
  }

  cleanup() {
    const stage = this.instance.getStage();

    stage.container().style.cursor = "default";

    const selectionPlugin =
      this.instance.getPlugin<WeaveNodesSelectionPlugin>("nodesSelection");
    if (selectionPlugin) {
      const node = stage.findOne(`#${this.stickyNoteId}`);
      if (node) {
        selectionPlugin.setSelectedNodes([node]);
      }
      this.instance.triggerAction("selectionTool");
    }

    this.stickyNoteId = null;
    this.container = undefined;
    this.clickPoint = null;
    this.setState(STICKY_NOTE_TOOL_STATE.IDLE);
  }

  private setCursor() {
    const stage = this.instance.getStage();
    stage.container().style.cursor = "crosshair";
  }
}
