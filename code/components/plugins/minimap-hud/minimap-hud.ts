// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import Konva from "konva";
import { WeavePlugin } from "@inditextech/weave-sdk";
import {
  DEFAULT_MINIMAP_HEIGHT,
  DEFAULT_MINIMAP_WIDTH,
  MINIMAP_HUD_PLUGIN_KEY,
  MINIMAP_HUD_THEME,
  MINIMAP_MARGIN_PADDING,
} from "./constants";
import {
  MinimapBoundingBox,
  MinimapHUDPluginConfig,
  MinimapHUDPluginParams,
  MinimapTransformMetrics,
  ViewportRectMetrics,
} from "./types";

/**
 * Pure calculation helpers for geometric projection and bounds.
 */
export function calculateContentBounds(
  items: Array<{ x: number; y: number; width: number; height: number }>,
): MinimapBoundingBox {
  if (items.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 800,
      maxY: 600,
      width: 800,
      height: 600,
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const item of items) {
    if (item.x < minX) minX = item.x;
    if (item.y < minY) minY = item.y;
    const right = item.x + item.width;
    const bottom = item.y + item.height;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);

  return { minX, minY, maxX, maxY, width, height };
}

export function computeMinimapScaleAndOffset(
  contentBounds: MinimapBoundingBox,
  minimapWidth: number,
  minimapHeight: number,
  padding: number = MINIMAP_MARGIN_PADDING,
): MinimapTransformMetrics {
  const availableW = Math.max(minimapWidth - padding * 2, 20);
  const availableH = Math.max(minimapHeight - padding * 2, 20);

  const scaleX = availableW / contentBounds.width;
  const scaleY = availableH / contentBounds.height;
  const scale = Math.min(scaleX, scaleY);

  const drawnW = contentBounds.width * scale;
  const drawnH = contentBounds.height * scale;

  const offsetX = (minimapWidth - drawnW) / 2 - contentBounds.minX * scale;
  const offsetY = (minimapHeight - drawnH) / 2 - contentBounds.minY * scale;

  return { scale, offsetX, offsetY, contentBounds };
}

export function projectWorldToMinimap(
  worldX: number,
  worldY: number,
  metrics: MinimapTransformMetrics,
): { x: number; y: number } {
  return {
    x: worldX * metrics.scale + metrics.offsetX,
    y: worldY * metrics.scale + metrics.offsetY,
  };
}

export function projectMinimapToWorld(
  miniX: number,
  miniY: number,
  metrics: MinimapTransformMetrics,
): { x: number; y: number } {
  if (metrics.scale === 0) return { x: 0, y: 0 };
  return {
    x: (miniX - metrics.offsetX) / metrics.scale,
    y: (miniY - metrics.offsetY) / metrics.scale,
  };
}

export function calculateViewportRect(
  stageWidth: number,
  stageHeight: number,
  stageScale: number,
  stagePosition: { x: number; y: number },
  metrics: MinimapTransformMetrics,
): ViewportRectMetrics {
  const visibleWorldX = -stagePosition.x / stageScale;
  const visibleWorldY = -stagePosition.y / stageScale;
  const visibleWorldW = stageWidth / stageScale;
  const visibleWorldH = stageHeight / stageScale;

  const topLeft = projectWorldToMinimap(visibleWorldX, visibleWorldY, metrics);
  const w = visibleWorldW * metrics.scale;
  const h = visibleWorldH * metrics.scale;

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: Math.max(w, 4),
    height: Math.max(h, 4),
  };
}

export function calculatePanToStagePosition(
  targetWorldX: number,
  targetWorldY: number,
  stageWidth: number,
  stageHeight: number,
  stageScale: number,
): { x: number; y: number } {
  return {
    x: stageWidth / 2 - targetWorldX * stageScale,
    y: stageHeight / 2 - targetWorldY * stageScale,
  };
}

export function clampViewportToMinimap(
  x: number,
  y: number,
  w: number,
  h: number,
  minimapW: number,
  minimapH: number,
): { x: number; y: number } {
  const clampedX = Math.max(0, Math.min(x, minimapW - w));
  const clampedY = Math.max(0, Math.min(y, minimapH - h));
  return { x: clampedX, y: clampedY };
}

export class MinimapHUDPlugin extends WeavePlugin {
  private config: MinimapHUDPluginConfig;
  private enabledState: boolean = true;
  private minimapStage: Konva.Stage | null = null;
  private contentLayer: Konva.Layer | null = null;
  private radarLayer: Konva.Layer | null = null;
  private viewportRadar: Konva.Rect | null = null;
  private currentMetrics: MinimapTransformMetrics | null = null;
  private isInteracting: boolean = false;
  private containerEl: HTMLElement | null = null;

