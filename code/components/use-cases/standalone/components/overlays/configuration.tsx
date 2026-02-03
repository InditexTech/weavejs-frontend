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
import { useMeasuresInfo } from "../../hooks/use-measures-info";

export function ConfigurationDialog() {
  const instance = useWeave((state) => state.instance);

  const [selectedTab, setSelectedTab] = React.useState<string>("measurement");

  const instanceId = useStandaloneUseCase((state) => state.instanceId);
  const managingImageId = useStandaloneUseCase(
    (state) => state.managing.imageId
  );
  const measurementUnit = useStandaloneUseCase(
    (state) => state.measurement.unit
  );
  const configurationOpen = useStandaloneUseCase(
    (state) => state.configuration.open
  );
  const setConfigurationOpen = useStandaloneUseCase(
    (state) => state.setConfigurationOpen
  );
  const setMeasureUnit = useStandaloneUseCase((state) => state.setMeasureUnit);

  const { scale } = useMeasuresInfo();

  const [unit, setUnit] = React.useState<string>(measurementUnit || "cms");

  React.useEffect(() => {
    setUnit(measurementUnit || "cms");
  }, [measurementUnit]);

  return (
    <Dialog
      open={configurationOpen}
      onOpenChange={(open) => setConfigurationOpen(open)}
    >
      <form>
        <DialogContent className="w-full rounded-none top-5 min-w-2/12 max-w-2/12 translate-y-0">
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
                      value={unit}
                      onChange={(e) => {
                        setUnit(e.target.value);
                      }}
                      onFocus={() => {
                        window.weaveOnFieldFocus = true;
                      }}
                      onBlurCapture={() => {
                        window.weaveOnFieldFocus = false;
                      }}
                    />
                    <p className="font-inter text-xs mt-2">
                      Define the units of thee custom measurement (e.g., cms,
                      meters, inches).
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="w-full min-h-[1px] h-[1px] bg-[#c9c9c9] my-3"></div>
            <DialogFooter>
              <Button
                type="button"
                disabled={selectedTab === "measurement" && !(unit.length > 0)}
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
                      measurement: {
                        unit,
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

                    instance.emitEvent("onMeasureReferenceChange", {
                      unit: finalConfiguration.measurement.unit,
                      unitPerPixel: scale,
                    });

                    setMeasureUnit(unit);
                    setUnit(unit);
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
