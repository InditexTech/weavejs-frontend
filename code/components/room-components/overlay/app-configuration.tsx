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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";
import { merge } from "lodash";
import { useWeave } from "@inditextech/weave-react";

export function AppConfigurationDialog() {
  const instance = useWeave((state) => state.instance);

  const [selectedTab, setSelectedTab] = React.useState<string>("performance");

  const room = useCollaborationRoom((state) => state.room);
  const configurationOpen = useCollaborationRoom(
    (state) => state.configuration.open
  );
  const setConfigurationOpen = useCollaborationRoom(
    (state) => state.setConfigurationOpen
  );
  const setMeasurement = useCollaborationRoom((state) => state.setMeasurement);
  const upscaleEnabled = useCollaborationRoom(
    (state) => state.configuration.upscale.enabled
  );
  const upscaleBaseWidth = useCollaborationRoom(
    (state) => state.configuration.upscale.baseWidth
  );
  const upscaleBaseHeight = useCollaborationRoom(
    (state) => state.configuration.upscale.baseHeight
  );
  const upscaleMultiplier = useCollaborationRoom(
    (state) => state.configuration.upscale.multiplier
  );
  const measurementUnits = useCollaborationRoom(
    (state) => state.measurement.units
  );
  const measurementReferenceMeasureUnits = useCollaborationRoom(
    (state) => state.measurement.referenceMeasureUnits
  );
  const measurementReferenceMeasurePixels = useCollaborationRoom(
    (state) => state.measurement.referenceMeasurePixels
  );
  const setConfiguration = useCollaborationRoom(
    (state) => state.setConfiguration
  );

  const [upscale, setUpscale] = React.useState<boolean>(upscaleEnabled);
  const [baseWidthValue, setBaseWidthValue] = React.useState<string>(
    `${upscaleBaseWidth}`
  );
  const [baseHeightValue, setBaseHeightValue] = React.useState<string>(
    `${upscaleBaseHeight}`
  );
  const [multiplierValue, setMultiplierValue] = React.useState<string>(
    `${upscaleMultiplier}`
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
                    value="performance"
                  >
                    Performance
                  </TabsTrigger>
                  <TabsTrigger
                    className="font-inter text-base cursor-pointer rounded-none uppercase"
                    value="measuring"
                  >
                    Measurement
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="performance">
                <DialogDescription className="font-inter text-sm my-5 mb-7">
                  Configuration that can help improve performance.
                </DialogDescription>
                <div className="grid gap-4">
                  <div className="flex justify-start items-start gap-2">
                    <Checkbox
                      id="upscale"
                      checked={upscale}
                      onPointerDown={() => {
                        setUpscale(!upscale);
                      }}
                    />
                    <div className="w-full flex flex-col gap-2 justify-start items-start">
                      <Label
                        htmlFor="upscale"
                        onPointerDown={() => {
                          setUpscale(!upscale);
                        }}
                      >
                        Upscaling
                      </Label>
                      <p className="text-xs">
                        this can help improve performance by setting fixed
                        canvas size, not greater than 1920x1080 and scaling the
                        canvas via CSS Transforms, mainly to use GPU
                        acceleration.
                      </p>
                      <p className="text-xs">
                        The downside is that the visual quality may be lower due
                        to the scaling.
                      </p>
                      <p className="text-xs text-[#CC0000] font-bold">
                        To take effect, the application needs to be reloaded.
                      </p>
                      {upscale && (
                        <div className="grid grid-cols-2 w-full gap-4 mt-2">
                          <div className="flex flex-col justify-start items-start gap-2">
                            <Label htmlFor="baseWidth">Base Width</Label>
                            <Input
                              id="baseWidth"
                              type="text"
                              className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                              value={baseWidthValue}
                              onChange={(e) => {
                                setBaseWidthValue(e.target.value);
                              }}
                              onFocus={() => {
                                window.weaveOnFieldFocus = true;
                              }}
                              onBlurCapture={() => {
                                window.weaveOnFieldFocus = false;
                              }}
                            />
                          </div>
                          <div className="flex flex-col justify-start items-start gap-2">
                            <Label htmlFor="baseHeight">Base Height</Label>
                            <Input
                              id="baseHeight"
                              type="text"
                              className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                              value={baseHeightValue}
                              onChange={(e) => {
                                setBaseHeightValue(e.target.value);
                              }}
                              onFocus={() => {
                                window.weaveOnFieldFocus = true;
                              }}
                              onBlurCapture={() => {
                                window.weaveOnFieldFocus = false;
                              }}
                            />
                          </div>
                          <div className="flex flex-col justify-start items-start gap-2">
                            <Label htmlFor="multiplier">Multiplier</Label>
                            <Input
                              id="multiplier"
                              type="text"
                              className="w-full py-0 h-[40px] rounded-none !text-[14px] !border-black font-normal text-black text-left focus:outline-none bg-transparent shadow-none"
                              value={multiplierValue}
                              onChange={(e) => {
                                setMultiplierValue(e.target.value);
                              }}
                              onFocus={() => {
                                window.weaveOnFieldFocus = true;
                              }}
                              onBlurCapture={() => {
                                window.weaveOnFieldFocus = false;
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="measuring">
                <DialogDescription className="font-inter text-sm my-5">
                  Setup measuring tool configuration.
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
                  (selectedTab === "performance" &&
                    !(
                      Number.isInteger(Number.parseInt(baseWidthValue)) &&
                      Number.isInteger(Number.parseInt(baseHeightValue)) &&
                      Number.isInteger(Number.parseInt(multiplierValue))
                    )) ||
                  (selectedTab === "measuring" &&
                    !(
                      units.length > 0 &&
                      Number.isInteger(Number.parseInt(referenceMeasureUnits))
                    ))
                }
                className="cursor-pointer font-inter rounded-none"
                onClick={() => {
                  if (!instance) {
                    return;
                  }

                  if (selectedTab === "performance") {
                    const actualSavedConfig = JSON.parse(
                      sessionStorage.getItem("weave_ai_configuration") || "{}"
                    );

                    if (upscale) {
                      const finalConfiguration = merge(actualSavedConfig, {
                        open: false,
                        upscale: {
                          enabled: upscale,
                          baseWidth: Number.parseInt(baseWidthValue),
                          baseHeight: Number.parseInt(baseHeightValue),
                          multiplier: Number.parseInt(multiplierValue),
                        },
                      });

                      sessionStorage.setItem(
                        "weave_ai_configuration",
                        JSON.stringify(finalConfiguration)
                      );

                      setConfiguration(
                        upscale,
                        Number.parseInt(baseWidthValue),
                        Number.parseInt(baseHeightValue),
                        Number.parseInt(multiplierValue)
                      );
                    } else {
                      const finalConfiguration = merge(actualSavedConfig, {
                        open: false,
                        upscale: {
                          enabled: false,
                          baseWidth: 1920,
                          baseHeight: 1080,
                          multiplier: 1,
                        },
                      });

                      sessionStorage.setItem(
                        "weave_ai_configuration",
                        JSON.stringify(finalConfiguration)
                      );

                      sessionStorage.setItem(
                        "weave_ai_configuration",
                        JSON.stringify(finalConfiguration)
                      );

                      setConfiguration(false, 1920, 1080, 1);
                    }
                  }

                  if (selectedTab === "measuring") {
                    const actualSavedConfig = JSON.parse(
                      sessionStorage.getItem(
                        `weave_measurement_config_${room}`
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
                      `weave_measurement_config_${room}`,
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