  getLayerName = undefined;
  initLayer = undefined;
  onRender = undefined;

  constructor(params?: MinimapHUDPluginParams) {
    super();
    this.config = {
      width: params?.config?.width ?? DEFAULT_MINIMAP_WIDTH,
      height: params?.config?.height ?? DEFAULT_MINIMAP_HEIGHT,
      padding: params?.config?.padding ?? MINIMAP_MARGIN_PADDING,
      theme: params?.config?.theme ?? "light",
      interactiveRadar: params?.config?.interactiveRadar ?? true,
      getContainer: params?.config?.getContainer,
      id: params?.config?.id ?? "minimap-hud-stage",
    };
    this.initialize();
  }

  initialize(): void {
    this.enabledState = true;
    this.minimapStage = null;
    this.contentLayer = null;
    this.radarLayer = null;
    this.viewportRadar = null;
    this.currentMetrics = null;
    this.isInteracting = false;
  }

  getName(): string {
    return MINIMAP_HUD_PLUGIN_KEY;
  }

  onInit(): void {
    this.bindStageEvents();
    this.scheduleDOMMount();
  }

  private scheduleDOMMount(): void {
    const attemptMount = () => {
      const target = this.resolveContainer();
      if (target) {
        this.containerEl = target;
        this.setupMinimapCanvas(target);
      } else {
        setTimeout(attemptMount, 200);
      }
    };
    attemptMount();
  }

  private resolveContainer(): HTMLElement | null {
    if (this.config.getContainer) {
      const custom = this.config.getContainer();
      if (custom) return custom;
    }
    return document.getElementById("minimap") ?? document.getElementById("weave_stage_minimap");
  }

  private setupMinimapCanvas(container: HTMLElement): void {
    if (this.minimapStage) return;

    const width = this.config.width ?? DEFAULT_MINIMAP_WIDTH;
    const height = this.config.height ?? DEFAULT_MINIMAP_HEIGHT;

    container.innerHTML = "";
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.overflow = "hidden";
    container.style.position = "relative";
    container.style.borderRadius = "8px";

    this.minimapStage = new Konva.Stage({
      container: container as HTMLDivElement,
      width,
      height,
    });

    this.contentLayer = new Konva.Layer({ listening: false });
    this.radarLayer = new Konva.Layer({ listening: true });

    this.minimapStage.add(this.contentLayer);
    this.minimapStage.add(this.radarLayer);

    this.createViewportRadar();
    this.bindMinimapInteractions();

    this.refreshMinimap();
  }

  private createViewportRadar(): void {
    if (!this.radarLayer) return;

    const theme = this.config.theme === "dark" ? MINIMAP_HUD_THEME.DARK : MINIMAP_HUD_THEME.LIGHT;

    this.viewportRadar = new Konva.Rect({
      x: 0,
      y: 0,
      width: 40,
      height: 30,
      fill: theme.viewportFill,
      stroke: theme.viewportStroke,
      strokeWidth: 1.5,
      cornerRadius: 3,
      draggable: Boolean(this.config.interactiveRadar),
    });

    this.radarLayer.add(this.viewportRadar);
  }

  private bindMinimapInteractions(): void {
    if (!this.viewportRadar || !this.minimapStage) return;

    this.viewportRadar.on("dragstart", () => {
      this.isInteracting = true;
    });

    this.viewportRadar.on("dragmove", () => {
      if (!this.currentMetrics || !this.viewportRadar) return;
      const stage = this.instance.getStage();
      const stageScale = stage.scaleX();

      const newWorldX = projectMinimapToWorld(this.viewportRadar.x(), 0, this.currentMetrics).x;
      const newWorldY = projectMinimapToWorld(0, this.viewportRadar.y(), this.currentMetrics).y;

      stage.position({
        x: -newWorldX * stageScale,
        y: -newWorldY * stageScale,
      });
      stage.batchDraw();
    });

    this.viewportRadar.on("dragend", () => {
      this.isInteracting = false;
      this.refreshViewport();
    });

    this.minimapStage.on("click tap", (e) => {
      if (e.target === this.viewportRadar) return;
      const pos = this.minimapStage?.getPointerPosition();
      if (!pos || !this.currentMetrics) return;

      const targetWorld = projectMinimapToWorld(pos.x, pos.y, this.currentMetrics);
      this.panTo(targetWorld.x, targetWorld.y);
    });
  }

