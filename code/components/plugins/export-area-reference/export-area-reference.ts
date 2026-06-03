// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { BoundingBox } from "@inditextech/weave-types";
import {
  WeavePlugin,
  Guide,
  GUIDE_KIND,
  GUIDE_ORIENTATION,
} from "@inditextech/weave-sdk";
import {
  ExportAreaReferencePluginConfig,
  ExportAreaReferencePluginParams,
} from "./types";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "./constants";
import Konva from "konva";

export class ExportAreaReferencePlugin extends WeavePlugin {
  private readonly config!: ExportAreaReferencePluginConfig;
  private actualSize!: string;
  private layer!: Konva.Layer | null;
  private leftText!: string | null;
  private rightText!: string | null;
  getLayerName = undefined;
  initLayer = undefined;
  onRender: undefined;

  constructor(params: ExportAreaReferencePluginParams) {
    super();

    this.config = params.config;

    this.initialize();
  }

  initialize(): void {
    this.actualSize = this.config.initialSize;
    this.layer = null;
  }

  getName(): string {
    return EXPORT_AREA_REFERENCE_PLUGIN_KEY;
  }

  getExportAreaReferenceVisibility() {
    return this.layer?.isVisible() ?? false;
  }

  hideExportAreaReference() {
    this.layer?.hide();
  }

  showExportAreaReference() {
    this.layer?.show();
  }

  getExportRect(params?: { relativeTo?: Konva.Container }): BoundingBox | null {
    const stage = this.instance.getStage();

    const renderAreaNode = stage.findOne("#export-area-reference-rect") as
      | Konva.Rect
      | undefined;

    if (!renderAreaNode) {
      return null;
    }

    const box = renderAreaNode.getClientRect({
      skipStroke: true,
      relativeTo: params?.relativeTo,
    });

    return box;
  }

  getRenderRect(): { x: number; y: number; width: number; height: number } {
    const stage = this.instance.getStage();

    const renderAreaNode = stage.findOne("#export-area-reference-rect") as
      | Konva.Rect
      | undefined;

    if (!renderAreaNode) {
      throw new Error("Render area node not found");
    }

    const box = renderAreaNode.getClientRect({
      relativeTo: stage,
      skipStroke: true,
    });

    return box;
  }

  onInit(): void {
    const stage = this.instance.getStage();

    this.layer = new Konva.Layer({
      id: "export-area-reference-layer",
      listening: false,
    });

    stage.add(this.layer);
    this.layer.moveToBottom();

    this.instance.addEventListener("onRender", () => {
      this.renderReference();
    });

    this.instance.addEventListener("onZoomChange", () => {
      this.renderReference();
    });

    this.renderReference();

    const hooks = this.instance.getHooks();
    hooks.callHook("snappingManagerPlugin:onAddCustomGuides", {
      guides: this.getExportAreaGuides(stage),
    });
  }

  changeSize(newSize: string) {
    this.actualSize = newSize;
    this.renderReference();
  }

  private destroyReference(): void {
    const stage = this.instance.getStage();

    const elements = stage.find(".export-area-reference");
    for (let i = 0; i < elements.length; i++) {
      elements[i].destroy();
    }
  }

