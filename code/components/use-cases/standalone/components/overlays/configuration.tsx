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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { X } from "lucide-react";
import { merge } from "lodash";
import { useWeave } from "@inditextech/weave-react";
import { useStandaloneUseCase } from "../../store/store";

export function ConfigurationDialog() {
  const instance = useWeave((state) => state.instance);

  const [selectedTab, setSelectedTab] = React.useState<string>("measurement");

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const configurationOpen = useStandaloneUseCase(
    (state) => state.configuration.open
  );
  const setConfigurationOpen = useStandaloneUseCase(
    (state) => state.setConfigurationOpen
  );
  const setMeasurement = useStandaloneUseCase((state) => state.setMeasurement);
  const measurementUnits = useStandaloneUseCase(
    (state) => state.measurement.units
  );
  const measurementReferenceMeasureUnits = useStandaloneUseCase(
    (state) => state.measurement.referenceMeasureUnits
  );
  const measurementReferenceMeasurePixels = useStandaloneUseCase(
    (state) => state.measurement.referenceMeasurePixels
  );

  const [units, setUnits] = React.useState<string>(`${measurementUnits}`);
  const [referenceMeasureUnits, setReferenceMeasureUnits] =
    React.useState<string>(`${measurementReferenceMeasureUnits}`);

  return (
    <Dialog
      open={configurationOpen}
      onOpenChange={(open) => setConfigurationOpen(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-4/12 max-w-4/12 translate-y-0">
          <div className="w-full h-full flex flex-col gap-5">
            <DialogHeader>
              <div className="w-full flex gap-5 justify-between items-center">
                <DialogTitle className="font-inter text-2xl font-normal uppercase">
                  Configuration
                </DialogTitle>
                <DialogClose asChild>
                  <button
                    className="cursor-pointer bg-transparent hover:bg-accent p-[2px]"
                    onClick={() => {
                      setConfigurationOpen(false);
                    }}
                  >
                    <X size={16} strokeWidth={1} />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full h-full"
            >
              <div className="bg-[#c9c9c9] w-full">
                <TabsList className="bg-transparent p-3 h-10 gap-3">
                  <TabsTrigger
                    className="font-inter text-base cursor-pointer rounded-none uppercase"
                    value="measurement"
                  >
                    Measurement
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="measurement">
                <DialogDescription className="font-inter text-sm my-5">
                  Setup measurement configuration.
                </DialogDescription>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col justify-start items-start gap-0">
                    <Label className="mb-2">Units</Label>
                    <Input
                      type="text"
                      className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                      value={units}
                      onChange={(e) => {
                        setUnits(e.target.value);
                      }}
                      onFocus={() => {
                        window.weaveOnFieldFocus = true;
                      }}
                      onBlurCapture={() => {
                        window.weaveOnFieldFocus = false;
                      }}
                    />
                    <p className="font-inter text-xs mt-2">
                      Define the units of measurement (e.g., cms, meters,
                      inches).
                    </p>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-2">
                    <Label className="mb-2">Reference distance</Label>
                    <div className="text-black mb-1 text-sm font-inter font-light">
                      {measurementReferenceMeasurePixels ?? "not defined"}
                    </div>
                    <p className="font-inter text-xs mt-2">
                      Distance measured in pixels between two points at base
                      scale (100%). Use the measure tool to measure a distance
                      and set it as reference, the distance of this measure
                      should correspond to the real world distance defined in
                      the &quot;Reference measure&quot;.
                    </p>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-0">
                    <Label className="mb-2">Reference measure</Label>
                    <Input
                      type="text"
                      className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                      value={referenceMeasureUnits}
                      onChange={(e) => {
                        setReferenceMeasureUnits(e.target.value);
                      }}
                      onFocus={() => {
                        window.weaveOnFieldFocus = true;
                      }}
                      onBlurCapture={() => {
                        window.weaveOnFieldFocus = false;
                      }}
                    />
                    <p className="font-inter text-xs mt-2">
                      Define a reference measure for the defined unit.
                    </p>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-2">
                    <Label className="mb-2">Scale</Label>
                    <div className="text-black mb-1 text-sm font-inter font-light">
                      {measurementReferenceMeasurePixels
                        ? `1:${Number(
                            (
                              measurementReferenceMeasurePixels /
                              Number.parseFloat(referenceMeasureUnits)
                            ).toFixed(6)
                          ).valueOf()}`
                        : "not defined"}
                    </div>
                    <p className="font-inter text-xs mt-2">
                      Scale defined as pixels per unit of measure. Used to
                      measure distances in the room.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
            <DialogFooter>
              <Button
                type="button"
                disabled={
                  selectedTab === "measurement" &&
                  !(
                    units.length > 0 &&
                    Number.isInteger(Number.parseInt(referenceMeasureUnits))
                  )
                }
                className="cursor-pointer font-inter rounded-none"
                onClick={() => {
                  if (!instance) {
                    return;
                  }

                  if (selectedTab === "measurement") {
                    const actualSavedConfig = JSON.parse(
                      sessionStorage.getItem(
                        `weave.js_standalone_${instanceId}_${managingImageId}_config`
                      ) || "{}"
                    );

                    const updatedConfig = {
                      units,
                      referenceMeasureUnits: Number.parseFloat(
                        referenceMeasureUnits
                      ),
                      referenceMeasurePixels: measurementReferenceMeasurePixels,
                    };

                    const finalConfiguration = merge(
                      actualSavedConfig,
                      updatedConfig
                    );

                    sessionStorage.setItem(
                      `weave.js_standalone_${instanceId}_${managingImageId}_config`,
                      JSON.stringify(finalConfiguration)
                    );

                    const scale =
                      (measurementReferenceMeasurePixels ?? 0) /
                      Number.parseFloat(referenceMeasureUnits);
                    instance.emitEvent("onMeasureReferenceChange", {
                      unit: units,
                      unitPerPixel: scale,
                    });

                    setMeasurement(
                      units,
                      Number.parseFloat(referenceMeasureUnits)
                    );
                  }

                  setConfigurationOpen(false);
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
