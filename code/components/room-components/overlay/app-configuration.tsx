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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { X } from "lucide-react";
import { useCollaborationRoom } from "@/store/store";

export function AppConfigurationDialog() {
  const configurationOpen = useCollaborationRoom(
    (state) => state.configuration.open
  );
  const setConfigurationOpen = useCollaborationRoom(
    (state) => state.setConfigurationOpen
  );
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

  return (
    <Dialog
      open={configurationOpen}
      onOpenChange={(open) => setConfigurationOpen(open)}
    >
      <form>
        <DialogContent className="sm:max-w-[600px]">
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
            <DialogDescription className="font-inter text-sm mt-5">
              Setup the application configuration.
            </DialogDescription>
            <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          </DialogHeader>
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
                  this can help improve performance by setting fixed canvas
                  size, not greater than 1920x1080 and scaling the canvas via
                  CSS Transforms, mainly to use GPU acceleration.
                </p>
                <p className="text-xs">
                  The downside is that the visual quality may be lower due to
                  the scaling.
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
          <div className="w-full h-[1px] bg-[#c9c9c9] my-3"></div>
          <DialogFooter>
            <Button
              type="button"
              disabled={
                !(
                  Number.isInteger(Number.parseInt(baseWidthValue)) &&
                  Number.isInteger(Number.parseInt(baseHeightValue)) &&
                  Number.isInteger(Number.parseInt(multiplierValue))
                )
              }
              className="cursor-pointer font-inter rounded-none"
              onClick={() => {
                if (upscale) {
                  sessionStorage.setItem(
                    "weave_ai_configuration",
                    JSON.stringify({
                      open: false,
                      upscale: {
                        enabled: upscale,
                        baseWidth: Number.parseInt(baseWidthValue),
                        baseHeight: Number.parseInt(baseHeightValue),
                        multiplier: Number.parseInt(multiplierValue),
                      },
                    })
                  );

                  setConfiguration(
                    upscale,
                    Number.parseInt(baseWidthValue),
                    Number.parseInt(baseHeightValue),
                    Number.parseInt(multiplierValue)
                  );
                } else {
                  sessionStorage.setItem(
                    "weave_ai_configuration",
                    JSON.stringify({
                      open: false,
                      upscale: {
                        enabled: false,
                        baseWidth: 1920,
                        baseHeight: 1080,
                        multiplier: 1,
                      },
                    })
                  );

                  setConfiguration(false, 1920, 1080, 1);
                }

                setConfigurationOpen(false);
              }}
            >
              SAVE
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
