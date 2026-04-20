// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { type FitToPageToolActionParams } from "./types";
import { FIT_TO_PAGE_TOOL_ACTION_NAME } from "./constants";
import { WeaveAction, WeaveStageZoomPlugin } from "@inditextech/weave-sdk";
import { ExportAreaReferencePlugin } from "@/components/plugins/export-area-reference/export-area-reference";
import { EXPORT_AREA_REFERENCE_PLUGIN_KEY } from "@/components/plugins/export-area-reference/constants";

export class FitToPageToolAction extends WeaveAction {
  protected previousAction!: string;
  protected cancelAction!: () => void;
  onPropsChange = undefined;
  initialize = undefined;

  constructor() {
    super();
  }

  getName(): string {
    return FIT_TO_PAGE_TOOL_ACTION_NAME;
  }

  private getStageZoomPlugin() {
    const stageZoomPlugin =
      this.instance.getPlugin<WeaveStageZoomPlugin>("stageZoom");

    if (!stageZoomPlugin) {
      throw new Error(
        "FitToScreenPageToolAction requires the WeaveStageZoomPlugin to be loaded",
      );
    }

    return stageZoomPlugin;
  }

  private getExportAreaReferencePlugin() {
    const exportAreaReferencePlugin =
      this.instance.getPlugin<ExportAreaReferencePlugin>(
        EXPORT_AREA_REFERENCE_PLUGIN_KEY,
      );

    if (!exportAreaReferencePlugin) {
      throw new Error(
        "FitToScreenPageToolAction requires the ExportAreaReferencePlugin to be loaded",
      );
    }

    return exportAreaReferencePlugin;
  }

  onInit(): void {
    this.getStageZoomPlugin();
  }

  trigger(cancelAction: () => void, params: FitToPageToolActionParams): void {
    const stageZoomPlugin = this.getStageZoomPlugin();

    if (!stageZoomPlugin) {
      this.cancelAction();
    }

    const exportAreaReferencePlugin = this.getExportAreaReferencePlugin();

    if (!exportAreaReferencePlugin) {
      this.cancelAction();
    }

    const renderRect = exportAreaReferencePlugin.getRenderRect();

    stageZoomPlugin.fitToArea(renderRect, {
      overrideZoom: params?.overrideZoom ?? false,
    });

    this.previousAction = params.previousAction;
    this.cancelAction = cancelAction;

    this.cancelAction();
  }

  cleanup(): void {
    const stage = this.instance.getStage();

    if (this.previousAction !== undefined) {
      this.instance.triggerAction(this.previousAction);
    }

    stage.container().style.cursor = "default";
  }
}
