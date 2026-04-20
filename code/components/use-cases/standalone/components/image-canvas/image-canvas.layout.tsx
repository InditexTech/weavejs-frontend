// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { cn } from "@/lib/utils";
import { useWeave, useWeaveEvents } from "@inditextech/weave-react";
import {
  WEAVE_INSTANCE_STATUS,
  WEAVE_STORE_CONNECTION_STATUS,
} from "@inditextech/weave-types";
import { Tools } from "../overlays/tools";
import { WeaveStageZoomPlugin } from "@inditextech/weave-sdk";
import { useStandaloneUseCase } from "../../store/store";
import { ConfigurationDialog } from "../overlays/configuration";
import { NodeToolbar } from "../overlays/node-toolbar";
import { ExportPageToImageConfigDialog } from "@/components/room-components/overlay/export-page-to-image-config";
import { MeasureDefinitionDialog } from "../overlays/measure-definition";
import { MeasureNode } from "../../nodes/measure/measure";
import { useMeasuresInfo } from "../../hooks/use-measures-info";
import { MEASURE_NODE_TYPE } from "../../nodes/measure/constants";

export const ImageCanvasLayout = () => {
  const instance = useWeave((state) => state.instance);
  const roomLoaded = useWeave((state) => state.room.loaded);
  const status = useWeave((state) => state.status);
  const weaveConnectionStatus = useWeave((state) => state.connection.status);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const exporting = useStandaloneUseCase((state) => state.actions.exporting);
  const saving = useStandaloneUseCase((state) => state.actions.saving);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId,
  );
  const setExporting = useStandaloneUseCase((state) => state.setExporting);
  const setMeasureUnit = useStandaloneUseCase((state) => state.setMeasureUnit);
  const setMeasureId = useStandaloneUseCase((state) => state.setMeasureId);
  const setMeasurementDefinitionOpen = useStandaloneUseCase(
    (state) => state.setMeasurementDefinitionOpen,
  );
  const setSidebarVisible = useStandaloneUseCase(
    (state) => state.setSidebarVisible,
  );

  useWeaveEvents();

  const [loaded, setLoaded] = React.useState(false);

  const { scale } = useMeasuresInfo();

  React.useEffect(() => {
    setSidebarVisible(false);
  }, [managingImageId, setSidebarVisible]);

  React.useEffect(() => {
    if (!instance) return;

    if (status !== WEAVE_INSTANCE_STATUS.RUNNING) return;

    if (!roomLoaded) return;

    if (!managingImageId) return;

    if (status === WEAVE_INSTANCE_STATUS.RUNNING) {
      const stageZoomPlugin =
        instance.getPlugin<WeaveStageZoomPlugin>("stageZoom");

      if (stageZoomPlugin) {
        stageZoomPlugin.fitToNodes([managingImageId]);
      }
    }
  }, [instance, status, managingImageId, roomLoaded]);

  React.useEffect(() => {
    if (!instance) return;

    const actualSavedConfig = JSON.parse(
      sessionStorage.getItem(
        `weave.js_standalone_${instanceId}_${managingImageId}_config`,
      ) || "{}",
    );

    if (!loaded && !actualSavedConfig.measurement) {
      sessionStorage.setItem(
        `weave.js_standalone_${instanceId}_${managingImageId}_config`,
        JSON.stringify({
          ...actualSavedConfig,
          measurement: {
            unit: "cms",
          },
        }),
      );

      setLoaded(true);
      return;
    }

    if (!loaded && actualSavedConfig.measurement) {
      setLoaded(true);
    }
  }, [instance, instanceId, managingImageId, loaded]);

  React.useEffect(() => {
    if (!loaded) return;

    if (!instance) return;

    const actualSavedConfig = JSON.parse(
      sessionStorage.getItem(
        `weave.js_standalone_${instanceId}_${managingImageId}_config`,
      ) || "{}",
    );

    setMeasureUnit(actualSavedConfig.measurement.unit || "cms");

    instance.emitEvent("onMeasureReferenceChange", {
      unit: actualSavedConfig.measurement.unit,
      unitPerPixel: scale,
    });
  }, [instance, instanceId, managingImageId, loaded, scale, setMeasureUnit]);

  React.useEffect(() => {
    if (!instance) return;

    const defineMeasureHandler = (data: { nodeId: string }) => {
      const measureHandler =
        instance.getNodeHandler<MeasureNode>(MEASURE_NODE_TYPE);

      if (!measureHandler) {
        return;
      }

      const hasUnitPerPixelDefined = measureHandler.hasUnitPerPixelDefined();

      if (!hasUnitPerPixelDefined) {
        setMeasureId(data.nodeId);
        setMeasurementDefinitionOpen(true);
      }
    };

    instance.addEventListener("onCreateMeasure", defineMeasureHandler);

    return () => {
      instance.removeEventListener("onCreateMeasure", defineMeasureHandler);
    };
  }, [
    instance,
    instanceId,
    managingImageId,
    setMeasureId,
    setMeasurementDefinitionOpen,
  ]);

  return (
    <>
      <div
        id="weave"
        tabIndex={0}
        style={{
          background: "#d6d6d6",
        }}
        className={cn("w-full h-full overflow-hidden", {
          ["pointer-events-none"]:
            weaveConnectionStatus !== WEAVE_STORE_CONNECTION_STATUS.CONNECTED ||
            status !== WEAVE_INSTANCE_STATUS.RUNNING ||
            !roomLoaded,
          ["pointer-events-auto"]:
            status === WEAVE_INSTANCE_STATUS.RUNNING && roomLoaded,
        })}
      >
        <NodeToolbar />
      </div>
      <div className="absolute top-0 left-0 right-0 bottom-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.10)] pointer-events-none"></div>
      {weaveConnectionStatus === WEAVE_STORE_CONNECTION_STATUS.CONNECTED && (
        <>
          <Tools />
          {exporting && (
            <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 flex flex-col justify-center items-center">
              <div className="flex flex-col gap-1 justify-center items-center bg-white p-5">
                <div className="font-inter text-xl uppercase">exporting</div>
              </div>
            </div>
          )}
          {saving && (
            <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/20 flex flex-col justify-center items-center">
              <div className="flex flex-col gap-1 justify-center items-center bg-white p-5">
                <div className="font-inter text-xl uppercase">saving</div>
              </div>
            </div>
          )}
          <ExportPageToImageConfigDialog onIsExportingChange={setExporting} />
          <ConfigurationDialog />
          <MeasureDefinitionDialog />
        </>
      )}
    </>
  );
};
