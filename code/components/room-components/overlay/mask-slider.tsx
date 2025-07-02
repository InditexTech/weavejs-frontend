// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { useWeave } from "@inditextech/weave-react";
import { Slider } from "@/components/ui/slider";

export function MaskSlider() {
  const instance = useWeave((state) => state.instance);
  const [sliderValue, setSliderValue] = React.useState(20);
  const actualAction = useWeave((state) => state.actions.actual);

  if (actualAction !== "fuzzyMaskTool") return null;

  return (
    <div className="absolute bottom-[72px] left-0 right-0 flex justify-center items-center flex justify-center items-center">
      <div className="flex gap-2 w-[320px] bg-white px-3 py-3 border rounded-full border-[#c9c9c9]">
        <div className="whitespace-nowrap font-inter text-xs">Mask size</div>
        <Slider
          value={[sliderValue]}
          onValueChange={(value) => {
            setSliderValue(value[0]);
            if (instance) {
              instance.updatePropsAction(actualAction, {
                radius: value[0],
              });
            }
          }}
          min={1}
          max={100}
          step={1}
        />
        <div className="whitespace-nowrap font-inter text-xs">
          {sliderValue}px
        </div>
      </div>
    </div>
  );
}
