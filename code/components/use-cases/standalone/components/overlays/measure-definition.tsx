// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { X } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { useStandaloneUseCase } from "../../store/store";
import Konva from "konva";
import { useMeasuresInfo } from "../../hooks/use-measures-info";

export function MeasureDefinitionDialog() {
  const clickedOutsideRef = React.useRef(false);
  const instance = useWeave((state) => state.instance);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const measureId = useStandaloneUseCase(
    (state) => state.measurement.measureId
  );
  const measureDefinitionOpen = useStandaloneUseCase(
    (state) => state.measurement.open
  );
  const setMeasurementDefinitionOpen = useStandaloneUseCase(
    (state) => state.setMeasurementDefinitionOpen
  );

  const { scale } = useMeasuresInfo();

  const [unit, setUnit] = React.useState<string>("");
  const [inputMeasure, setInputMeasure] = React.useState<string>("");

  React.useEffect(() => {
    if (!instance) {
      return;
    }

    const actualSavedConfig = JSON.parse(
      sessionStorage.getItem(
        `weave.js_standalone_${instanceId}_${managingImageId}_config`
      ) || "{}"
    );

    if (actualSavedConfig.measurement) {
      setUnit(actualSavedConfig.measurement.unit || "");
    }

    const stage = instance.getStage();

    if (stage && measureId) {
      const measure = stage.findOne<Konva.Group>(`#${measureId}`);

      if (!measure) {
        return;
      }

      if (measure.getAttr("realMeasure") === undefined) {
        setInputMeasure("");
        return;
      }

      setInputMeasure(measure.getAttr("realMeasure").toString());
    }
  }, [instance, instanceId, managingImageId, measureId, measureDefinitionOpen]);

  return (
    <Dialog
      modal={false}
      open={measureDefinitionOpen}
      onOpenChange={(open) => {
        if (!clickedOutsideRef.current) {
          setMeasurementDefinitionOpen(open);
        }
        clickedOutsideRef.current = false;
      }}
    >
      <form>
        <DialogContent
          className="w-full rounded-none min-w-2/12 max-w-2/12"
          onPointerDownOutside={(e) => {
            e.preventDefault();
            clickedOutsideRef.current = true;
          }}
          onEscapeKeyDown={(e) => {
            if (!scale || Number.isNaN(scale)) {
              e.preventDefault();
            }
          }}
        >
          <div className="w-full h-full flex flex-col gap-5">
            <DialogHeader>
              <div className="w-full flex gap-5 justify-between items-center">
                <DialogTitle className="font-inter text-2xl font-normal uppercase">
                  Explicit Measure
                </DialogTitle>
                {scale && !Number.isNaN(scale) && (
                  <DialogClose asChild>
                    <button
                      className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                      onClick={() => {
                        setMeasurementDefinitionOpen(false);
                      }}
                    >
                      <X size={16} strokeWidth={1} />
                    </button>
                  </DialogClose>
                )}
              </div>
            </DialogHeader>
            <DialogDescription className="font-inter text-sm my-5">
              Define the explicit measurement for the selected measure.
            </DialogDescription>
            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col justify-center items-start gap-0">
                <div className="w-full flex gap-2 justify-center items-center">
                  <Input
                    type="text"
                    className="w-[200px] !text-right py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                    value={inputMeasure}
                    onChange={(e) => {
                      setInputMeasure(e.target.value);
                    }}
                    onFocus={() => {
                      window.weaveOnFieldFocus = true;
                    }}
                    onBlurCapture={() => {
                      window.weaveOnFieldFocus = false;
                    }}
                  />
                  <div>{unit}</div>
                </div>
              </div>
            </div>
            <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
            <DialogFooter>
              <Button
                type="button"
                className="cursor-pointer font-inter rounded-none"
                disabled={inputMeasure === ""}
                onClick={() => {
                  if (!instance) {
                    return;
                  }

                  if (!measureId) {
                    return;
                  }

                  const realMeasure =
                    inputMeasure === ""
                      ? undefined
                      : Number.parseFloat(inputMeasure);

                  instance.emitEvent("onMeasureChange", {
                    nodeId: measureId,
                    realMeasure,
                  });

                  setMeasurementDefinitionOpen(false);
                }}
              >
                SAVE
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
