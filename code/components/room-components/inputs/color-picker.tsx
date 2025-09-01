// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React, { FormEventHandler } from "react";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/kibo-ui/color-picker";

type ColorPickerInputProps = FormEventHandler<HTMLDivElement> & {
  value: string;
  onChange: (value: string) => void;
};

export const ColorPickerInput = ({
  value,
  onChange,
}: Readonly<ColorPickerInputProps>) => {
  const [eyeDropperSupport, setEyeDropperSupport] = React.useState(false);

  React.useEffect(() => {
    let hasSupport = true;
    // @ts-expect-error: API not available in safari
    if (!window.EyeDropper) {
      hasSupport = false;
    }
    setEyeDropperSupport(hasSupport);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnChange: any = React.useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <ColorPicker
      className="max-w-sm rounded-none border-0 bg-background p-0 gap-1"
      defaultValue={undefined}
      value={value}
      onChange={handleOnChange}
    >
      <ColorPickerSelection
        value={value}
        className="w-full h-[200px] rounded-none font-inter"
      />
      <div className="flex items-center gap-1">
        {eyeDropperSupport && (
          <ColorPickerEyeDropper className="rounded-none" />
        )}
        <div className="grid w-full gap-1">
          <ColorPickerHue className="rounded-none" />
          <ColorPickerAlpha className="rounded-none" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ColorPickerOutput className="rounded-none font-inter py-0 !h-[40px]" />
        <ColorPickerFormat className="rounded-none font-inter" />
      </div>
    </ColorPicker>
  );
};
