import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStandaloneUseCase } from "../../store/store";
import { RightSidebarTitle } from "../page/right-sidebar-title";
import { MeasureNode } from "../../nodes/measure/measure";
import {
  Calculator,
  CircleX,
  PencilRuler,
  Ruler,
  RulerDimensionLine,
} from "lucide-react";
import { useMeasuresInfo } from "../../hooks/use-measures-info";
import { MEASURE_NODE_TYPE } from "../../nodes/measure/constants";

export const Measures = () => {
  const instance = useWeave((state) => state.instance);
  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const activeSidebar = useStandaloneUseCase((state) => state.sidebar.active);
  const measureUnit = useStandaloneUseCase((state) => state.measurement.unit);
  const setMeasureId = useStandaloneUseCase((state) => state.setMeasureId);
  const setMeasurementDefinitionOpen = useStandaloneUseCase(
    (state) => state.setMeasurementDefinitionOpen
  );

  const { scale, measures } = useMeasuresInfo();

  if (activeSidebar !== "measures") {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="w-full p-5 py-3 border-b border-[#c9c9c9] flex justify-between items-center">
        <RightSidebarTitle />
        <div className="w-full flex flex-col justify-start items-start gap-0">
          <div className="w-full text-right font-inter text-sm">
            {!scale || Number.isNaN(scale) ? "-" : scale.toFixed(4)}
          </div>{" "}
          <div className="w-full text-right font-inter text-xs text-[#666666] uppercase">
            scale (px/{measureUnit})
          </div>
        </div>
      </div>
      {measures.length === 0 && (
        <div className="w-full h-[calc(100%-65px)] font-inter text-sm flex justify-center items-center">
          No measures defined.
        </div>
      )}
      {measures.length > 0 && (
        <ScrollArea className="w-full h-[calc(100%-65px-40px)] overflow-auto">
          <div className="flex flex-col gap-3 w-full p-5">
            {measures.map((measure) => {
              if (!instance) {
                return null;
              }

              const measureHandler =
                instance.getNodeHandler<MeasureNode>(MEASURE_NODE_TYPE);

              if (!measureHandler) {
                return null;
              }

              const useRealMeasure =
                measure.getAttr("realMeasure") !== undefined;

              const distance = measureHandler.getDistance(measure);
              const unitPerPixel = measure.getAttr("unitPerPixel");
              const unitPerPixelNumber = parseFloat(unitPerPixel);

              return (
                <div
                  key={measure.getAttr("id")}
                  className="w-full flex flex-col gap-3 p-3 border border-[#e0e0e0] rounded-none cursor-pointer"
                  onClick={() => {
                    if (!instance) {
                      return;
                    }

                    instance.selectNodesByKey([measure.getAttr("id")]);
                  }}
                >
                  {!useRealMeasure && Number.isNaN(unitPerPixelNumber) && (
                    <div className="w-full flex justify-between items-center text-right font-inter text-xl">
                      <div className="w-full flex justify-start items-center gap-1">
                        <button
                          className="cursor-pointer hover:bg-[#f0f0f0] rounded-full p-2"
                          onClick={() => {
                            if (!instance) {
                              return;
                            }

                            const nodeInstance = instance
                              .getStage()
                              .findOne(`#${measure.getAttr("id")}`);

                            const measureHandler =
                              instance.getNodeHandler<MeasureNode>(
                                MEASURE_NODE_TYPE
                              );

                            if (nodeInstance && measureHandler) {
                              setMeasureId(
                                nodeInstance.getAttrs().id as string
                              );
                              setMeasurementDefinitionOpen(true);
                            }
                          }}
                        >
                          <Ruler size={20} strokeWidth={1} />
                        </button>
                      </div>
                      <div className="flex gap-3 justify-end items-center">
                        <span className="whitespace-nowrap">
                          {`${distance.toFixed(2)} px`}
                        </span>
                        <Calculator strokeWidth={1} />
                      </div>
                    </div>
                  )}
                  {useRealMeasure && (
                    <div className="w-full flex justify-between items-center text-right font-inter text-xl">
                      <div className="w-full flex justify-start items-center gap-1">
                        <button
                          className="cursor-pointer hover:bg-[#f0f0f0] rounded-full p-2"
                          onClick={() => {
                            if (!instance) {
                              return;
                            }

                            const nodeInstance = instance
                              .getStage()
                              .findOne(`#${measure.getAttr("id")}`);

                            const measureHandler =
                              instance.getNodeHandler<MeasureNode>(
                                MEASURE_NODE_TYPE
                              );

                            if (nodeInstance && measureHandler) {
                              setMeasureId(
                                nodeInstance.getAttrs().id as string
                              );
                              setMeasurementDefinitionOpen(true);
                            }
                          }}
                        >
                          <PencilRuler size={20} strokeWidth={1} />
                        </button>
                        <button
                          className="cursor-pointer hover:bg-[#f0f0f0] rounded-full p-2"
                          onClick={() => {
                            if (!instance) {
                              return;
                            }

                            const nodeInstance = instance
                              .getStage()
                              .findOne(`#${measure.getAttr("id")}`);

                            const measureHandler =
                              instance.getNodeHandler<MeasureNode>(
                                MEASURE_NODE_TYPE
                              );

                            if (nodeInstance && measureHandler) {
                              const actualSavedConfig = JSON.parse(
                                sessionStorage.getItem(
                                  `weave.js_standalone_${instanceId}_${managingImageId}_config`
                                ) || "{}"
                              );

                              instance.emitEvent("onMeasureChange", {
                                nodeId: nodeInstance.getAttrs().id,
                                unit: actualSavedConfig.measurement.unit,
                              });
                            }
                          }}
                        >
                          <CircleX size={20} strokeWidth={1} />
                        </button>
                      </div>
                      <div className="flex gap-3 justify-end items-center">
                        <span className="whitespace-nowrap">
                          {measure.getAttr("realMeasure")
                            ? `${measure.getAttr("realMeasure")} ${measureUnit}`
                            : "-"}
                        </span>
                        <RulerDimensionLine strokeWidth={1} />
                      </div>
                    </div>
                  )}
                  {!useRealMeasure && !Number.isNaN(unitPerPixelNumber) && (
                    <>
                      <div className="w-full flex justify-between items-center text-right font-inter text-xl">
                        <div className="w-full flex justify-start items-center gap-1">
                          <button
                            className="cursor-pointer hover:bg-[#f0f0f0] rounded-full p-2"
                            onClick={() => {
                              if (!instance) {
                                return;
                              }

                              const nodeInstance = instance
                                .getStage()
                                .findOne(`#${measure.getAttr("id")}`);

                              const measureHandler =
                                instance.getNodeHandler<MeasureNode>(
                                  MEASURE_NODE_TYPE
                                );

                              if (nodeInstance && measureHandler) {
                                setMeasureId(
                                  nodeInstance.getAttrs().id as string
                                );
                                setMeasurementDefinitionOpen(true);
                              }
                            }}
                          >
                            <Ruler size={20} strokeWidth={1} />
                          </button>
                        </div>
                        <div className="flex gap-3 justify-end items-center">
                          <span className="whitespace-nowrap">
                            {`${(distance / unitPerPixelNumber).toFixed(2)} ${measureUnit}`}
                          </span>
                          <Calculator strokeWidth={1} />
                        </div>
                      </div>
                      <div className="w-full h-[1px] bg-[#c9c9c9]"></div>
                      <div className="w-full">
                        <div className="w-full flex flex-col justify-start items-start gap-0">
                          <div className="w-full text-right font-inter text-sm">
                            {distance.toFixed(4)}
                          </div>
                          <div className="w-full text-right font-inter text-xs text-[#666666] uppercase">
                            distance (px)
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