  private renderReference(): void {
    const stage = this.instance.getStage();

    const referenceAreaLayer = this.layer;

    if (!referenceAreaLayer) {
      return;
    }

    this.destroyReference();

    const scale = stage.scaleX();

    const actualSize = this.config.sizes[this.actualSize];

    const resolutionText = this.leftText ?? "page name";

    const referenceText = new Konva.Text({
      id: "export-area-reference-text",
      name: "export-area-reference",
      x: (actualSize.width / 2) * -1,
      y: actualSize.height / 2,
      text: resolutionText,
      fontSize: 12 / scale,
      fontFamily: "Roboto Mono, monospace",
      opacity: 0.7,
      fill: "#000000",
      draggable: false,
      listening: false,
    });

    referenceText.y(referenceText.y() + 12);

    referenceAreaLayer.add(referenceText);

    const textDetails = this.rightText ?? "page 1 of 1";

    const referenceTextDetails = new Konva.Text({
      id: "export-area-reference-text-details",
      name: "export-area-reference",
      x: actualSize.width / 2,
      y: actualSize.height / 2,
      text: textDetails,
      fontSize: 12 / scale,
      fontFamily: "Roboto Mono, monospace",
      opacity: 0.7,
      fill: "#000000",
      draggable: false,
      listening: false,
    });

    const textDetailsSize = referenceTextDetails.measureSize(textDetails);

    referenceTextDetails.x(referenceTextDetails.x() - textDetailsSize.width);
    referenceTextDetails.y(referenceTextDetails.y() + 12);

    referenceAreaLayer.add(referenceTextDetails);

    // const exportRect = new Konva.Rect({
    //   id: "export-area-reference-export-rect",
    //   name: "export-area-reference",
    //   x: actualSize.width / 2,
    //   y: actualSize.height / 2,
    //   width: actualSize.width,
    //   height: actualSize.height,
    //   stroke: "#000000",
    //   strokeScaleEnabled: false,
    //   strokeWidth: 0,
    //   fill: "transparent",
    //   opacity: 0.7,
    //   draggable: false,
    //   listening: false,
    // });

    // referenceAreaLayer.add(exportRect);

    const referenceRect = new Konva.Rect({
      id: "export-area-reference-rect",
      name: "export-area-reference",
      x: (actualSize.width / 2) * -1,
      y: (actualSize.height / 2) * -1,
      width: actualSize.width,
      height: actualSize.height,
      fillAfterStrokeEnabled: true,
      stroke: "#000000",
      dash: [6, 6],
      strokeScaleEnabled: false,
      strokeWidth: 1,
      opacity: 0.7,
      draggable: false,
      listening: false,
    });

    referenceAreaLayer.add(referenceRect);

    referenceText.moveToBottom();
    referenceRect.moveToBottom();

    referenceAreaLayer.moveToTop();
    // referenceAreaLayer.moveUp();
  }

  setRightText(text: string) {
    this.rightText = text;
    this.renderReference();
  }

  setLeftText(text: string) {
    this.leftText = text;
    this.renderReference();
  }

  enable(): void {
    this.layer?.show();
    this.enabled = true;
  }

  disable(): void {
    this.layer?.hide();
    this.enabled = false;
  }

  getExportAreaGuides(relativeTo?: Konva.Node | null): Guide[] {
    const stage = this.instance.getStage();
    const renderAreaNode = stage.findOne("#export-area-reference-rect") as
      | Konva.Rect
      | undefined;

    if (!renderAreaNode) {
      return [];
    }

    if (!relativeTo) {
      return [];
    }

    const rect = renderAreaNode.getClientRect({
      ...(relativeTo && {
        relativeTo: relativeTo as unknown as Konva.Container,
      }),
      skipStroke: true,
    });
    return this.rectToGuides("exportArea", rect);
  }

  private rectToGuides(sourceId: string, rect: BoundingBox): Guide[] {
    const mainLayer = this.instance.getMainLayer();
    if (!mainLayer) {
      return [];
    }

    return [
      {
        orientation: GUIDE_ORIENTATION.VERTICAL,
        value: rect.x,
        kind: GUIDE_KIND.STATIC,
        guideId: `${sourceId}-${mainLayer.id()}-vertical-start`,
        containerId: mainLayer.id(),
      },
      {
        orientation: GUIDE_ORIENTATION.VERTICAL,
        value: rect.x + rect.width / 2,
        kind: GUIDE_KIND.STATIC,
        guideId: `${sourceId}-${mainLayer.id()}-vertical-middle`,
        containerId: mainLayer.id(),
      },
      {
        orientation: GUIDE_ORIENTATION.VERTICAL,
        value: rect.x + rect.width,
        kind: GUIDE_KIND.STATIC,
        guideId: `${sourceId}-${mainLayer.id()}-vertical-end`,
        containerId: mainLayer.id(),
      },
      {
        orientation: GUIDE_ORIENTATION.HORIZONTAL,
        value: rect.y,
        kind: GUIDE_KIND.STATIC,
        guideId: `${sourceId}-${mainLayer.id()}-horizontal-start`,
        containerId: mainLayer.id(),
      },
      {
        orientation: GUIDE_ORIENTATION.HORIZONTAL,
        value: rect.y + rect.height / 2,
        kind: GUIDE_KIND.STATIC,
        guideId: `${sourceId}-${mainLayer.id()}-horizontal-middle`,
        containerId: mainLayer.id(),
      },
      {
        orientation: GUIDE_ORIENTATION.HORIZONTAL,
        value: rect.y + rect.height,
        kind: GUIDE_KIND.STATIC,
        guideId: `${sourceId}-${mainLayer.id()}-horizontal-end`,
        containerId: mainLayer.id(),
      },
    ];
  }
}
