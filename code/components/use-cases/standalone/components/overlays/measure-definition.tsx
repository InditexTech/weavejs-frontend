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
import { Label } from "@/components/ui/label";
import React from "react";
import { X } from "lucide-react";
import { merge } from "lodash";
import { useWeave } from "@inditextech/weave-react";
import { useStandaloneUseCase } from "../../store/store";

export function MeasureDefinitionDialog() {
  const instance = useWeave((state) => state.instance);

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const measureId = useStandaloneUseCase(
    (state) => state.customMeasurement.measureId
  );
  const measures = useStandaloneUseCase(
    (state) => state.customMeasurement.measures
  );
  const customMeasureUnits = useStandaloneUseCase(
    (state) => state.customMeasurement.unit
  );
  const measureDefinitionOpen = useStandaloneUseCase(
    (state) => state.customMeasurement.open
  );
  const setMeasurementDefinitionOpen = useStandaloneUseCase(
    (state) => state.setMeasurementDefinitionOpen
  );
  const setMeasures = useStandaloneUseCase((state) => state.setMeasures);

  const [realMeasure, setRealMeasure] = React.useState<string>("");

  return (
    <Dialog
      open={measureDefinitionOpen}
      onOpenChange={(open) => setMeasurementDefinitionOpen(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-4/12 max-w-4/12 translate-y-0">
          <div className="w-full h-full flex flex-col gap-5">
            <DialogHeader>
              <div className="w-full flex gap-5 justify-between items-center">
                <DialogTitle className="font-inter text-2xl font-normal uppercase">
                  Measure
                </DialogTitle>
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
              </div>
            </DialogHeader>

            <DialogDescription className="font-inter text-sm my-5">
              Setup measurement configuration.
            </DialogDescription>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col justify-start items-start gap-0">
                <Label className="mb-2">Real Measure</Label>
                <Input
                  type="text"
                  className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                  value={realMeasure}
                  onChange={(e) => {
                    setRealMeasure(e.target.value);
                  }}
                  onFocus={() => {
                    window.weaveOnFieldFocus = true;
                  }}
                  onBlurCapture={() => {
                    window.weaveOnFieldFocus = false;
                  }}
                />
              </div>
              <div className="flex flex-col justify-start items-start gap-0">
                <Label className="mb-2">Unit</Label>
                {customMeasureUnits}
              </div>
            </div>
            <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
            <DialogFooter>
              <Button
                type="button"
                className="cursor-pointer font-inter rounded-none"
                onClick={() => {
                  if (!instance) {
                    return;
                  }

                  if (!measureId) {
                    return;
                  }

                  const newMeasures = { ...measures };

                  const actualSavedConfig = JSON.parse(
                    sessionStorage.getItem(
                      `weave.js_standalone_${instanceId}_${managingImageId}_config`
                    ) || "{}"
                  );

                  newMeasures[measureId] = {
                    ...newMeasures[measureId],
                    realMeasure: Number.parseFloat(realMeasure),
                  };

                  const updatedConfig = {
                    customMeasurement: {
                      measures: newMeasures,
                    },
                  };

                  const finalConfiguration = merge(
                    actualSavedConfig,
                    updatedConfig
                  );

                  sessionStorage.setItem(
                    `weave.js_standalone_${instanceId}_${managingImageId}_config`,
                    JSON.stringify(finalConfiguration)
                  );

                  setMeasures(finalConfiguration.customMeasurement.measures);

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