  private bindStageEvents(): void {
    const stage = this.instance.getStage();

    stage.on("dragmove wheel scaleXChange scaleYChange xChange yChange", () => {
      if (!this.isInteracting) {
        this.refreshViewport();
      }
    });

    this.instance.addEventListener("onRender", () => this.refreshMinimap());
    this.instance.addEventListener("onZoomChange", () => this.refreshViewport());
    this.instance.addEventListener("onNodeAdded", () => this.refreshMinimap());
    this.instance.addEventListener("onNodeRemoved", () => this.refreshMinimap());
  }

  public refreshMinimap(): void {
    if (!this.enabledState || !this.contentLayer || !this.minimapStage) return;

    const mainLayer = this.instance.getMainLayer();
    if (!mainLayer) return;

    const children = mainLayer.getChildren((node) => node.name() === "node" || Boolean(node.id()));
    const items = children.map((c) => ({
      x: c.x(),
      y: c.y(),
      width: c.width() || 100,
      height: c.height() || 100,
      color: (c.getAttr("fill") as string) || (c.getAttr("color") as string) || undefined,
    }));

    const contentBounds = calculateContentBounds(items);
    this.currentMetrics = computeMinimapScaleAndOffset(
      contentBounds,
      this.minimapStage.width(),
      this.minimapStage.height(),
      this.config.padding,
    );

    this.contentLayer.destroyChildren();

    const theme = this.config.theme === "dark" ? MINIMAP_HUD_THEME.DARK : MINIMAP_HUD_THEME.LIGHT;

    for (const item of items) {
      const miniPos = projectWorldToMinimap(item.x, item.y, this.currentMetrics);
      const miniW = Math.max(item.width * this.currentMetrics.scale, 2);
      const miniH = Math.max(item.height * this.currentMetrics.scale, 2);

      const miniRect = new Konva.Rect({
        x: miniPos.x,
        y: miniPos.y,
        width: miniW,
        height: miniH,
        fill: item.color || theme.nodeDefault,
        cornerRadius: 1,
        listening: false,
      });
      this.contentLayer.add(miniRect);
    }

    this.contentLayer.batchDraw();
    this.refreshViewport();
  }

  public refreshViewport(): void {
    if (!this.viewportRadar || !this.currentMetrics || !this.radarLayer) return;

    const stage = this.instance.getStage();
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const stageScale = stage.scaleX();
    const stagePosition = stage.position();

    const rect = calculateViewportRect(
      stageWidth,
      stageHeight,
      stageScale,
      stagePosition,
      this.currentMetrics,
    );

    this.viewportRadar.setAttrs({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });

    this.radarLayer.batchDraw();
  }

  public panTo(worldX: number, worldY: number): void {
    const stage = this.instance.getStage();
    const stageScale = stage.scaleX();
    const targetPos = calculatePanToStagePosition(
      worldX,
      worldY,
      stage.width(),
      stage.height(),
      stageScale,
    );

    stage.position(targetPos);
    stage.batchDraw();
    this.refreshViewport();
  }

  public resetZoom(): void {
    const stage = this.instance.getStage();
    stage.scale({ x: 1, y: 1 });
    stage.batchDraw();
    this.refreshViewport();
  }

  public fitToNodes(): void {
    const mainLayer = this.instance.getMainLayer();
    if (!mainLayer) return;
    const stage = this.instance.getStage();

    const box = mainLayer.getClientRect({ skipStroke: true, skipShadow: true });
    if (box.width === 0 || box.height === 0) return;

    const padding = 40;
    const scaleX = (stage.width() - padding * 2) / box.width;
    const scaleY = (stage.height() - padding * 2) / box.height;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 3);

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    stage.scale({ x: fitScale, y: fitScale });
    stage.position({
      x: stage.width() / 2 - centerX * fitScale,
      y: stage.height() / 2 - centerY * fitScale,
    });
    stage.batchDraw();
    this.refreshMinimap();
  }

  public getZoomPercent(): number {
    const stage = this.instance.getStage();
    return Math.round(stage.scaleX() * 100);
  }

  public override isEnabled(): boolean {
    return this.enabledState;
  }

  public override enable(): void {
    this.enabledState = true;
    if (this.containerEl) this.containerEl.style.display = "block";
    this.refreshMinimap();
  }

  public override disable(): void {
    this.enabledState = false;
    if (this.containerEl) this.containerEl.style.display = "none";
  }

  public toggle(): boolean {
    if (this.enabledState) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabledState;
  }

  public isVisible(): boolean {
    return this.enabledState;
  }

  public getMetrics(): MinimapTransformMetrics | null {
    return this.currentMetrics;
  }
}
